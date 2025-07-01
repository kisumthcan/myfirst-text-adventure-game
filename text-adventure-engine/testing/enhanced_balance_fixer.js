const fs = require('fs');
const path = require('path');

// 增强版平衡修复器 - 基于测试结果进行精确调整
class EnhancedBalanceFixer {
  constructor() {
    this.testResults = null;
    this.storyEvents = [];
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
      console.log('❌ 未找到测试结果文件，请先运行 comprehensive_branch_tester.js');
      process.exit(1);
    }

    // 加载故事事件
    const storyPath = path.join(__dirname, '../stories/deadline_story_final_balanced.json');
    const commonPath = path.join(__dirname, '../stories/common_events.json');
    
    this.storyEvents = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
    this.commonEvents = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
    this.allEvents = this.commonEvents.concat(this.storyEvents);
    this.endings = this.storyEvents.filter(event => event.type === 'ending');
    
    console.log(`✅ 已加载 ${this.allEvents.length} 个事件（故事事件${this.storyEvents.length}个，公共事件${this.commonEvents.length}个），${this.endings.length} 个结局`);
  }

  // 分析无法达成的结局
  analyzeInaccessibleEndings() {
    console.log('\n🔍 分析无法达成的结局...');
    
    const inaccessibleEndings = [];
    
    Object.entries(this.testResults.endingStats).forEach(([endingId, stats]) => {
      if (stats.count === 0) {
        const ending = this.endings.find(e => e.id === endingId);
        inaccessibleEndings.push({
          id: endingId,
          name: stats.name,
          conditions: ending.conditions,
          requiredAttributes: ending.conditions.attributes || [],
          requiredPoints: ending.conditions.points || {}
        });
      }
    });

    return inaccessibleEndings;
  }

  // 分析属性获取途径
  analyzeAttributeAcquisition() {
    console.log('\n🔍 分析属性获取途径...');
    
    const attributeSourceMap = {};
    
    this.allEvents.forEach(event => {
      if (event.choices) {
        event.choices.forEach(choice => {
          if (choice.outcome && choice.outcome.attributes_add) {
            choice.outcome.attributes_add.forEach(attr => {
              if (!attributeSourceMap[attr]) {
                attributeSourceMap[attr] = [];
              }
              attributeSourceMap[attr].push({
                eventId: event.id,
                eventName: event.name,
                choiceText: choice.text,
                choiceConditions: choice.conditions,
                pointsChange: choice.outcome.points_change || {}
              });
            });
          }
        });
      }
    });

    return attributeSourceMap;
  }

  // 分析成功路径中的属性模式
  analyzeSuccessfulPaths() {
    console.log('\n🔍 分析成功路径的属性模式...');
    
    const pathAnalysis = {};
    
    this.testResults.detailedResults.forEach(result => {
      if (result.ending) {
        const endingId = result.ending.id;
        if (!pathAnalysis[endingId]) {
          pathAnalysis[endingId] = {
            name: result.ending.name,
            maxCoding: 0,
            maxSocial: 0,
            maxCaffeine: 0,
            commonAttributes: {},
            pathCount: 0
          };
        }
        
        const analysis = pathAnalysis[endingId];
        analysis.pathCount++;
        
        // 记录最大点数
        analysis.maxCoding = Math.max(analysis.maxCoding, result.finalState.points.coding);
        analysis.maxSocial = Math.max(analysis.maxSocial, result.finalState.points.social);
        analysis.maxCaffeine = Math.max(analysis.maxCaffeine, result.finalState.points.caffeine);
        
        // 统计常见属性
        result.finalState.attributes.forEach(attr => {
          analysis.commonAttributes[attr] = (analysis.commonAttributes[attr] || 0) + 1;
        });
      }
    });

    return pathAnalysis;
  }

  // 为技术路线传奇程序员提供解决方案
  fixLegendaryProgrammerAlt() {
    console.log('\n🔧 修复传奇程序员(技术路线)...');
    
    const ending = this.endings.find(e => e.id === 'ending_legendary_programmer_alt');
    if (!ending) {
      console.log('❌ 未找到传奇程序员(技术路线)结局');
      return false;
    }

    console.log('当前条件:', ending.conditions);
    
    // 分析属性获取途径
    const attributeMap = this.analyzeAttributeAcquisition();
    const requiredAttrs = ending.conditions.attributes || [];
    
    console.log('\n需要的属性及获取途径:');
    requiredAttrs.forEach(attr => {
      console.log(`- ${attr}:`);
      if (attributeMap[attr]) {
        attributeMap[attr].forEach(source => {
          console.log(`  * ${source.eventName} - ${source.choiceText}`);
          if (source.choiceConditions) {
            console.log(`    条件: ${JSON.stringify(source.choiceConditions)}`);
          }
        });
      } else {
        console.log(`  ❌ 未找到获取途径！`);
      }
    });

    // 创建修复方案
    const fixes = [];
    
    // 方案1：降低coding要求
    if (ending.conditions.points && ending.conditions.points.coding > 20) {
      fixes.push({
        type: 'lower_coding_requirement',
        description: '降低coding要求从25到20',
        action: () => {
          ending.conditions.points.coding = 20;
        }
      });
    }

    // 方案2：增加属性获取途径
    if (!attributeMap['demo_perfect'] || attributeMap['demo_perfect'].length < 2) {
      fixes.push({
        type: 'add_demo_perfect_source',
        description: '在代码评审中增加demo_perfect获取途径',
        action: () => {
          const codeReviewEvent = this.storyEvents.find(e => e.id === 'main_code_review');
          if (codeReviewEvent) {
            const confidentChoice = codeReviewEvent.choices.find(c => 
              c.text.includes('自信地展示') || c.text.includes('自信展示')
            );
            if (confidentChoice) {
              if (!confidentChoice.outcome.attributes_add.includes('demo_perfect')) {
                confidentChoice.outcome.attributes_add.push('demo_perfect');
              }
            }
          }
        }
      });
    }

    // 方案3：减少必需属性数量
    if (requiredAttrs.length > 3) {
      fixes.push({
        type: 'reduce_required_attributes',
        description: '移除bug_slayer要求，只需要code_approved和demo_perfect',
        action: () => {
          ending.conditions.attributes = ending.conditions.attributes.filter(attr => attr !== 'bug_slayer');
        }
      });
    }

    // 执行修复
    console.log('\n🛠️ 应用修复方案:');
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.description}`);
      fix.action();
    });

    return fixes.length > 0;
  }

  // 增强选择的点数奖励
  enhancePointRewards() {
    console.log('\n💪 增强点数奖励...');
    
    let changes = 0;
    
    this.storyEvents.forEach(event => {
      if (event.choices) {
        event.choices.forEach(choice => {
          if (choice.outcome && choice.outcome.points_change) {
            // 增强coding相关的奖励
            if (choice.outcome.points_change.coding && choice.outcome.points_change.coding > 0) {
              const oldValue = choice.outcome.points_change.coding;
              choice.outcome.points_change.coding = Math.min(oldValue + 1, 8); // 最多增加到8
              if (choice.outcome.points_change.coding !== oldValue) {
                console.log(`  - ${event.name}: ${choice.text} coding ${oldValue} -> ${choice.outcome.points_change.coding}`);
                changes++;
              }
            }
            
            // 增强social相关的奖励
            if (choice.outcome.points_change.social && choice.outcome.points_change.social > 0) {
              const oldValue = choice.outcome.points_change.social;
              choice.outcome.points_change.social = Math.min(oldValue + 1, 6); // 最多增加到6
              if (choice.outcome.points_change.social !== oldValue) {
                console.log(`  - ${event.name}: ${choice.text} social ${oldValue} -> ${choice.outcome.points_change.social}`);
                changes++;
              }
            }
          }
        });
      }
    });

    console.log(`✅ 共增强了 ${changes} 个选择的点数奖励`);
    return changes > 0;
  }

  // 保存修复后的文件
  saveFixedStory() {
    const outputPath = path.join(__dirname, '../stories/deadline_story_enhanced_balanced.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.storyEvents, null, 2));
    console.log(`✅ 修复后的故事文件已保存: ${outputPath}`);
    
    // 直接应用到final_balanced文件
    const finalPath = path.join(__dirname, '../stories/deadline_story_final_balanced.json');
    fs.writeFileSync(finalPath, JSON.stringify(this.storyEvents, null, 2));
    console.log(`✅ 已直接应用到最终平衡文件: ${finalPath}`);
    
    // 创建应用脚本
    const applyScript = `#!/bin/bash
