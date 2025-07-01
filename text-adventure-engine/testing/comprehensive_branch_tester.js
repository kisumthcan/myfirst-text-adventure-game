const fs = require('fs');
const path = require('path');

// 综合分支测试器 - 系统测试所有可能的游戏路径
class ComprehensiveBranchTester {
  constructor() {
    this.config = null;
    this.characters = null;
    this.allEvents = [];
    this.testResults = [];
    this.loadGameData();
  }

  loadGameData() {
    const gameRulesPath = path.join(__dirname, '../config/game_rules.json');
    const charactersPath = path.join(__dirname, '../config/initial_characters.json');
    
    this.config = JSON.parse(fs.readFileSync(gameRulesPath, 'utf8'));
    this.characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    
    // 加载故事事件
    const commonEventsPath = path.join(__dirname, '../stories/common_events.json');
    const storyEventsPath = path.join(__dirname, '../stories/deadline_story_final_balanced.json');
    
    const commonEvents = JSON.parse(fs.readFileSync(commonEventsPath, 'utf8'));
    const storyEvents = JSON.parse(fs.readFileSync(storyEventsPath, 'utf8'));
    
    this.allEvents = commonEvents.concat(storyEvents);
    this.endings = this.allEvents.filter(event => event.type === 'ending');
    
    console.log(`✅ 已加载游戏数据：${this.allEvents.length}个事件，${this.endings.length}个结局`);
  }

  // 初始化玩家状态
  initializePlayerState(character) {
    return {
      points: { ...character.initial_state.points },
      attributes: [...character.initial_state.attributes],
      characterId: character.id
    };
  }

  // 检查条件
  checkConditions(playerState, conditions) {
    if (!conditions) return true;

    // 检查点数条件
    if (conditions.points) {
      for (const [pointType, required] of Object.entries(conditions.points)) {
        const current = playerState.points[pointType] || 0;
        if (current < required) return false;
      }
    }

    // 检查属性条件
    if (conditions.attributes) {
      for (const attr of conditions.attributes) {
        if (attr.startsWith('!')) {
          const negatedAttr = attr.substring(1);
          if (playerState.attributes.includes(negatedAttr)) return false;
        } else {
          if (!playerState.attributes.includes(attr)) return false;
        }
      }
    }

    return true;
  }

  // 更新玩家状态
  updatePlayerState(playerState, outcome) {
    if (outcome.points_change) {
      Object.entries(outcome.points_change).forEach(([pointType, change]) => {
        if (playerState.points[pointType] !== undefined) {
          playerState.points[pointType] += change;
          playerState.points[pointType] = Math.max(0, playerState.points[pointType]);
        }
      });
    }

    if (outcome.attributes_add) {
      outcome.attributes_add.forEach(attr => {
        if (!playerState.attributes.includes(attr)) {
          playerState.attributes.push(attr);
        }
      });
    }

    if (outcome.attributes_remove) {
      outcome.attributes_remove.forEach(attr => {
        const index = playerState.attributes.indexOf(attr);
        if (index > -1) {
          playerState.attributes.splice(index, 1);
        }
      });
    }
  }

  // 获取可用事件
  getAvailableEvents(turn, playerState) {
    return this.allEvents.filter(event => {
      if (event.type === 'ending') return false;
      
      // 检查回合范围
      if (event.turn_range && (turn < event.turn_range[0] || turn > event.turn_range[1])) {
        return false;
      }
      
      // 检查条件
      return this.checkConditions(playerState, event.conditions);
    });
  }

  // 选择最高优先级事件
  selectEventByPriority(events) {
    if (events.length === 0) return null;
    
    const maxPriority = Math.max(...events.map(e => e.conditions?.priority || 0));
    const highPriorityEvents = events.filter(e => (e.conditions?.priority || 0) === maxPriority);
    
    return highPriorityEvents[Math.floor(Math.random() * highPriorityEvents.length)];
  }

  // 检查是否达成结局
  checkForEnding(playerState) {
    for (const ending of this.endings) {
      if (this.checkConditions(playerState, ending.conditions)) {
        return ending;
      }
    }
    return null;
  }

  // 获取事件的可用选择
  getAvailableChoices(event, playerState) {
    if (!event.choices) return [];
    return event.choices.filter(choice => this.checkConditions(playerState, choice.conditions));
  }

