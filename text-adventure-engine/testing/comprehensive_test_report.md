# 游戏分支全面测试报告

生成时间: 7/1/2025, 11:54:10 AM

## 测试概况

- 总测试次数: 60
- 测试角色: 2 个
- 测试策略: 10 种
- 结局总数: 5 个

## 结局达成情况

### ✅ 传奇程序员

- 达成次数: 9
- 成功角色分布:
  - 资深架构师: 3 次
  - 热血实习生: 6 次
- 示例成功路径:
  - 角色: 资深架构师
  - 策略: 平衡发展_v0
  - 最终状态: coding=41, social=26, caffeine=8
  - 关键属性: is_architect, coffee_addiction, project_started, detail_oriented, has_coffee, coffee_break_done, borrowed_keyboard, keyboard_issue_fixed, requirement_changed, requirement_analyzed, professional_response, learned_optimization, code_review_done, bug_slayer, debugging_master, bug_solved, wellness_advocate, coffee_crisis_handled, demo_perfect, project_success, final_demo_done
  - 详细路径: test_samples/persona_architect_1_v0.json

### ❌ 加班狂魔

- 达成次数: 0
- ⚠️ 此结局尚未找到可达路径，需要调整游戏数值

### ✅ 佛系码农

- 达成次数: 14
- 成功角色分布:
  - 资深架构师: 9 次
  - 热血实习生: 5 次
- 示例成功路径:
  - 角色: 资深架构师
  - 策略: 社交导向_v0
  - 最终状态: coding=31, social=19, caffeine=5
  - 关键属性: is_architect, coffee_addiction, project_started, confident_start, has_coffee, coffee_break_done, frustrated, keyboard_issue_fixed, requirement_changed, stressed, learned_optimization, code_review_done, team_player, bug_solved, wellness_advocate, coffee_crisis_handled
  - 详细路径: test_samples/persona_architect_2_v0.json

### ✅ 转行大师

- 达成次数: 3
- 成功角色分布:
  - 热血实习生: 3 次
- 示例成功路径:
  - 角色: 热血实习生
  - 策略: 随机探索B_v0
  - 最终状态: coding=11, social=24, caffeine=15
  - 关键属性: is_intern, high_energy, quick_learner, project_started, humble_start, has_coffee, coffee_break_done, frustrated, keyboard_issue_fixed, requirement_changed, stressed, learned_optimization, code_review_done, bug_solved, exhausted, lone_wolf, caffeine_withdrawal, coffee_crisis_handled
  - 详细路径: test_samples/persona_intern_7_v0.json

### ✅ 传奇程序员(技术路线)

- 达成次数: 18
- 成功角色分布:
  - 资深架构师: 18 次
- 示例成功路径:
  - 角色: 资深架构师
  - 策略: 积极技术流_v0
  - 最终状态: coding=32, social=14, caffeine=8
  - 关键属性: is_architect, coffee_addiction, project_started, confident_start, has_coffee, coffee_break_done, keyboard_master, keyboard_issue_fixed, requirement_changed, requirement_analyzed, professional_response, code_approved, architect_respect, code_review_done, demo_perfect
  - 详细路径: test_samples/persona_architect_0_v0.json

## 总结

- 结局覆盖率: 4/5 (80.0%)
- ⚠️ 仍有 1 个结局无法达成，需要进一步数值调整
- 建议使用 enhanced_balance_fixer.js 基于这些测试结果进行针对性调整