# 应用增强平衡配置
cp stories/deadline_story_enhanced_balanced.json stories/deadline_story_final_balanced.json
echo "✅ 已应用增强平衡配置"
echo "现在可以运行测试验证："
echo "  cd testing && node comprehensive_branch_tester.js"
`;
    
    const scriptPath = path.join(__dirname, '../apply_enhanced_balance.sh');
    fs.writeFileSync(scriptPath, applyScript);
    fs.chmodSync(scriptPath, 0o755);
    console.log(`✅ 应用脚本已创建: ${scriptPath}`);
  }

  // 生成修复报告
  generateFixReport(fixes) {
    const report = `# 平衡修复报告

生成时间: ${new Date().toLocaleString()}

## 修复问题

### 传奇程序员(技术路线) - 无法达成

**问题分析:**
- 当前条件: coding >= 25 + code_approved + bug_slayer + demo_perfect
- 在60次测试中0次达成
- 主要问题: 条件过于苛刻，属性获取途径不足

**修复方案:**
${fixes.map((fix, i) => `${i + 1}. ${fix.description}`).join('\n')}

## 修复后建议

1. 运行 \`bash apply_enhanced_balance.sh\` 应用修复
2. 重新运行测试: \`cd testing && node comprehensive_branch_tester.js\`
3. 验证所有结局是否可达

## 预期效果

- 传奇程序员(技术路线)应该可以通过高编程技能路径达成
- 保持其他结局的平衡性
- 提供多样化的游戏体验路径
`;

    const reportPath = path.join(__dirname, 'balance_fix_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`✅ 修复报告已保存: ${reportPath}`);
  }

  // 运行修复器
  run() {
    console.log('🔧 启动增强平衡修复器');
    
    const inaccessibleEndings = this.analyzeInaccessibleEndings();
    const attributeMap = this.analyzeAttributeAcquisition();
    const pathAnalysis = this.analyzeSuccessfulPaths();
    
    console.log(`\n📊 发现 ${inaccessibleEndings.length} 个无法达成的结局:`);
    inaccessibleEndings.forEach(ending => {
      console.log(`- ${ending.name} (${ending.id})`);
    });

    const fixes = [];
    
    // 修复传奇程序员(技术路线)
    if (inaccessibleEndings.find(e => e.id === 'ending_legendary_programmer_alt')) {
      if (this.fixLegendaryProgrammerAlt()) {
        fixes.push('传奇程序员(技术路线)修复');
      }
    }

    // 增强点数奖励
    if (this.enhancePointRewards()) {
      fixes.push('点数奖励增强');
    }

    // 保存修复结果
    this.saveFixedStory();
    this.generateFixReport(fixes);

    console.log('\n🎉 修复完成！');
    console.log('请运行以下命令应用修复并重新测试:');
    console.log('  bash apply_enhanced_balance.sh');
    console.log('  cd testing && node comprehensive_branch_tester.js');
    
    return fixes;
  }
}

if (require.main === module) {
  const fixer = new EnhancedBalanceFixer();
  try {
    fixer.run();
  } catch (error) {
    console.error('修复失败:', error);
  }
}

module.exports = EnhancedBalanceFixer;