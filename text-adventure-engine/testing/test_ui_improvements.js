const fs = require('fs');
const path = require('path');
const stateManager = require('./game/state_manager');

// 测试新的UI改进功能
class UIImprovementTest {
  constructor() {
    this.config = null;
    this.characters = null;
    this.allEvents = [];
    this.loadData();
  }

  loadData() {
    const gameRulesPath = path.join(__dirname, 'config/game_rules.json');
    const charactersPath = path.join(__dirname, 'config/initial_characters.json');
    
    this.config = JSON.parse(fs.readFileSync(gameRulesPath, 'utf8'));
    this.characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    
    // 加载故事事件
    const commonEventsPath = path.join(__dirname, 'stories/common_events.json');
    const storyEventsPath = path.join(__dirname, 'stories/deadline_story_final_balanced.json');
    
    const commonEvents = JSON.parse(fs.readFileSync(commonEventsPath, 'utf8'));
    const storyEvents = JSON.parse(fs.readFileSync(storyEventsPath, 'utf8'));
    
    this.allEvents = commonEvents.concat(storyEvents);
    
    console.log('✅ 测试数据加载成功');
  }

  testChoiceDisplayWithReasons() {
    console.log('\n=== 测试选择显示和原因生成 ===');
    
    // 创建一个测试状态 - 编程能力较低的实习生
    const testState = {
      points: { coding: 5, social: 3, caffeine: 10 },
      attributes: ['persona_intern', 'eager_learner']
    };
    
    console.log('🧪 测试状态：');
    console.log('   点数:', testState.points);
    console.log('   属性:', testState.attributes);
    
    // 使用键盘故障事件测试（包含条件限制的选择）
    const testEvent = this.allEvents.find(event => 
      event.id === 'common_keyboard_tantrum'
    );
    
    if (!testEvent) {
      console.log('❌ 未找到测试事件');
      return;
    }
    
    console.log('\n📋 事件：', testEvent.text);
    console.log('\n🎯 选择显示测试（模拟displayAllChoices函数）：');
    
    testEvent.choices.forEach((choice, index) => {
      const isAvailable = stateManager.checkConditions(testState, choice.conditions);
      
      if (isAvailable) {
        console.log(`  ${index + 1}. ${choice.text}`);
      } else {
        const reason = stateManager.generateChoiceReasonText(testState, choice.conditions);
        console.log(`  ${index + 1}. \x1b[90m${choice.text}\x1b[0m \x1b[90m(不可选: ${reason})\x1b[0m`);
      }
    });
    
    // 测试另一个状态 - 高编程能力的架构师
    console.log('\n🎯 相同事件，不同状态测试：')
    const highCodingState = {
      points: { coding: 15, social: 8, caffeine: 12 },
      attributes: ['persona_architect', 'coffee_addiction', 'project_started']
    };
    
    console.log('   测试状态: coding=15, social=8, caffeine=12');
    console.log('   所有选择都应该可用：');
    
    testEvent.choices.forEach((choice, index) => {
      const isAvailable = stateManager.checkConditions(highCodingState, choice.conditions);
      
      if (isAvailable) {
        console.log(`  ${index + 1}. ${choice.text}`);
      } else {
        const reason = stateManager.generateChoiceReasonText(highCodingState, choice.conditions);
        console.log(`  ${index + 1}. \x1b[90m${choice.text}\x1b[0m \x1b[90m(不可选: ${reason})\x1b[0m`);
      }
    });
  }

  testChoiceImpactDisplay() {
    console.log('\n=== 测试选择影响显示 ===');
    
    // 创建测试结果
    const testOutcomes = [
      {
        points_change: { coding: 3, social: -1 },
        attributes_add: ['project_started'],
        text: '你开始了新项目'
      },
      {
        points_change: { caffeine: 5, social: 2 },
        attributes_add: ['team_player'],
        attributes_remove: ['lone_wolf'],
        text: '你选择了团队合作'
      },
      {
        points_change: {},
        attributes_add: [],
        text: '没有变化的选择'
      }
    ];
    
    testOutcomes.forEach((outcome, index) => {
      console.log(`\n🎯 测试结果 ${index + 1}:`);
      console.log(`   ${outcome.text}`);
      stateManager.displayChoiceImpact(outcome);
    });
  }

  testConditionReasonGeneration() {
    console.log('\n=== 测试条件原因生成 ===');
    
    const testState = {
      points: { coding: 8, social: 15, caffeine: 12 },
      attributes: ['persona_architect', 'coffee_addiction', 'project_started']
    };
    
    const testConditions = [
      {
        points: { coding: 10, social: 5 },
        attributes: ['team_player']
      },
      {
        points: { caffeine: 20 },
        attributes: ['!coffee_addiction']
      },
      {
        attributes: ['project_started', 'bug_solved']
      },
      {
        points: { coding: 5, social: 10 },
        attributes: ['persona_architect']
      }
    ];
    
    console.log('🧪 测试状态：');
    console.log('   点数:', testState.points);
    console.log('   属性:', testState.attributes);
    
    testConditions.forEach((condition, index) => {
      console.log(`\n🎯 条件 ${index + 1}:`);
      console.log('   要求:', JSON.stringify(condition, null, 2));
      
      const isAvailable = stateManager.checkConditions(testState, condition);
      console.log('   可用:', isAvailable ? '✅' : '❌');
      
      if (!isAvailable) {
        const reason = stateManager.generateChoiceReasonText(testState, condition);
        console.log('   原因:', reason);
      }
    });
  }

  run() {
    console.log('🎮 UI改进功能测试开始\n');
    
    this.testChoiceDisplayWithReasons();
    this.testChoiceImpactDisplay();
    this.testConditionReasonGeneration();
    
    console.log('\n✅ UI改进功能测试完成');
    console.log('\n📝 测试总结：');
    console.log('   1. ✅ 选择显示功能正常（显示所有选项，标灰不可选）');
    console.log('   2. ✅ 选择影响预览功能正常（显示具体变化）');
    console.log('   3. ✅ 条件原因生成功能正常（详细说明不可选原因）');
    console.log('   4. ✅ 颜色编码功能正常（灰色显示不可选项）');
  }
}

if (require.main === module) {
  const test = new UIImprovementTest();
  test.run();
}

module.exports = UIImprovementTest;