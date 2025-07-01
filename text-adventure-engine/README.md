# 文字冒险游戏引擎 (Text Adventure Game Engine)

一个模块化、可扩展的文字冒险游戏引擎，支持配置驱动的剧情开发。

## 快速开始

### 安装依赖
```bash
npm install
```

### 运行游戏

#### 完整交互式游戏
```bash
npm start
# 或
node game/main.js
```
完整的交互式体验，包括角色选择、回合制游戏和暂停等待。

#### 交互式演示
```bash
node demo_interactive.js
```
包含详细说明的交互式演示版本。

#### 自动化测试
```bash
node test_game.js
```
快速的非交互式测试，验证两种人设的游戏流程。

#### 扩展测试（30回合）
```bash
node test_extended.js
```
运行30回合的完整测试，展示更多剧情内容。

## 游戏特色

### 🎮 游戏体验
- **双人设选择**：资深架构师 vs 热血实习生
- **36回合剧情**：完整的程序员死线求生体验
- **交互式暂停**：每次选择后暂停，让玩家充分阅读结果
- **多种结局**：根据玩家选择达成不同结局

### 🏗️ 引擎架构
- **高度解耦**：引擎逻辑与故事内容完全分离
- **配置驱动**：所有数值和规则从JSON文件读取
- **模块化设计**：状态管理、事件处理、主循环独立
- **可扩展性**：轻松添加新的故事线和角色

### 📁 项目结构
```
text-adventure-engine/
├── game/                    # 游戏引擎核心
│   ├── main.js             # 主游戏循环
│   ├── event_handler.js    # 事件处理逻辑
│   └── state_manager.js    # 玩家状态管理
├── stories/                # 故事内容
│   ├── common_events.json  # 共通事件
│   └── deadline_story.json # 主线剧情
├── config/                 # 游戏配置
│   ├── game_rules.json     # 游戏规则
│   └── initial_characters.json # 初始角色
├── test_game.js            # 自动化测试
├── demo_interactive.js     # 交互式演示
└── project_log.md          # 开发日志
```

### 🎯 核心功能

#### 三大属性系统
- **编程技能 (coding)**：影响技术问题的解决能力
- **咖啡因耐受度 (caffeine)**：影响精神状态和工作效率
- **社交能力 (social)**：影响与同事和客户的互动

#### 动态事件系统
- **回合范围限制**：事件只在特定回合触发
- **条件筛选**：基于属性和点数的复杂条件判断
- **优先级排序**：确保重要剧情优先触发
- **防重复机制**：每个事件只能体验一次

#### 角色差异化
- **资深架构师**：高编程技能，低社交能力，咖啡因依赖
- **热血实习生**：低编程技能，高社交能力，精力充沛

## 开发指南

### 添加新角色
编辑 `config/initial_characters.json`：
```json
{
  "id": "new_character",
  "name": "角色名称",
  "description": "角色描述",
  "initial_state": {
    "points": { "coding": 10, "caffeine": 15, "social": 20 },
    "attributes": ["character_trait"]
  }
}
```

### 添加新事件
编辑 `stories/` 目录下的JSON文件：
```json
{
  "id": "unique_event_id",
  "name": "事件名称",
  "turn_range": [1, 10],
  "conditions": {
    "points": { "coding": 5 },
    "attributes": ["required_attribute", "!forbidden_attribute"],
    "priority": 10
  },
  "text": "事件描述",
  "choices": [...]
}
```

### 测试新内容
```bash
# 运行自动化测试验证功能
node test_game.js

# 运行交互式测试体验游戏
node demo_interactive.js
```

## 技术规范

- **Node.js**: 纯原生Node.js，最小依赖
- **交互库**: @inquirer/prompts 用于命令行交互
- **数据格式**: JSON配置文件
- **架构模式**: 模块化 + 组合模式
- **测试框架**: 自建非交互式测试系统

## 项目原则

1. **日志先行**：所有开发过程记录在 `project_log.md`
2. **高度解耦**：引擎与内容分离，配置驱动
3. **结构简洁**：最少依赖，功能单一

---

*这个项目展示了如何构建一个可扩展、易维护的文字冒险游戏引擎。*