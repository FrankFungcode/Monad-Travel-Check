# TravelCheck 合约设计文档

## 一、系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      TravelCheck 合约系统                        │
├─────────────────────┬─────────────────────┬─────────────────────┤
│  TravelCheckStaking │ TravelCheckAttraction│  TravelCheckBadge   │
│  (质押+打卡+红包)    │  (景区任务)          │  (成就徽章)          │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ • 用户质押 ETH/MON  │ • 平台发布任务       │ • Soulbound NFT     │
│ • 每日打卡上链      │ • 用户接取任务       │ • 不可转让           │
│ • 红包奖励          │ • 完成获奖励         │ • 成就记录           │
│ • 返还本金+利息     │                     │                      │
└─────────────────────┴─────────────────────┴─────────────────────┘
        │                      │                      │
        │     三个合约完全独立，互不依赖                │
        └──────────────────────┴──────────────────────┘
```

---

## 二、TravelCheckStaking（质押打卡合约）

### 2.1 业务流程

```
用户质押 → 每日打卡 → 领取红包 → 完成后提现（本金+利息）
```

### 2.2 核心功能

| 功能     | 说明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 创建质押 | 用户质押 ETH/MON，选择里程碑（10/20/30/50 天）和模式（SEALED/ANYTIME） |
| 打卡上链 | 打卡内容哈希+GPS 坐标存储在链上                                        |
| 红包奖励 | 每次打卡后可领取红包                                                  |
| 利息计算 | 根据进度和模式计算利息，SEALED 模式收益更高                            |
| 提现     | SEALED 模式需完成后提现，ANYTIME 模式随时可提                          |

### 2.3 调用方式

#### 创建质押

```javascript
// 质押 1 ETH，100天里程碑，SEALED模式
await staking.createStake(
  0, // StakeType.DAILY
  100, // 100天
  0, // StakeMode.SEALED
  { value: ethers.parseEther("1") }
);
// 返回: stakeId
```

#### 打卡

```javascript
// 计算打卡内容哈希（服务端）
const contentHash = ethers.keccak256(
  ethers.toUtf8Bytes(
    JSON.stringify({
      text: "今天去了外滩...",
      images: ["https://..."],
      timestamp: Date.now()
    })
  )
);

// 调用合约打卡
await staking.checkIn(
  stakeId,
  contentHash, // 内容哈希
  31239700, // 纬度 × 10^6
  121499800 // 经度 × 10^6
);
```

#### 领取红包

```javascript
await staking.claimRedPacket(
  stakeId,
  checkinIndex // 第几次打卡（0开始）
);
```

#### 提现

```javascript
await staking.withdraw(stakeId);
// 转账: 本金 + 累计利息
```

### 2.4 红包规则

| 打卡进度 | 红包最大值                       |
| -------- | -------------------------------- |
| 0-20%    | 质押额的 1%                      |
| 20-50%   | 质押额的 2%                      |
| 50-80%   | 质押额的 3%                      |
| 80-99%   | 质押额的 5%                      |
| 100%     | 质押额的 10%（最后一次特别红包） |

**最小红包**: 质押额的 0.1%

### 2.5 利息规则

**SEALED 模式（锁定到完成）:**
| 里程碑 | 年化利率 |
|-------|---------|
| 10 次 | 5% |
| 20 次 | 8% |
| 30 次 | 14% |
| 50 次 | 20% |

**ANYTIME 模式（随时可提）:** SEALED 的 50%

**惩罚**: 非完美打卡（漏打）的 SEALED 模式利息减半

---

## 三、TravelCheckAttraction（景区任务合约）

### 3.1 业务流程

```
平台创建任务（预存奖励）→ 用户接取 → 到景区打卡 → 领取奖励
```

### 3.2 核心功能

| 功能     | 说明                                       |
| -------- | ------------------------------------------ |
| 创建任务 | 平台设置景区位置、奖励金额、名额、时间范围 |
| 接取任务 | 用户接取感兴趣的任务                       |
| 完成任务 | 到达景区后提交打卡                         |
| 任务管理 | 暂停/恢复/取消任务                         |

### 3.3 调用方式

#### 平台创建任务

```javascript
// 创建东方明珠打卡任务
await attraction.createTask(
  "东方明珠打卡", // 名称
  "到东方明珠塔打卡领奖", // 描述
  31239700, // 纬度 × 10^6
  121499800, // 经度 × 10^6
  500, // 有效半径 500米
  ethers.parseEther("0.01"), // 每人奖励 0.01 ETH
  100, // 总名额 100人
  startTimestamp, // 开始时间
  endTimestamp, // 结束时间
  { value: ethers.parseEther("1") } // 预存 0.01 × 100 = 1 ETH
);
```

#### 用户接取任务

```javascript
await attraction.acceptTask(taskId);
```

#### 完成任务

```javascript
await attraction.completeTask(
  taskId,
  contentHash, // 打卡内容哈希
  userLatitude, // 用户纬度
  userLongitude // 用户经度
);
// 自动转账奖励给用户
```

#### 任务管理

```javascript
// 暂停任务
await attraction.pauseTask(taskId);

// 恢复任务
await attraction.resumeTask(taskId);

// 取消任务（退还剩余奖励）
await attraction.cancelTask(taskId);

