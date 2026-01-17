# TravelCheck Frontend

基于 React + TypeScript 的 Web3 旅行打卡 DApp 前端应用，支持质押、打卡、景区任务和成就徽章系统。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| TypeScript | ^5.3.3 | 类型系统 |
| Ethers.js | ^6.9.0 | 区块链交互 |
| Jotai | ^2.6.0 | 状态管理 |
| React Router | ^6.20.0 | 路由管理 |
| i18next | ^25.7.3 | 国际化 |
| Tailwind CSS | ^3.3.6 | 样式框架 |
| Webpack | ^5.89.0 | 打包工具 |
| Playwright | ^1.57.0 | E2E 测试 |
| Biome | ^1.4.1 | 代码检查 |

## 功能特性

- **钱包连接**: 支持 MetaMask 等主流钱包
- **质押系统**: 支持 SEALED（锁定）和 ANYTIME（随时提现）两种模式
- **每日打卡**: 打卡记录上链，支持 GPS 坐标存储
- **红包奖励**: 根据打卡进度获得动态红包
- **景区任务**: GPS 验证后领取景区奖励
- **成就徽章**: Soulbound NFT 成就系统
- **多主题切换**: 5 种精美主题可选
- **国际化**: 支持中英文切换

## 项目结构

```
src/
├── pages/                      # 页面组件
│   ├── HomePage/               # 首页
│   ├── StakePage/              # 质押页面
│   ├── MyCheckinsPage/         # 我的打卡
│   ├── CheckinPage/            # 打卡详情
│   ├── CalendarPage/           # 日历视图
│   ├── AttractionsPage/        # 景区任务列表
│   ├── AttractionCheckinCreatePage/  # 创建景区打卡
│   ├── AttractionCheckinPage/  # 景区打卡详情
│   ├── RewardsPage/            # 奖励页面
│   └── ProfilePage/            # 个人资料
│
├── components/                 # 组件库
│   ├── business/               # 业务组件
│   │   ├── WalletConnect/      # 钱包连接
│   │   ├── StakeCard/          # 质押卡片
│   │   ├── TaskCard/           # 任务卡片
│   │   ├── CalendarGrid/       # 日历网格
│   │   ├── RedPacket/          # 红包显示
│   │   └── LotteryWheel/       # 抽奖转盘
│   └── common/                 # 通用组件
│
├── hooks/                      # 自定义 Hooks
│   ├── useStaking.ts           # 质押逻辑
│   ├── useAttraction.ts        # 景区任务
│   ├── useBadges.ts            # 徽章逻辑
│   ├── useContracts.ts         # 合约交互
│   └── useWallet.ts            # 钱包相关
│
├── services/                   # 服务层
│   ├── staking.service.ts      # 质押服务
│   ├── checkin.service.ts      # 打卡服务
│   ├── task.service.ts         # 任务服务
│   └── reward.service.ts       # 奖励服务
│
├── store/                      # Jotai 状态管理
│   ├── staking.atom.ts         # 质押状态
│   ├── ui.atom.ts              # UI 状态
│   ├── user.atom.ts            # 用户状态
│   └── wallet.atom.ts          # 钱包状态
│
├── constants/                  # 常量定义
│   ├── contracts.ts            # 合约地址和 ABI
│   ├── networks.ts             # 网络配置
│   └── business.ts             # 业务规则
│
├── types/                      # TypeScript 类型
├── config/                     # 配置文件
├── contexts/                   # React Context
├── i18n/                       # 国际化资源
└── styles/                     # 全局样式
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd travelcheck-frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产环境构建 |
| `npm run lint` | 代码检查 |
| `npm run lint:fix` | 自动修复代码问题 |
| `npm run format` | 代码格式化 |
| `npm run test:e2e` | 运行 E2E 测试 |

## 网络配置

支持的区块链网络：

| 网络 | Chain ID | 说明 |
|------|----------|------|
| Hardhat Local | 1337 | 本地开发网络 |
| Monad Devnet | 143 | Monad 测试网络 |

## 合约地址 (Monad Testnet)

| 合约 | 地址 |
|------|------|
| TravelCheckStaking | `0xd40Faaa886B9108767C825272c60cfBe0E815B1F` |
| TravelCheckAttraction | `0xf080924262883AE9888731A9Ef90AAe47206C54A` |
| TravelCheckBadge | `0x91146a0632b88498107f62f82410B58476dE1c53` |

## 主题系统

内置 5 种精美主题：

| 主题 | 图标 | 主色调 |
|------|------|--------|
| Forest Green | 🌲 | #13ec5b |
| Ocean Blue | 🌊 | #1E40AF |
| Sunset Orange | 🌅 | #F97316 |
| Sakura Pink | 🌸 | #EC4899 |
| Violet Purple | �� | #8B5CF6 |

## 业务规则

### 质押配置

| 配置项 | 值 |
|--------|-----|
| 最小质押 | 0.0001 ETH |
| 最大质押 | 1000 ETH |
| 里程碑 | 10/20/30/50 天 |

### 利率规则

**SEALED 模式（锁定）：**
- 10 天: 5%
- 20 天: 8%
- 30 天: 14%
- 50 天: 20%

**ANYTIME 模式：** SEALED 利率的 50%

### 红包规则

| 打卡进度 | 红包上限 |
|----------|----------|
| 0-20% | 1% |
| 20-50% | 2% |
| 50-80% | 3% |
| 80-99% | 5% |
| 100% | 10% |

## 目录说明

- `src/pages/` - 页面级组件
- `src/components/` - 可复用组件
- `src/hooks/` - 自定义 React Hooks
- `src/services/` - API 和业务服务
- `src/store/` - Jotai 原子状态
- `src/constants/` - 常量和配置
- `src/types/` - TypeScript 类型定义
- `src/i18n/` - 国际化资源文件
- `public/` - 静态资源

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件目录
2. 在 `src/constants/routes.ts` 添加路由配置
3. 在 `App.tsx` 注册路由

### 添加新组件

1. 业务组件放在 `src/components/business/`
2. 通用组件放在 `src/components/common/`
3. 在 `src/types/components.types.ts` 添加 Props 类型

### 状态管理

使用 Jotai 进行状态管理：

```typescript
import { atom, useAtom } from 'jotai';

// 定义原子状态
export const countAtom = atom(0);

// 在组件中使用
const [count, setCount] = useAtom(countAtom);
```

### 合约交互

使用 `useContracts` Hook：

```typescript
import { useContracts } from '@/hooks/useContracts';

const { stakingContract, attractionContract } = useContracts();

// 调用合约方法
await stakingContract.createStake(...);
```

## License

MIT