  // 模拟单个游戏路径
  simulateGamePath(character, strategyChoices, maxTurns = 36) {
    const playerState = this.initializePlayerState(character);
    const pathLog = [];
    let currentTurn = 1;
    let choiceIndex = 0;

    pathLog.push({
      turn: 0,
      action: 'character_selected',
      character: character.name,
      state: JSON.parse(JSON.stringify(playerState))
    });

    while (currentTurn <= maxTurns) {
      // 检查结局
      const ending = this.checkForEnding(playerState);
      if (ending) {
        pathLog.push({
          turn: currentTurn,
          action: 'ending_reached',
          ending: ending.name,
          endingId: ending.id,
          finalState: JSON.parse(JSON.stringify(playerState))
        });
        return {
          success: true,
          ending: ending,
          pathLog: pathLog,
          finalState: playerState,
          totalTurns: currentTurn
        };
      }

      // 获取可用事件
      const availableEvents = this.getAvailableEvents(currentTurn, playerState);
      if (availableEvents.length === 0) {
        currentTurn++;
        continue;
      }

      // 选择事件
      const selectedEvent = this.selectEventByPriority(availableEvents);
      const availableChoices = this.getAvailableChoices(selectedEvent, playerState);
      
      if (availableChoices.length === 0) {
        pathLog.push({
          turn: currentTurn,
          action: 'no_choices_available',
          event: selectedEvent.name,
          state: JSON.parse(JSON.stringify(playerState))
        });
        currentTurn++;
        continue;
      }

      // 根据策略选择
      let selectedChoice;
      if (choiceIndex < strategyChoices.length && strategyChoices[choiceIndex] < availableChoices.length) {
        selectedChoice = availableChoices[strategyChoices[choiceIndex]];
      } else {
        selectedChoice = availableChoices[0]; // 默认选择第一个
      }

      pathLog.push({
        turn: currentTurn,
        action: 'choice_made',
        event: selectedEvent.name,
        eventId: selectedEvent.id,
        choice: selectedChoice.text,
        choiceIndex: availableChoices.indexOf(selectedChoice),
        stateBefore: JSON.parse(JSON.stringify(playerState))
      });

      // 应用选择结果
      this.updatePlayerState(playerState, selectedChoice.outcome);
      
      pathLog.push({
        turn: currentTurn,
        action: 'state_updated',
        outcome: selectedChoice.outcome,
        stateAfter: JSON.parse(JSON.stringify(playerState))
      });

      choiceIndex++;
      currentTurn++;
    }

    // 游戏结束但没有达成特定结局
    return {
      success: false,
      ending: null,
      pathLog: pathLog,
      finalState: playerState,
      totalTurns: currentTurn
    };
  }

