# TravelCheck Contracts

基于 Solidity 的旅行打卡 DApp 智能合约，包含质押、景区任务和成就徽章三个核心合约。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Solidity | ^0.8.20 | 智能合约语言 |
| Hardhat | ^2.22.0 | 开发框架 |
| OpenZeppelin | ^5.4.0 | 安全合约库 |
| ethers.js | ^6.x | 部署和测试 |

## 合约概览

### 1. TravelCheckStaking

质押 + 打卡 + 红包核心合约。

**主要功能：**
- 创建质押（支持 DAILY/ATTRACTION 两种类型）
- 每日打卡上链（存储内容哈希 + GPS 坐标）
- 领取红包奖励（基于打卡进度的动态奖励）
- 提现（含利息计算）

### 2. TravelCheckAttraction

景区任务合约。

**主要功能：**
- 创建景区任务（预存奖励池）
- 用户接取任务
- GPS 验证完成任务
- 任务管理（暂停/恢复/取消）

### 3. TravelCheckBadge

Soulbound NFT 成就徽章合约。

**主要功能：**
- 铸造成就徽章
- 不可转让（Soulbound）
- 终身绑定用户地址

## 项目结构

```
travelcheck-contracts/
├── contracts/                  # 智能合约
│   ├── TravelCheckStaking.sol  # 质押合约 (571行)
│   ├── TravelCheckAttraction.sol # 景区任务合约 (456行)
│   └── TravelCheckBadge.sol    # 徽章合约 (139行)
│
├── scripts/                    # 部署脚本
│   └── deploy.js               # 主部署脚本
│
├── test/                       # 测试文件
│   └── *.test.js
│
├── docs/                       # 文档
│   └── contract-design.md      # 合约设计文档
│
├── hardhat.config.js           # Hardhat 配置
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd travelcheck-contracts
npm install
```

### 编译合约

```bash
npm run compile
```

### 运行测试

```bash
npm run test
```

### 启动本地节点

```bash
npm run node
```

### 部署合约

**本地部署：**

```bash
npm run deploy:local
```

**Monad 测试网部署：**

```bash
npm run deploy:monad
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run compile` | 编译合约 |
| `npm run test` | 运行测试 |
| `npm run node` | 启动本地 Hardhat 节点 |
| `npm run deploy:local` | 部署到本地网络 |
| `npm run deploy:monad` | 部署到 Monad 测试网 |

## 环境变量配置

创建 `.env` 文件：

```env
# 部署者私钥
PRIVATE_KEY=your_deployer_private_key

# Monad 测试网 RPC
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
```

## 合约详细说明

### TravelCheckStaking

#### 数据结构

```solidity
struct Stake {
    address user;              // 用户地址
    StakeType stakeType;       // DAILY(0) / ATTRACTION(1)
    uint256 amount;            // 质押金额 (Wei)
    uint256 milestone;         // 里程碑 (10/20/30/50)
    StakeMode mode;            // SEALED(0) / ANYTIME(1)
    uint256 checkedDays;       // 已打卡天数
    bool isPerfect;            // 是否完美打卡
    uint256 accumulatedInterest; // 累计利息
    StakeStatus status;        // ACTIVE/COMPLETED/WITHDRAWN
    uint256 startTime;
    uint256 endTime;
    uint256 completedAt;
    uint256 withdrawnAt;
}

struct CheckinRecord {
    uint256 timestamp;         // 打卡时间
    bytes32 contentHash;       // 打卡内容哈希
    int256 latitude;           // 纬度 × 10^6
    int256 longitude;          // 经度 × 10^6
}
```

#### 核心方法

| 方法 | 说明 |
|------|------|
| `createStake(type, milestone, mode)` | 创建质押 |
| `checkIn(stakeId, contentHash, lat, lng)` | 每日打卡 |
| `claimRedPacket(stakeId, checkinIndex)` | 领取红包 |
| `withdraw(stakeId)` | 提现本金+利息 |
| `calculateInterest(stakeId)` | 计算当前利息 |
| `markImperfect(stakeId)` | 标记漏卡（管理员） |

#### 利率规则

**SEALED 模式（锁定提现）：**

| 里程碑 | 年化利率 |
|--------|----------|
| 10 天 | 5% |
| 20 天 | 8% |
| 30 天 | 14% |
| 50 天 | 20% |

**ANYTIME 模式：** SEALED 利率的 50%

