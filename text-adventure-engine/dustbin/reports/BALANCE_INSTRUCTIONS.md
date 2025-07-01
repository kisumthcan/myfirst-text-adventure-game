# 如何使用平衡后的配置

## 替换原始配置
1. 备份原始文件:
   `cp stories/deadline_story.json stories/deadline_story_original.json`

2. 使用平衡配置:
   `cp stories/deadline_story_final_balanced.json stories/deadline_story.json`

3. 运行游戏测试:
   `node test_game.js`

## 平衡后的结局路径

### 传奇程序员 (两种路径)
1. **全能路径**: coding >= 18, social >= 10 + project_success + demo_perfect
2. **技术路线**: coding >= 25 + code_approved + bug_slayer + demo_perfect

### 佛系码农
- social >= 18 + wellness_advocate + team_player
- wellness_advocate条件已放宽

### 加班狂魔  
- coding >= 18 + exhausted + lone_wolf
- 通过Bug事件"熬夜独自解决"获得

### 转行大师
- coding >= 8 + frustrated + caffeine_withdrawal  
- 最容易达成的结局

## 关键属性获取方式

- **demo_perfect**: 代码评审自信展示 OR 终极演示完美展示
- **project_success**: 终极演示完美展示 OR 诚实汇报 
- **team_player**: Bug事件协助调试 OR 代码评审虚心请教
- **wellness_advocate**: 咖啡危机推广健康 (条件已放宽)