  // 生成多种测试策略
  generateTestStrategies() {
    return [
      { name: "积极技术流", choices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: "平衡发展", choices: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] },
      { name: "社交导向", choices: [2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1] },
      { name: "技术专精", choices: [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: "佛系路线", choices: [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { name: "失败积累", choices: [2, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
      { name: "随机探索A", choices: [1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0] },
      { name: "随机探索B", choices: [2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1] },
      { name: "保守策略", choices: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { name: "激进策略", choices: [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0] }
    ];
  }

  // 全面测试所有分支
  runComprehensiveTest() {
    console.log('\n🧪 开始全面分支测试...');
    
    const strategies = this.generateTestStrategies();
    const results = {
      totalTests: 0,
      endingStats: {},
      detailedResults: []
    };

    // 初始化结局统计
    this.endings.forEach(ending => {
      results.endingStats[ending.id] = {
        name: ending.name,
        count: 0,
        paths: []
      };
    });

    // 为每个角色测试每种策略
    this.characters.forEach(character => {
      console.log(`\n🎭 测试角色: ${character.name}`);
      
      strategies.forEach((strategy, strategyIndex) => {
        // 为每种策略生成多个变种
        for (let variant = 0; variant < 3; variant++) {
          const variantChoices = [...strategy.choices];
          
          // 生成策略变种
          if (variant > 0) {
            for (let i = 0; i < 2; i++) {
              const randomIndex = Math.floor(Math.random() * variantChoices.length);
              variantChoices[randomIndex] = Math.floor(Math.random() * 4);
            }
          }

          const result = this.simulateGamePath(character, variantChoices);
          results.totalTests++;

          const testResult = {
            testId: `${character.id}_${strategyIndex}_v${variant}`,
            character: character.name,
            characterId: character.id,
            strategy: `${strategy.name}_v${variant}`,
            choices: variantChoices,
            success: result.success,
            ending: result.ending,
            finalState: result.finalState,
            totalTurns: result.totalTurns,
            pathLog: result.pathLog
          };

          results.detailedResults.push(testResult);

          if (result.ending) {
            results.endingStats[result.ending.id].count++;
            results.endingStats[result.ending.id].paths.push(testResult);
          }

          // 保存详细的路径记录
          this.savePathLog(testResult);
        }
      });
    });

    this.saveTestResults(results);
    this.generateTestReport(results);
    
    return results;
  }

  // 保存路径日志
  savePathLog(testResult) {
    const samplesDir = path.join(__dirname, 'test_samples');
    if (!fs.existsSync(samplesDir)) {
      fs.mkdirSync(samplesDir, { recursive: true });
    }

    const filename = `${testResult.testId}.json`;
    const filepath = path.join(samplesDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(testResult, null, 2));
  }

  // 保存测试结果汇总
  saveTestResults(results) {
    const filepath = path.join(__dirname, 'comprehensive_test_results.json');
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  }

  // 生成测试报告
  generateTestReport(results) {
    console.log('\n📊 测试结果汇总:');
    console.log(`总测试次数: ${results.totalTests}`);
    
    let accessibleEndings = 0;
    
    this.endings.forEach(ending => {
      const stats = results.endingStats[ending.id];
      if (stats.count > 0) {
        console.log(`✅ ${stats.name}: ${stats.count} 次达成`);
        accessibleEndings++;
      } else {
        console.log(`❌ ${stats.name}: 0 次达成`);
      }
    });

    const accessibilityRate = (accessibleEndings / this.endings.length * 100).toFixed(1);
    console.log(`\n📈 结局覆盖率: ${accessibleEndings}/${this.endings.length} (${accessibilityRate}%)`);

    // 生成详细报告文件
    const reportContent = this.generateDetailedReport(results);
    const reportPath = path.join(__dirname, 'comprehensive_test_report.md');
    fs.writeFileSync(reportPath, reportContent);
    
    console.log(`📋 详细报告已保存: ${reportPath}`);
    console.log(`📁 测试样例已保存: ${path.join(__dirname, 'test_samples')}/`);
  }

  // 生成详细报告内容
  generateDetailedReport(results) {
    let report = `# 游戏分支全面测试报告\n\n`;
    report += `生成时间: ${new Date().toLocaleString()}\n\n`;
    report += `## 测试概况\n\n`;
    report += `- 总测试次数: ${results.totalTests}\n`;
    report += `- 测试角色: ${this.characters.length} 个\n`;
    report += `- 测试策略: ${this.generateTestStrategies().length} 种\n`;
    report += `- 结局总数: ${this.endings.length} 个\n\n`;

    report += `## 结局达成情况\n\n`;
    
    let accessibleEndings = 0;
    this.endings.forEach(ending => {
      const stats = results.endingStats[ending.id];
      const accessible = stats.count > 0;
      if (accessible) accessibleEndings++;
      
      report += `### ${accessible ? '✅' : '❌'} ${stats.name}\n\n`;
      report += `- 达成次数: ${stats.count}\n`;
      
      if (stats.count > 0) {
        report += `- 成功角色分布:\n`;
        const characterDistribution = {};
        stats.paths.forEach(path => {
          characterDistribution[path.characterId] = (characterDistribution[path.characterId] || 0) + 1;
        });
        
        Object.entries(characterDistribution).forEach(([charId, count]) => {
          const char = this.characters.find(c => c.id === charId);
          report += `  - ${char?.name || charId}: ${count} 次\n`;
        });
        
        // 展示一个成功路径的关键数据
        const examplePath = stats.paths[0];
        report += `- 示例成功路径:\n`;
        report += `  - 角色: ${examplePath.character}\n`;
        report += `  - 策略: ${examplePath.strategy}\n`;
        report += `  - 最终状态: coding=${examplePath.finalState.points.coding}, social=${examplePath.finalState.points.social}, caffeine=${examplePath.finalState.points.caffeine}\n`;
        report += `  - 关键属性: ${examplePath.finalState.attributes.join(', ')}\n`;
        report += `  - 详细路径: test_samples/${examplePath.testId}.json\n`;
      } else {
        report += `- ⚠️ 此结局尚未找到可达路径，需要调整游戏数值\n`;
      }
      
      report += `\n`;
    });

    const accessibilityRate = (accessibleEndings / this.endings.length * 100).toFixed(1);
    report += `## 总结\n\n`;
    report += `- 结局覆盖率: ${accessibleEndings}/${this.endings.length} (${accessibilityRate}%)\n`;
    
    if (accessibilityRate < 100) {
      report += `- ⚠️ 仍有 ${this.endings.length - accessibleEndings} 个结局无法达成，需要进一步数值调整\n`;
      report += `- 建议使用 enhanced_balance_fixer.js 基于这些测试结果进行针对性调整\n`;
    } else {
      report += `- 🎉 所有结局均可达成，游戏平衡性良好！\n`;
    }

    return report;
  }

  // 运行测试
  run() {
    console.log('🚀 启动综合分支测试器');
    const results = this.runComprehensiveTest();
    return results;
  }
}

if (require.main === module) {
  const tester = new ComprehensiveBranchTester();
  try {
    tester.run();
  } catch (error) {
    console.error('测试失败:', error);
  }
}

module.exports = ComprehensiveBranchTester;