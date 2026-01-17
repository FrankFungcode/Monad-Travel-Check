// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TravelCheckStaking
 * @dev Staking contract for TravelCheck platform
 * Supports two stake types: daily and attraction
 * Two modes: sealed (higher rewards, locked) and anytime (lower rewards, flexible)
 * Staking Asset: Native Currency (ETH / MON)
 * Features: Check-in records on-chain, red packet rewards
 */
contract TravelCheckStaking is Ownable, ReentrancyGuard {
    enum StakeType {
        DAILY,
        ATTRACTION
    }
    enum StakeMode {
        SEALED,
        ANYTIME
    }
    enum StakeStatus {
        ACTIVE,
        COMPLETED,
        WITHDRAWN
    }

    struct Stake {
        address user;
        StakeType stakeType;
        uint256 amount;
        uint256 milestone; // in days
        StakeMode mode;
        uint256 checkedDays;
        bool isPerfect;
        uint256 accumulatedInterest;
        StakeStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 completedAt;
        uint256 withdrawnAt;
    }

    // Check-in record structure
    struct CheckinRecord {
        uint256 timestamp; // Check-in timestamp
        bytes32 contentHash; // SHA256 hash of check-in content
        int256 latitude; // Latitude × 10^6 (e.g., 31234567 = 31.234567°)
        int256 longitude; // Longitude × 10^6
    }

    // Red packet tier configuration
    struct RedPacketTier {
        uint256 progressBps; // Progress threshold (basis points, 2000 = 20%)
        uint256 maxRateBps; // Max red packet rate (basis points, 100 = 1%)
    }

    // Interest rates (basis points, 1% = 100)
    mapping(uint256 => uint256) public sealedRates; // milestone => rate
    mapping(uint256 => uint256) public anytimeRates; // milestone => rate

    // Staking data
    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256[]) public userStakes;
    uint256 public nextStakeId;

    // Check-in records: stakeId => CheckinRecord[]
    mapping(uint256 => CheckinRecord[]) public checkinRecords;

    // Red packet related
    address public signer; // Server signature address
    mapping(bytes32 => bool) public usedSignatures; // Prevent signature reuse
    mapping(uint256 => uint256) public redPacketClaimed; // stakeId => total claimed amount
    RedPacketTier[] public redPacketTiers; // Red packet tier config

    // Constants
    uint256 public constant MIN_STAKE_AMOUNT = 0.0001 ether; // Lower limit for native currency
    uint256 public constant MAX_STAKE_AMOUNT = 1000 ether;
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000
    uint256 public constant MIN_RED_PACKET_RATE = 10; // Minimum red packet rate (0.1%)
    uint256 public constant RED_PACKET_EXPIRY = 24 hours; // Red packet validity period

    // Events
    event StakeCreated(
        uint256 indexed stakeId,
        address indexed user,
        StakeType stakeType,
        uint256 amount,
        uint256 milestone,
        StakeMode mode
    );
    event CheckedIn(
        uint256 indexed stakeId,
        uint256 checkedDays,
        bytes32 contentHash,
        int256 latitude,
        int256 longitude
    );
    event InterestCalculated(uint256 indexed stakeId, uint256 interest);
    event StakeWithdrawn(uint256 indexed stakeId, uint256 totalAmount);
    event RedPacketClaimed(
        uint256 indexed stakeId,
        uint256 indexed checkinIndex,
        address indexed user,
        uint256 amount
    );
    event SignerUpdated(address indexed newSigner);
    event RedPacketTierUpdated(
        uint256 indexed index,
        uint256 progressBps,
        uint256 maxRateBps
    );

    /**
     * @dev Constructor
     * @param initialOwner Address to receive ownership
     * @param _signer Address for signature verification (server's public key)
     */
    constructor(address initialOwner, address _signer) Ownable(initialOwner) {
        require(_signer != address(0), "Invalid signer address");
        signer = _signer;

        // Set interest rates (sealed mode)
        sealedRates[10] = 500; // 5%
        sealedRates[20] = 800; // 8%
        sealedRates[30] = 1400; // 14%
        sealedRates[50] = 2000; // 20%

        // Set interest rates (anytime mode - half of sealed)
        anytimeRates[10] = 250; // 2.5%
        anytimeRates[20] = 400; // 4%
        anytimeRates[30] = 700; // 7%
        anytimeRates[50] = 1000; // 10%

        // Initialize red packet tiers
        // Progress 0-20%: max 1%
        redPacketTiers.push(RedPacketTier(2000, 100));
        // Progress 20-50%: max 2%
        redPacketTiers.push(RedPacketTier(5000, 200));
        // Progress 50-80%: max 3%
        redPacketTiers.push(RedPacketTier(8000, 300));
        // Progress 80-99%: max 5%
        redPacketTiers.push(RedPacketTier(9900, 500));
        // Progress 100%: max 10% (final bonus)
        redPacketTiers.push(RedPacketTier(10000, 1000));
    }

    // Accept ETH from anyone (for funding rewards)
    receive() external payable {}

    /**
     * @dev Create a new stake
     * @param stakeType Type of stake (DAILY or ATTRACTION)
     * @param milestone Duration in days (10, 20, 30, or 50)
     * @param mode Stake mode (SEALED or ANYTIME)
     */
    function createStake(
        StakeType stakeType,
        uint256 milestone,
        StakeMode mode
    ) external payable nonReentrant returns (uint256) {
        uint256 amount = msg.value;
        require(amount >= MIN_STAKE_AMOUNT, "Amount too low");
        require(amount <= MAX_STAKE_AMOUNT, "Amount too high");
        require(
            milestone == 10 ||
                milestone == 20 ||
                milestone == 30 ||
                milestone == 50,
            "Invalid milestone"
        );

        // Create stake
        uint256 stakeId = nextStakeId++;
        stakes[stakeId] = Stake({
            user: msg.sender,
            stakeType: stakeType,
            amount: amount,
            milestone: milestone,
            mode: mode,
            checkedDays: 0,
            isPerfect: true,
            accumulatedInterest: 0,
            status: StakeStatus.ACTIVE,
            startTime: block.timestamp,
            endTime: block.timestamp + (milestone * 1 days),
            completedAt: 0,
            withdrawnAt: 0
        });

        userStakes[msg.sender].push(stakeId);

        emit StakeCreated(
            stakeId,
            msg.sender,
            stakeType,
            amount,
            milestone,
            mode
        );
        return stakeId;
    }

    /**
     * @dev Check in for a stake with content hash and location
     * @param stakeId ID of the stake
     * @param contentHash SHA256 hash of check-in content (stored on server)
     * @param latitude Latitude × 10^6
     * @param longitude Longitude × 10^6
     */
    function checkIn(
        uint256 stakeId,
        bytes32 contentHash,
        int256 latitude,
        int256 longitude
    ) external {
        Stake storage stake = stakes[stakeId];
        require(stake.user == msg.sender, "Not stake owner");
        require(stake.status == StakeStatus.ACTIVE, "Stake not active");
        require(stake.checkedDays < stake.milestone, "Already completed");

        // Increment check-in count
        stake.checkedDays++;

        // Store check-in record
        checkinRecords[stakeId].push(
            CheckinRecord({
                timestamp: block.timestamp,
                contentHash: contentHash,
                latitude: latitude,
                longitude: longitude
            })
        );

        // Calculate and update interest
        uint256 interest = calculateInterest(stakeId);
        stake.accumulatedInterest = interest;
        emit InterestCalculated(stakeId, interest);

        // Check if milestone completed
        if (stake.checkedDays >= stake.milestone) {
            stake.status = StakeStatus.COMPLETED;
            stake.completedAt = block.timestamp;
        }

        emit CheckedIn(
            stakeId,
            stake.checkedDays,
            contentHash,
            latitude,
            longitude
        );
    }

    /**
     * @dev Mark stake as not perfect (missed check-in)
     * @param stakeId ID of the stake
     */
    function markImperfect(uint256 stakeId) external onlyOwner {
        Stake storage stake = stakes[stakeId];
        stake.isPerfect = false;
    }

    /**
     * @dev Calculate interest for a stake
     * @param stakeId ID of the stake
     * @return Calculated interest amount
     */
    function calculateInterest(uint256 stakeId) public view returns (uint256) {
        Stake memory stake = stakes[stakeId];

        // Get appropriate interest rate
        uint256 rate = stake.mode == StakeMode.SEALED
            ? sealedRates[stake.milestone]
            : anytimeRates[stake.milestone];

        // Calculate base interest
        uint256 progress = (stake.checkedDays * BASIS_POINTS) / stake.milestone;
        uint256 interest = (stake.amount * rate * progress) /
            (BASIS_POINTS * BASIS_POINTS);

        // Apply 50% penalty if not perfect and sealed mode
        if (!stake.isPerfect && stake.mode == StakeMode.SEALED) {
            interest = interest / 2;
        }

        return interest;
    }

    /**
     * @dev Withdraw stake and interest
     * @param stakeId ID of the stake
     */
    function withdraw(uint256 stakeId) external nonReentrant {
        Stake storage stake = stakes[stakeId];
        require(stake.user == msg.sender, "Not stake owner");
        require(stake.status != StakeStatus.WITHDRAWN, "Already withdrawn");

        // Check withdrawal conditions
        if (stake.mode == StakeMode.SEALED) {
            require(
                stake.status == StakeStatus.COMPLETED,
                "Stake not completed"
            );
        }

        // Calculate final interest
        uint256 finalInterest = calculateInterest(stakeId);
        uint256 totalAmount = stake.amount + finalInterest;

        // Update state
        stake.status = StakeStatus.WITHDRAWN;
        stake.withdrawnAt = block.timestamp;
        stake.accumulatedInterest = finalInterest;

        // Transfer ETH
        require(
            address(this).balance >= totalAmount,
            "Insufficent contract balance"
        );
        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit StakeWithdrawn(stakeId, totalAmount);
    }

    /**
     * @dev Get user's stake IDs
     * @param user User address
     * @return Array of stake IDs
     */
    function getUserStakes(
        address user
    ) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get stake details
     * @param stakeId ID of the stake
     * @return Stake struct
     */
    function getStake(uint256 stakeId) external view returns (Stake memory) {
        return stakes[stakeId];
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ Red Packet Functions ============

    /**
     * @dev Claim red packet reward
     * @param stakeId ID of the stake
     * @param checkinIndex Index of the check-in (0-based)
     * @param amount Red packet amount (calculated by server)
     * @param expiry Signature expiry timestamp
     * @param signature Server signature
     */
    function claimRedPacket(
        uint256 stakeId,
        uint256 checkinIndex,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature
    ) external nonReentrant {
        Stake storage stake = stakes[stakeId];

        // Basic validations
        require(stake.user == msg.sender, "Not stake owner");
        require(block.timestamp <= expiry, "Signature expired");
        require(amount > 0, "Invalid amount");
        require(
            checkinIndex < checkinRecords[stakeId].length,
            "Invalid checkin index"
        );

        // Construct message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(stakeId, checkinIndex, amount, expiry, msg.sender)
        );

        // Prevent signature reuse
        require(!usedSignatures[messageHash], "Signature already used");
        usedSignatures[messageHash] = true;

        // Verify signature
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        require(
            _recoverSigner(ethSignedHash, signature) == signer,
            "Invalid signature"
        );

        // Verify amount doesn't exceed max
        uint256 maxAmount = getMaxRedPacketAmount(stakeId);
        require(amount <= maxAmount, "Amount exceeds max");

        // Record claimed amount
        redPacketClaimed[stakeId] += amount;

        // Transfer red packet
        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit RedPacketClaimed(stakeId, checkinIndex, msg.sender, amount);
    }

    /**
     * @dev Get max red packet amount based on current progress
     * @param stakeId ID of the stake
     * @return Maximum red packet amount
     */
    function getMaxRedPacketAmount(
        uint256 stakeId
    ) public view returns (uint256) {
        Stake storage stake = stakes[stakeId];
        if (stake.amount == 0) return 0;

        // Calculate progress in basis points
        uint256 progress = (stake.checkedDays * BASIS_POINTS) / stake.milestone;

        // Find matching tier
        uint256 maxRateBps = MIN_RED_PACKET_RATE; // Default minimum
        for (uint256 i = 0; i < redPacketTiers.length; i++) {
            if (progress <= redPacketTiers[i].progressBps) {
                maxRateBps = redPacketTiers[i].maxRateBps;
                break;
            }
        }

        // Calculate max amount
        return (stake.amount * maxRateBps) / BASIS_POINTS;
    }

    /**
     * @dev Recover signer from signature
     */
    function _recoverSigner(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
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

    // ============ Check-in Query Functions ============

    /**
     * @dev Get all check-in records for a stake
     * @param stakeId ID of the stake
     * @return Array of CheckinRecord
     */
    function getCheckinRecords(
        uint256 stakeId
    ) external view returns (CheckinRecord[] memory) {
        return checkinRecords[stakeId];
    }

    /**
     * @dev Get a single check-in record
     * @param stakeId ID of the stake
     * @param index Check-in index
     * @return CheckinRecord
     */
    function getCheckinRecord(
        uint256 stakeId,
        uint256 index
    ) external view returns (CheckinRecord memory) {
        require(index < checkinRecords[stakeId].length, "Invalid index");
        return checkinRecords[stakeId][index];
    }

    /**
     * @dev Get check-in count for a stake
     * @param stakeId ID of the stake
     * @return Number of check-ins
     */
    function getCheckinCount(uint256 stakeId) external view returns (uint256) {
        return checkinRecords[stakeId].length;
    }

    /**
     * @dev Get red packet tier count
     * @return Number of tiers
     */
    function getRedPacketTierCount() external view returns (uint256) {
        return redPacketTiers.length;
    }

    /**
     * @dev Get red packet tier by index
     * @param index Tier index
     * @return RedPacketTier
     */
    function getRedPacketTier(
        uint256 index
    ) external view returns (RedPacketTier memory) {
        require(index < redPacketTiers.length, "Invalid index");
        return redPacketTiers[index];
    }

    // ============ Admin Functions ============

    /**
     * @dev Update signer address
     * @param _signer New signer address
     */
    function setSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        signer = _signer;
        emit SignerUpdated(_signer);
    }

    /**
     * @dev Update red packet tier
     * @param index Tier index
     * @param progressBps Progress threshold in basis points
     * @param maxRateBps Max rate in basis points
     */
    function updateRedPacketTier(
        uint256 index,
        uint256 progressBps,
        uint256 maxRateBps
    ) external onlyOwner {
        require(index < redPacketTiers.length, "Invalid index");
        require(progressBps <= BASIS_POINTS, "Invalid progress");
        require(maxRateBps <= BASIS_POINTS, "Invalid rate");

        redPacketTiers[index] = RedPacketTier(progressBps, maxRateBps);
        emit RedPacketTierUpdated(index, progressBps, maxRateBps);
    }

    /**
     * @dev Add new red packet tier
     * @param progressBps Progress threshold in basis points
     * @param maxRateBps Max rate in basis points
     */
    function addRedPacketTier(
        uint256 progressBps,
        uint256 maxRateBps
    ) external onlyOwner {
        require(progressBps <= BASIS_POINTS, "Invalid progress");
        require(maxRateBps <= BASIS_POINTS, "Invalid rate");

        redPacketTiers.push(RedPacketTier(progressBps, maxRateBps));
        emit RedPacketTierUpdated(
            redPacketTiers.length - 1,
            progressBps,
            maxRateBps
        );
    }
}