**惩罚规则：** 非完美打卡时，SEALED 模式利息减半

#### 红包规则

| 打卡进度 | 最大红包比例 |
|----------|--------------|
| 0-20% | 1% |
| 20-50% | 2% |
| 50-80% | 3% |
| 80-99% | 5% |
| 100% | 10% |

最小红包：0.1%

---

### TravelCheckAttraction

#### 数据结构

```solidity
struct Task {
    uint256 id;
    string name;               // 任务名称
    string description;        // 任务描述
    int256 latitude;           // 景点纬度 × 10^6
    int256 longitude;          // 景点经度 × 10^6
    uint256 radius;            // 有效打卡半径 (米)
    uint256 rewardPerUser;     // 每人奖励 (Wei)
    uint256 totalSlots;        // 总名额
    uint256 claimedSlots;      // 已领名额
    uint256 startTime;
    uint256 endTime;
    TaskStatus status;         // ACTIVE/PAUSED/COMPLETED/CANCELLED
    uint256 remainingReward;   // 剩余奖励池
}

struct UserTaskInfo {
    bool accepted;             // 是否已接取
    bool completed;            // 是否已完成
    uint256 acceptedAt;        // 接取时间
    uint256 completedAt;       // 完成时间
    bytes32 contentHash;       // 打卡内容哈希
}
```

#### 核心方法

| 方法 | 说明 |
|------|------|
| `createTask(...)` | 创建景区任务（需预存奖励） |
| `acceptTask(taskId)` | 用户接取任务 |
| `completeTask(taskId, contentHash, lat, lng)` | 完成任务 |
| `pauseTask(taskId)` | 暂停任务 |
| `resumeTask(taskId)` | 恢复任务 |
| `cancelTask(taskId)` | 取消任务（退还奖励） |
| `addReward(taskId)` | 追加奖励 |

---

### TravelCheckBadge

#### 徽章类型

| ID | 类型 | 说明 |
|----|------|------|
| 1 | FIRST_CHECKIN | 首次打卡 |
| 2 | STREAK_7 | 7 天连续打卡 |
| 3 | STREAK_30 | 30 天连续打卡 |
| 4 | STREAK_100 | 100 天连续打卡 |
| 5 | PERFECT_MONTH | 完美月份 |
| 6 | WORLD_EXPLORER | 世界探险家 |

#### Soulbound 特性

- 不可转让
- 不可授权（approve/setApprovalForAll 禁用）
- 仅在铸造时允许传输
- 终身绑定用户地址

#### 核心方法

| 方法 | 说明 |
|------|------|
| `mintBadge(to, badgeType, tokenURI)` | 铸造徽章（仅 owner） |
| `hasBadge(user, badgeType)` | 检查是否拥有徽章 |

## 部署地址 (Monad Testnet)

| 合约 | 地址 |
|------|------|
| TravelCheckStaking | `0xd40Faaa886B9108767C825272c60cfBe0E815B1F` |
| TravelCheckAttraction | `0xf080924262883AE9888731A9Ef90AAe47206C54A` |
| TravelCheckBadge | `0x91146a0632b88498107f62f82410B58476dE1c53` |

## 安全特性

- **ReentrancyGuard**: 防重入攻击
- **Ownable**: 管理员权限控制
- **Pausable**: 紧急暂停机制
- **OpenZeppelin**: 使用经过审计的合约库

## 客户端职责

### GPS 验证

使用 Haversine 公式计算用户位置与目标位置的距离：

```javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 地球半径（米）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## 开发指南

### 添加新合约

1. 在 `contracts/` 目录创建新的 `.sol` 文件
2. 继承 OpenZeppelin 合约（如需要）
3. 在 `scripts/deploy.js` 添加部署逻辑
4. 编写测试用例

### 测试规范

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TravelCheckStaking", function () {
  let staking;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const Staking = await ethers.getContractFactory("TravelCheckStaking");
    staking = await Staking.deploy();
  });

  it("should create stake", async function () {
    await staking.connect(user1).createStake(0, 10, 0, { value: ethers.parseEther("1") });
    const stake = await staking.stakes(0);
    expect(stake.user).to.equal(user1.address);
  });
});
```

### Gas 优化建议

- 使用 `calldata` 替代 `memory`（外部函数参数）
- 批量操作时使用 `unchecked` 块
- 合理使用事件记录而非存储

## License

MIT
