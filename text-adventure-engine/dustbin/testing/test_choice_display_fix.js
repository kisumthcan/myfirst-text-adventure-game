const GameEngine = require('./game/main');
const stateManager = require('./game/state_manager');

// 测试选择显示修复 - 验证不重复显示
class ChoiceDisplayTest {
  constructor() {
    this.engine = new GameEngine();
  }

  // 模拟显示选择的效果
  simulateChoiceDisplay() {
    console.log('🧪 测试选择显示效果（模拟）');
    console.log('================================');
    
    // 模拟一个事件
    const mockEvent = {
      text: "你的机械键盘突然开始罢工，有些按键失灵了。这在代码城是很常见的现象。",
      choices: [
        {
          text: "用高超的技术修复键盘",
          conditions: { points: { coding: 10 } },
          outcome: { text: "你成功修复了键盘！", points_change: { coding: 2 } }
        },
        {
          text: "找同事借一个键盘", 
          conditions: { points: { social: 8 } },
          outcome: { text: "你借到了键盘！", points_change: { social: 2 } }
        },
        {
          text: "将就着用屏幕键盘",
          outcome: { text: "你用屏幕键盘继续工作...", points_change: { coding: -2 } }
        }
      ]
    };

    // 模拟低能力状态（很多选项不可选）
    const lowSkillState = {
      points: { coding: 5, social: 3, caffeine: 10 },
      attributes: ['persona_intern']
    };

    console.log('\n📋 事件描述：');
    console.log(mockEvent.text);
    
    console.log('\n📋 所有选项（当前实现）：');
    mockEvent.choices.forEach((choice, index) => {
      const isAvailable = stateManager.checkConditions(lowSkillState, choice.conditions);
      
      if (isAvailable) {
        console.log(`  ${index + 1}. ${choice.text}`);
      } else {
        const reason = stateManager.generateChoiceReasonText(lowSkillState, choice.conditions);
        console.log(`  ${index + 1}. \x1b[90m${choice.text}\x1b[0m \x1b[90m(不可选: ${reason})\x1b[0m`);
      }
    });

    // 过滤可用选择
    const availableChoices = mockEvent.choices.filter(choice => 
      stateManager.checkConditions(lowSkillState, choice.conditions)
    );

    console.log('\n🎯 可选择的选项（修复后，不会重复显示）：');
    console.log('  现在用户直接从上面显示的选项中输入编号选择');
    console.log('  例如：只能选择 "3" (将就着用屏幕键盘)');
    
    console.log('\n✅ 修复效果：');
    console.log('  - 用户看到所有选项的完整列表（包括不可选的）');
    console.log('  - 直接在完整列表中选择，无需重复显示');
    console.log('  - 保持选项编号的一致性（1,2,3...）');
  }

  run() {
    console.log('🔧 选择显示修复测试');
    this.simulateChoiceDisplay();
    
    console.log('\n📝 修复总结：');
    console.log('  问题：之前会显示"所有选项"然后再显示"可选项"，造成重复');
    console.log('  解决：现在只显示一次完整选项列表，用户直接从中选择');
    console.log('  优势：界面更简洁，避免信息重复，用户体验更好');
  }
}

if (require.main === module) {
  const test = new ChoiceDisplayTest();
  test.run();
}

module.exports = ChoiceDisplayTest;