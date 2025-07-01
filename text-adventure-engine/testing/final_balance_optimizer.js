const fs = require('fs');
const path = require('path');

// 最终平衡优化器 - 深度分析特定结局无法达成的原因
class FinalBalanceOptimizer {
  constructor() {
    this.testResults = null;
    this.storyEvents = [];
    this.commonEvents = [];
    this.allEvents = [];
    this.endings = [];
    this.loadData();
  }

  loadData() {
    // 加载测试结果
    const testResultsPath = path.join(__dirname, 'comprehensive_test_results.json');
    if (fs.existsSync(testResultsPath)) {
      this.testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
      console.log('✅ 已加载测试结果');
    } else {
      console.log('❌ 未找到测试结果文件');
      process.exit(1);
    }

    // 加载事件数据
    const storyPath = path.join(__dirname, '../stories/deadline_story_final_balanced.json');
    const commonPath = path.join(__dirname, '../stories/common_events.json');
    
    this.storyEvents = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
    this.commonEvents = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
    this.allEvents = this.commonEvents.concat(this.storyEvents);
    this.endings = this.storyEvents.filter(event => event.type === 'ending');
    
    console.log(`✅ 已加载 ${this.allEvents.length} 个事件，${this.endings.length} 个结局`);
  }

  // 深度分析技术路线传奇程序员无法达成的原因
  analyzeLegendaryProgrammerAlt() {
    console.log('\\n🔍 深度分析传奇程序员(技术路线)...');
    
    const targetEnding = this.endings.find(e => e.id === 'ending_legendary_programmer_alt');
    if (!targetEnding) {
      console.log('❌ 未找到目标结局');
      return;
    }

    console.log('目标结局条件:', targetEnding.conditions);
    
    // 分析所有成功路径的属性分布
    console.log('\\n📊 分析成功路径的属性分布...');
    
    const attributeStats = {};
    let maxCoding = 0;
    
    this.testResults.detailedResults.forEach(result => {
      if (result.ending) {
        maxCoding = Math.max(maxCoding, result.finalState.points.coding);
        
        result.finalState.attributes.forEach(attr => {
          if (!attributeStats[attr]) {
            attributeStats[attr] = {
              count: 0,
              maxCoding: 0,
              paths: []
            };
          }
          attributeStats[attr].count++;
          attributeStats[attr].maxCoding = Math.max(attributeStats[attr].maxCoding, result.finalState.points.coding);
          attributeStats[attr].paths.push({
            testId: result.testId,
            coding: result.finalState.points.coding,
            ending: result.ending.name
          });
        });
      }
    });

    console.log(`\\n最高coding值: ${maxCoding}`);
    
    const requiredAttrs = targetEnding.conditions.attributes;
    console.log('\\n需要的属性分析:');
    
    requiredAttrs.forEach(attr => {
      if (attributeStats[attr]) {
        console.log(`✅ ${attr}: 出现${attributeStats[attr].count}次, 最高coding=${attributeStats[attr].maxCoding}`);
        
        // 显示一些示例路径
        const examples = attributeStats[attr].paths.slice(0, 3);
        examples.forEach(example => {
          console.log(`  - ${example.testId}: coding=${example.coding}, 结局=${example.ending}`);
        });
      } else {
        console.log(`❌ ${attr}: 从未出现！`);
      }
    });

    // 分析属性组合
    console.log('\\n🎯 分析具有多个必需属性的路径...');
    
    const combinationPaths = [];
    this.testResults.detailedResults.forEach(result => {
      if (result.ending) {
        const hasAllAttrs = requiredAttrs.every(attr => result.finalState.attributes.includes(attr));
        const meetsCodeReq = result.finalState.points.coding >= (targetEnding.conditions.points?.coding || 0);
        
        if (hasAllAttrs || meetsCodeReq) {
          combinationPaths.push({
            testId: result.testId,
            coding: result.finalState.points.coding,
            hasAllAttrs: hasAllAttrs,
            meetsCodeReq: meetsCodeReq,
            attributes: result.finalState.attributes.filter(attr => requiredAttrs.includes(attr)),
            missingAttrs: requiredAttrs.filter(attr => !result.finalState.attributes.includes(attr)),
            ending: result.ending.name
          });
        }
      }
    });

    combinationPaths.sort((a, b) => b.coding - a.coding);
    
    console.log('\\n最接近目标的路径:');
    combinationPaths.slice(0, 5).forEach(path => {
      console.log(`- ${path.testId}: coding=${path.coding}, 拥有属性=[${path.attributes.join(', ')}], 缺少=[${path.missingAttrs.join(', ')}]`);
    });

    return {
      maxCoding,
      attributeStats,
      combinationPaths,
      requiredAttrs
    };
  }