// 追加奖励
await attraction.addReward(taskId, { value: ethers.parseEther("0.5") });
```

### 3.4 任务状态

| 状态      | 说明                   |
| --------- | ---------------------- |
| ACTIVE    | 进行中，可接取和完成   |
| PAUSED    | 已暂停，不可接取和完成 |
| COMPLETED | 名额已满，自动完成     |
| CANCELLED | 已取消，剩余奖励已退还 |

---

## 四、客户端职责

### 4.1 GPS 验证

```javascript
// Haversine 公式计算距离
function verifyLocation(userLat, userLng, taskLat, taskLng, radiusMeters) {
  const R = 6371000; // 地球半径（米）
  const lat1 = ((userLat / 1e6) * Math.PI) / 180;
  const lat2 = ((taskLat / 1e6) * Math.PI) / 180;
  const deltaLat = (((taskLat - userLat) / 1e6) * Math.PI) / 180;
  const deltaLng = (((taskLng - userLng) / 1e6) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return distance <= radiusMeters;
}
```

### 4.3 红包金额计算

```javascript
function calculateRedPacketAmount(stakeAmount, checkedDays, milestone) {
  const progress = checkedDays / milestone;

  let maxRate;
  if (progress >= 1) maxRate = 0.1; // 100%: 最大10%
  else if (progress >= 0.8) maxRate = 0.05; // 80-99%: 最大5%
  else if (progress >= 0.5) maxRate = 0.03; // 50-80%: 最大3%
  else if (progress >= 0.2) maxRate = 0.02; // 20-50%: 最大2%
  else maxRate = 0.01; // 0-20%: 最大1%

  const minRate = 0.001; // 最小 0.1%
  const rate = minRate + Math.random() * (maxRate - minRate);

  return BigInt(Math.floor(Number(stakeAmount) * rate));
}
```

---

## 五、查询接口

### 5.1 Staking 合约

| 函数                             | 参数     | 返回               |
| -------------------------------- | -------- | ------------------ |
| `getStake(stakeId)`              | stakeId  | Stake 结构体       |
| `getUserStakes(user)`            | 用户地址 | stakeId 数组       |
| `getCheckinRecords(stakeId)`     | stakeId  | CheckinRecord 数组 |
| `getCheckinCount(stakeId)`       | stakeId  | 打卡次数           |
| `getMaxRedPacketAmount(stakeId)` | stakeId  | 当前最大红包金额   |
| `calculateInterest(stakeId)`     | stakeId  | 当前利息           |

### 5.2 Attraction 合约

| 函数                            | 参数             | 返回                |
| ------------------------------- | ---------------- | ------------------- |
| `getTask(taskId)`               | taskId           | Task 结构体         |
| `getUserTaskInfo(taskId, user)` | taskId, 用户地址 | UserTaskInfo 结构体 |
| `getUserAcceptedTasks(user)`    | 用户地址         | taskId 数组         |
| `isTaskAcceptable(taskId)`      | taskId           | bool                |
| `getRemainingSlots(taskId)`     | taskId           | 剩余名额            |
| `getTaskCount()`                | -                | 任务总数            |

---

## 六、管理接口

### 6.1 Staking 合约（onlyOwner）

| 函数                                                  | 说明             |
| ----------------------------------------------------- | ---------------- |
| `updateRedPacketTier(index, progressBps, maxRateBps)` | 更新红包阈值     |
| `addRedPacketTier(progressBps, maxRateBps)`           | 添加红包阈值     |
| `markImperfect(stakeId)`                              | 标记漏打卡       |
| `emergencyWithdraw(amount)`                           | 紧急提现         |

### 6.2 Attraction 合约（onlyOwner）

| 函数                        | 说明         |
| --------------------------- | ------------ |
| `createTask(...)`           | 创建任务     |
| `pauseTask(taskId)`         | 暂停任务     |
| `resumeTask(taskId)`        | 恢复任务     |
| `cancelTask(taskId)`        | 取消任务     |
| `addReward(taskId)`         | 追加奖励     |
| `emergencyWithdraw(amount)` | 紧急提现     |

---

## 七、事件列表

### 7.1 Staking 合约

| 事件                 | 触发时机     |
| -------------------- | ------------ |
| `StakeCreated`       | 创建质押     |
| `CheckedIn`          | 打卡成功     |
| `InterestCalculated` | 利息计算     |
| `StakeWithdrawn`     | 提现成功     |
| `RedPacketClaimed`   | 领取红包     |

### 7.2 Attraction 合约

| 事件                | 触发时机     |
| ------------------- | ------------ |
| `TaskCreated`       | 创建任务     |
| `TaskAccepted`      | 接取任务     |
| `TaskCompleted`     | 完成任务     |
| `TaskStatusChanged` | 任务状态变更 |
| `TaskCancelled`     | 取消任务     |
| `RewardAdded`       | 追加奖励     |

---

## 八、部署配置

### 8.1 环境变量

```bash
# .env
PRIVATE_KEY=your_deployer_private_key
```

### 8.2 部署命令

```bash
# 本地测试网
npx hardhat run scripts/deploy.js --network localhost

# Monad 测试网
npx hardhat run scripts/deploy.js --network monad-testnet
```

### 8.3 部署输出

```json
{
  "network": "monad-testnet",
  "deployer": "0x...",
  "contracts": {
    "TravelCheckStaking": "0x...",
    "TravelCheckAttraction": "0x...",
    "TravelCheckBadge": "0x..."
  }
}
```

---

## 九、安全注意事项

1. **重入保护**: 所有转账操作都使用 `nonReentrant`
2. **金额验证**: 红包金额不能超过最大限制
