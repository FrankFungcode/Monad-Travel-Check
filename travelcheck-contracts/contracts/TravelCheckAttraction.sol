// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TravelCheckAttraction
 * @notice Attraction check-in task contract
 * @dev Platform creates tasks with pre-deposited ETH/MON rewards
 *      Users can accept and complete tasks to earn rewards
 *      GPS verification is done off-chain, completion requires server signature
 */
contract TravelCheckAttraction is Ownable, ReentrancyGuard {

    // ============ Enums ============

    enum TaskStatus { ACTIVE, PAUSED, COMPLETED, CANCELLED }

    // ============ Structs ============

    struct Task {
        uint256 id;                 // Task ID
        string name;                // Task name
        string description;         // Task description
        int256 latitude;            // Attraction latitude × 10^6
        int256 longitude;           // Attraction longitude × 10^6
        uint256 radius;             // Valid check-in radius (meters)
        uint256 rewardPerUser;      // Reward amount per user
        uint256 totalSlots;         // Total available slots
        uint256 claimedSlots;       // Completed count
        uint256 startTime;          // Start timestamp
        uint256 endTime;            // End timestamp
        TaskStatus status;          // Task status
        uint256 remainingReward;    // Remaining reward pool
    }

    struct UserTaskInfo {
        bool accepted;              // Has accepted the task
        bool completed;             // Has completed the task
        uint256 acceptedAt;         // Accept timestamp
        uint256 completedAt;        // Completion timestamp
        bytes32 contentHash;        // Check-in content hash
    }

    // ============ State Variables ============

    // Task ID => Task details
    mapping(uint256 => Task) public tasks;

    // Task ID => User address => User task info
    mapping(uint256 => mapping(address => UserTaskInfo)) public userTasks;

    // User address => Array of accepted task IDs
    mapping(address => uint256[]) public userAcceptedTasks;

    // Next task ID
    uint256 public nextTaskId;

    // Signature verification address
    address public signer;

    // Used signatures (prevent reuse)
    mapping(bytes32 => bool) public usedSignatures;

    // ============ Events ============

    event TaskCreated(
        uint256 indexed taskId,
        string name,
        uint256 rewardPerUser,
        uint256 totalSlots,
        int256 latitude,
        int256 longitude
    );

    event TaskAccepted(
        uint256 indexed taskId,
        address indexed user
    );

    event TaskCompleted(
        uint256 indexed taskId,
        address indexed user,
        uint256 reward,
        bytes32 contentHash
    );

    event TaskStatusChanged(
        uint256 indexed taskId,
        TaskStatus status
    );

    event TaskCancelled(
        uint256 indexed taskId,
        uint256 refundAmount
    );

    event RewardAdded(
        uint256 indexed taskId,
        uint256 amount,
        uint256 additionalSlots
    );

    event SignerUpdated(address indexed newSigner);

    // ============ Constructor ============

    /**
     * @dev Constructor
     * @param initialOwner Owner address
     * @param _signer Signature verification address
     */
    constructor(address initialOwner, address _signer) Ownable(initialOwner) {
        require(_signer != address(0), "Invalid signer");
        signer = _signer;
    }

    // Accept ETH for reward pool
    receive() external payable {}

    // ============ Platform Management Functions ============

    /**
     * @notice Create a new attraction task
     * @param name Task name
     * @param description Task description
     * @param latitude Latitude × 10^6
     * @param longitude Longitude × 10^6
     * @param radius Valid check-in radius (meters)
     * @param rewardPerUser Reward per user
     * @param totalSlots Total available slots
     * @param startTime Start timestamp
     * @param endTime End timestamp
     */
    function createTask(
        string calldata name,
        string calldata description,
        int256 latitude,
        int256 longitude,
        uint256 radius,
        uint256 rewardPerUser,
        uint256 totalSlots,
        uint256 startTime,
        uint256 endTime
    ) external payable onlyOwner {
        // Validate parameters
        require(bytes(name).length > 0, "Empty name");
        require(rewardPerUser > 0, "Invalid reward");
        require(totalSlots > 0, "Invalid slots");
        require(endTime > startTime, "Invalid time range");
        // Allow startTime to be current time or slightly in the past (within 5 minutes) for immediate start
        require(startTime + 300 >= block.timestamp, "Start time too far in past");
        require(radius > 0 && radius <= 10000, "Invalid radius"); // Max 10km

        // Verify deposited amount
        uint256 totalReward = rewardPerUser * totalSlots;
        require(msg.value >= totalReward, "Insufficient reward deposit");

        // Create task
        uint256 taskId = nextTaskId++;
        tasks[taskId] = Task({
            id: taskId,
            name: name,
            description: description,
            latitude: latitude,
            longitude: longitude,
            radius: radius,
            rewardPerUser: rewardPerUser,
            totalSlots: totalSlots,
            claimedSlots: 0,
            startTime: startTime,
            endTime: endTime,
            status: TaskStatus.ACTIVE,
            remainingReward: totalReward
        });

        // Refund excess amount
        if (msg.value > totalReward) {
            (bool success, ) = msg.sender.call{value: msg.value - totalReward}("");
            require(success, "Refund failed");
        }

        emit TaskCreated(taskId, name, rewardPerUser, totalSlots, latitude, longitude);
    }

    /**
     * @notice Pause a task
     * @param taskId Task ID
     */
    function pauseTask(uint256 taskId) external onlyOwner {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.ACTIVE, "Task not active");

        task.status = TaskStatus.PAUSED;
        emit TaskStatusChanged(taskId, TaskStatus.PAUSED);
    }

    /**
     * @notice Resume a paused task
     * @param taskId Task ID
     */
    function resumeTask(uint256 taskId) external onlyOwner {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.PAUSED, "Task not paused");

        task.status = TaskStatus.ACTIVE;
        emit TaskStatusChanged(taskId, TaskStatus.ACTIVE);
    }

    /**
     * @notice Cancel a task and refund remaining rewards
     * @param taskId Task ID
     */
    function cancelTask(uint256 taskId) external onlyOwner nonReentrant {
        Task storage task = tasks[taskId];
        require(
            task.status == TaskStatus.ACTIVE || task.status == TaskStatus.PAUSED,
            "Cannot cancel"
        );

        uint256 refundAmount = task.remainingReward;
        task.status = TaskStatus.CANCELLED;
        task.remainingReward = 0;

        if (refundAmount > 0) {
            (bool success, ) = msg.sender.call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit TaskCancelled(taskId, refundAmount);
    }

    /**
     * @notice Add more rewards to a task
     * @param taskId Task ID
     */
    function addReward(uint256 taskId) external payable onlyOwner {
        Task storage task = tasks[taskId];
        require(task.status != TaskStatus.CANCELLED, "Task cancelled");
        require(msg.value > 0, "No value sent");

        task.remainingReward += msg.value;

        // Calculate additional slots
        uint256 additionalSlots = msg.value / task.rewardPerUser;
        task.totalSlots += additionalSlots;

        emit RewardAdded(taskId, msg.value, additionalSlots);
    }

    // ============ User Functions ============

    /**
     * @notice Accept a task
     * @param taskId Task ID
     */
    function acceptTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        UserTaskInfo storage userTask = userTasks[taskId][msg.sender];

        // Validations
        require(task.status == TaskStatus.ACTIVE, "Task not active");
        require(block.timestamp >= task.startTime, "Task not started");
        require(block.timestamp <= task.endTime, "Task ended");
        require(!userTask.accepted, "Already accepted");
        require(task.claimedSlots < task.totalSlots, "No slots available");

        // Record acceptance
        userTask.accepted = true;
        userTask.acceptedAt = block.timestamp;
        userAcceptedTasks[msg.sender].push(taskId);

        emit TaskAccepted(taskId, msg.sender);
    }

    /**
     * @notice Complete a task (requires server signature for GPS verification)
     * @param taskId Task ID
     * @param contentHash Check-in content hash
     * @param latitude User latitude × 10^6
     * @param longitude User longitude × 10^6
     * @param expiry Signature expiry timestamp
     * @param signature Server signature
     */
    function completeTask(
        uint256 taskId,
        bytes32 contentHash,
        int256 latitude,
        int256 longitude,
        uint256 expiry,
        bytes calldata signature
    ) external nonReentrant {
        Task storage task = tasks[taskId];
        UserTaskInfo storage userTask = userTasks[taskId][msg.sender];

        // Basic validations
        require(task.status == TaskStatus.ACTIVE, "Task not active");
        require(userTask.accepted, "Not accepted");
        require(!userTask.completed, "Already completed");
        require(block.timestamp <= task.endTime, "Task ended");
        require(block.timestamp <= expiry, "Signature expired");
        require(task.remainingReward >= task.rewardPerUser, "Insufficient reward");

        // Construct message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            taskId,
            msg.sender,
            contentHash,
            latitude,
            longitude,
            expiry
        ));

        // Prevent signature reuse
        require(!usedSignatures[messageHash], "Signature already used");
        usedSignatures[messageHash] = true;

        // Verify signature
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        require(_recoverSigner(ethSignedHash, signature) == signer, "Invalid signature");

        // Update state
        userTask.completed = true;
        userTask.completedAt = block.timestamp;
        userTask.contentHash = contentHash;
        task.claimedSlots++;
        task.remainingReward -= task.rewardPerUser;

        // Check if task is fully completed
        if (task.claimedSlots >= task.totalSlots) {
            task.status = TaskStatus.COMPLETED;
            emit TaskStatusChanged(taskId, TaskStatus.COMPLETED);
        }

        // Transfer reward
        (bool success, ) = msg.sender.call{value: task.rewardPerUser}("");
        require(success, "Transfer failed");

        emit TaskCompleted(taskId, msg.sender, task.rewardPerUser, contentHash);
    }

    // ============ Query Functions ============

    /**
     * @notice Get task details
     * @param taskId Task ID
     * @return Task struct
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    /**
     * @notice Get user's task info
     * @param taskId Task ID
     * @param user User address
     * @return UserTaskInfo struct
     */
    function getUserTaskInfo(uint256 taskId, address user) external view returns (UserTaskInfo memory) {
        return userTasks[taskId][user];
    }

    /**
     * @notice Get user's accepted task IDs
     * @param user User address
     * @return Array of task IDs
     */
    function getUserAcceptedTasks(address user) external view returns (uint256[] memory) {
        return userAcceptedTasks[user];
    }

    /**
     * @notice Check if a task is acceptable
     * @param taskId Task ID
     * @return Whether the task can be accepted
     */
    function isTaskAcceptable(uint256 taskId) external view returns (bool) {
        Task storage task = tasks[taskId];
        return task.status == TaskStatus.ACTIVE &&
               block.timestamp >= task.startTime &&
               block.timestamp <= task.endTime &&
               task.claimedSlots < task.totalSlots;
    }

    /**
     * @notice Get remaining slots for a task
     * @param taskId Task ID
     * @return Number of remaining slots
     */
    function getRemainingSlots(uint256 taskId) external view returns (uint256) {
        Task storage task = tasks[taskId];
        if (task.totalSlots <= task.claimedSlots) return 0;
        return task.totalSlots - task.claimedSlots;
    }

    /**
     * @notice Get total task count
     * @return Number of tasks created
     */
    function getTaskCount() external view returns (uint256) {
        return nextTaskId;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update signer address
     * @param _signer New signer address
     */
    function setSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        signer = _signer;
        emit SignerUpdated(_signer);
    }

    /**
     * @notice Emergency withdraw (only owner, for emergencies)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ Internal Functions ============

    /**
     * @dev Recover signer from signature
     */
    function _recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature v value");
        return ecrecover(hash, v, r, s);
    }
}