  // 创建针对性修复方案
  createTargetedFix() {
    console.log('\\n🔧 创建针对性修复方案...');
    
    const analysis = this.analyzeLegendaryProgrammerAlt();
    const targetEnding = this.endings.find(e => e.id === 'ending_legendary_programmer_alt');
    
    // 方案1：显著降低要求
    console.log('\\n方案1：大幅降低条件要求');
    console.log('- 将coding要求从20降到15');
    console.log('- 移除bug_slayer要求，只保留code_approved和demo_perfect');
    
    targetEnding.conditions.points.coding = 15;
    targetEnding.conditions.attributes = ['code_approved', 'demo_perfect'];
    
    // 方案2：增加demo_perfect获取途径
    console.log('\\n方案2：增加demo_perfect获取途径');
    const codeReviewEvent = this.commonEvents.find(e => e.id === 'common_code_review');
    if (codeReviewEvent) {
      const confidentChoice = codeReviewEvent.choices.find(c => 
        c.text === '自信地展示你的代码'
      );
      if (confidentChoice) {
        if (!confidentChoice.outcome.attributes_add.includes('demo_perfect')) {
          confidentChoice.outcome.attributes_add.push('demo_perfect');
          console.log('- 在代码评审的自信展示中添加demo_perfect属性');
        }
      }
    }

    // 方案3：为bug事件添加code_approved获取途径
    const bugEvent = this.storyEvents.find(e => e.id === 'main_bug_invasion');
    if (bugEvent) {
      const debugChoice = bugEvent.choices.find(c => 
        c.text === '使用高级调试技巧追踪Bug'
      );
      if (debugChoice) {
        if (!debugChoice.outcome.attributes_add.includes('code_approved')) {
          debugChoice.outcome.attributes_add.push('code_approved');
          console.log('- 在高级调试中添加code_approved属性');
        }
      }
    }

    return {
      targetEnding,
      modifications: [
        'coding要求降低到15',
        '移除bug_slayer要求',
        '代码评审增加demo_perfect获取途径',
        'Bug调试增加code_approved获取途径'
      ]
    };
  }

  // 保存优化后的配置
  saveOptimizedConfig() {
    console.log('\\n💾 保存优化配置...');
    
    // 保存优化后的故事事件
    const storyPath = path.join(__dirname, '../stories/deadline_story_optimized_balanced.json');
    fs.writeFileSync(storyPath, JSON.stringify(this.storyEvents, null, 2));
    console.log(`✅ 优化后的故事事件已保存: ${storyPath}`);
    
    // 保存优化后的公共事件
    const commonPath = path.join(__dirname, '../stories/common_events_optimized.json');
    fs.writeFileSync(commonPath, JSON.stringify(this.commonEvents, null, 2));
    console.log(`✅ 优化后的公共事件已保存: ${commonPath}`);
    
    // 创建应用脚本
    const applyScript = `#!/bin/bash
# 应用最终优化配置
cp stories/deadline_story_optimized_balanced.json stories/deadline_story_final_balanced.json
cp stories/common_events_optimized.json stories/common_events.json
echo "✅ 已应用最终优化配置"
echo "现在运行最终测试："
echo "  cd testing && node comprehensive_branch_tester.js"
`;
    
    const scriptPath = path.join(__dirname, '../apply_final_optimization.sh');
    fs.writeFileSync(scriptPath, applyScript);
    fs.chmodSync(scriptPath, 0o755);
    console.log(`✅ 应用脚本已创建: ${scriptPath}`);
  }

  // 运行优化器
  run() {
    console.log('🎯 启动最终平衡优化器');
    
    const analysis = this.analyzeLegendaryProgrammerAlt();
    const fixes = this.createTargetedFix();
    this.saveOptimizedConfig();
    
    console.log('\\n🎉 优化完成！');
    console.log('\\n应用修复:');
    fixes.modifications.forEach((mod, index) => {
      console.log(`  ${index + 1}. ${mod}`);
    });
    
    console.log('\\n运行以下命令应用并测试:');
    console.log('  bash apply_final_optimization.sh');
    console.log('  cd testing && node comprehensive_branch_tester.js');
    
    return fixes;
  }
}

if (require.main === module) {
  const optimizer = new FinalBalanceOptimizer();
  try {
    optimizer.run();
  } catch (error) {
    console.error('优化失败:', error);
  }
}

module.exports = FinalBalanceOptimizer;