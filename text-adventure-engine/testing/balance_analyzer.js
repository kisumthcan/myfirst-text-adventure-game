const fs = require('fs');
const path = require('path');
const stateManager = require('./game/state_manager');
const eventHandler = require('./game/event_handler');

class GameBalanceAnalyzer {
  constructor() {
    this.config = null;
    this.characters = null;
    this.allEvents = [];
    this.endings = [];
    this.mainEvents = [];
    this.commonEvents = [];
    this.simulationResults = new Map();
  }

  loadData() {
    // 加载配置
    const gameRulesPath = path.join(__dirname, 'config/game_rules.json');
    const charactersPath = path.join(__dirname, 'config/initial_characters.json');
    
    this.config = JSON.parse(fs.readFileSync(gameRulesPath, 'utf8'));
    this.characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    
    // 加载所有事件
    const storiesDir = path.join(__dirname, 'stories');
    const files = fs.readdirSync(storiesDir).filter(file => file.endsWith('.json'));
    
    this.allEvents = [];
    files.forEach(file => {
      const filePath = path.join(storiesDir, file);
      const events = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.allEvents = this.allEvents.concat(events);
    });

    // 分类事件
    this.endings = this.allEvents.filter(event => event.type === 'ending');
    this.mainEvents = this.allEvents.filter(event => 
      event.id.startsWith('main_') && event.type !== 'ending'
    );
    this.commonEvents = this.allEvents.filter(event => 
      event.id.startsWith('common_') && event.type !== 'ending'
    );

    console.log(`已加载数据：${this.allEvents.length}个事件，${this.endings.length}个结局`);
  }

  analyzeEndingRequirements() {
    console.log('\n=== 结局条件分析 ===');
    
    this.endings.forEach(ending => {
      console.log(`\n${ending.name} (优先级: ${ending.conditions.priority})`);
      
      if (ending.conditions.points) {
        console.log('  点数要求:', Object.entries(ending.conditions.points)
          .map(([key, value]) => `${key} >= ${value}`)
          .join(', '));
      }
      
      if (ending.conditions.attributes && ending.conditions.attributes.length > 0) {
        console.log('  属性要求:', ending.conditions.attributes.join(', '));
      }
    });
  }

  // 计算所有可能的选择组合
  generateChoiceCombinations() {
    const eventChoices = new Map();
    
    // 为每个主要事件记录选择数量
    this.mainEvents.forEach(event => {
      if (event.choices && event.choices.length > 0) {
        eventChoices.set(event.id, event.choices.length);
      }
    });

    this.commonEvents.forEach(event => {
      if (event.choices && event.choices.length > 0) {
        eventChoices.set(event.id, event.choices.length);
      }
    });

    console.log('\n=== 事件选择分析 ===');
    eventChoices.forEach((choiceCount, eventId) => {
      console.log(`${eventId}: ${choiceCount} 个选择`);
    });

    return eventChoices;
  }

  // 模拟特定路径
  simulatePath(characterId, choiceSequence) {
    const character = this.characters.find(char => char.id === characterId);
    let playerState = stateManager.initializePlayerState(character);
    let currentTurn = 1;
    let pathEvents = [];
    let choiceIndex = 0;

    while (currentTurn <= this.config.total_turns) {
      const availableEvents = eventHandler.filterAvailableEvents(
        this.allEvents, 
        currentTurn, 
        playerState
      );

      if (availableEvents.length === 0) {
        currentTurn++;
        continue;
      }

      const selectedEvent = eventHandler.selectEventByPriority(availableEvents);
      const availableChoices = eventHandler.filterAvailableChoices(selectedEvent.choices, playerState);

      if (availableChoices.length === 0) {
        currentTurn++;
        continue;
      }

      // 使用提供的选择序列，或默认选择第一个
      let selectedChoiceIndex = 0;
      if (choiceIndex < choiceSequence.length) {
        selectedChoiceIndex = Math.min(choiceSequence[choiceIndex], availableChoices.length - 1);
      }

      const selectedChoice = availableChoices[selectedChoiceIndex];
      const outcome = selectedChoice.outcome;

      pathEvents.push({
        turn: currentTurn,
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        choiceText: selectedChoice.text,
        choiceIndex: selectedChoiceIndex
      });

      stateManager.updatePlayerState(playerState, outcome);
      choiceIndex++;

      // 检查是否达成结局
      const ending = eventHandler.checkEndings(this.allEvents, playerState);
      if (ending) {
        return {
          characterId,
          choiceSequence,
          finalState: playerState,
          achievedEnding: ending,
          pathEvents,
          turns: currentTurn
        };
      }

      currentTurn++;

      // 防止无限循环
      if (currentTurn > 40) break;
    }

    return {
      characterId,
      choiceSequence,
      finalState: playerState,
      achievedEnding: null,
      pathEvents,
      turns: currentTurn
    };
  }

  // 系统性测试所有可能的路径
  systematicPathTesting() {
    console.log('\n=== 系统性路径测试 ===');
    
    const endingAchievements = new Map();
    this.endings.forEach(ending => {
      endingAchievements.set(ending.id, []);
    });

    let testCount = 0;
    const maxTests = 1000; // 限制测试数量

    // 为每个角色测试多种选择策略
    this.characters.forEach(character => {
      console.log(`\n测试角色: ${character.name}`);

      // 策略1: 总是选择第一个选项
      const path1 = this.simulatePath(character.id, [0, 0, 0, 0, 0, 0, 0, 0]);
      this.recordPathResult(path1, endingAchievements);
      testCount++;

      // 策略2: 总是选择最后一个选项
      const path2 = this.simulatePath(character.id, [99, 99, 99, 99, 99, 99, 99, 99]);
      this.recordPathResult(path2, endingAchievements);
      testCount++;

      // 策略3: 交替选择
      const path3 = this.simulatePath(character.id, [0, 1, 0, 1, 0, 1, 0, 1]);
      this.recordPathResult(path3, endingAchievements);
      testCount++;

      // 策略4: 随机测试多条路径
      for (let i = 0; i < 10 && testCount < maxTests; i++) {
        const randomChoices = Array.from({length: 8}, () => Math.floor(Math.random() * 3));
        const pathRandom = this.simulatePath(character.id, randomChoices);
        this.recordPathResult(pathRandom, endingAchievements);
        testCount++;
      }
    });

    return this.analyzeEndingAccessibility(endingAchievements);
  }

  recordPathResult(pathResult, endingAchievements) {
    if (pathResult.achievedEnding) {
      endingAchievements.get(pathResult.achievedEnding.id).push({
        character: pathResult.characterId,
        choices: pathResult.choiceSequence,
        finalState: pathResult.finalState
      });
    }

    // 记录详细结果用于调试
    this.simulationResults.set(
      `${pathResult.characterId}_${pathResult.choiceSequence.join('')}`,
      pathResult
    );
  }

  analyzeEndingAccessibility(endingAchievements) {
    console.log('\n=== 结局可达性分析 ===');
    
    const accessibilityReport = {
      accessible: [],
      inaccessible: [],
      totalTests: this.simulationResults.size
    };

    this.endings.forEach(ending => {
      const achievements = endingAchievements.get(ending.id);
      
      if (achievements.length > 0) {
        console.log(`✅ ${ending.name}: 可达 (${achievements.length} 条路径)`);
        accessibilityReport.accessible.push({
          ending: ending,
          pathCount: achievements.length,
          paths: achievements
        });
      } else {
        console.log(`❌ ${ending.name}: 不可达`);
        accessibilityReport.inaccessible.push(ending);
      }
    });

    return accessibilityReport;
  }

  analyzePointProgression() {
    console.log('\n=== 点数增长分析 ===');
    
    // 分析每个事件对点数的影响
    const pointChanges = {
      coding: { min: 0, max: 0, events: [] },
      caffeine: { min: 0, max: 0, events: [] },
      social: { min: 0, max: 0, events: [] }
    };

    this.allEvents.forEach(event => {
      if (event.choices) {
        event.choices.forEach((choice, index) => {
          if (choice.outcome && choice.outcome.points_change) {
            Object.entries(choice.outcome.points_change).forEach(([pointType, change]) => {
              if (pointChanges[pointType]) {
                pointChanges[pointType].min = Math.min(pointChanges[pointType].min, change);
                pointChanges[pointType].max = Math.max(pointChanges[pointType].max, change);
                pointChanges[pointType].events.push({
                  eventId: event.id,
                  eventName: event.name,
                  choiceIndex: index,
                  choiceText: choice.text,
                  change: change
                });
              }
            });
          }
        });
      }
    });

    Object.entries(pointChanges).forEach(([pointType, data]) => {
      console.log(`\n${pointType}:`);
      console.log(`  范围: ${data.min} 到 ${data.max}`);
      console.log(`  影响事件数: ${data.events.length}`);
      
      if (data.events.length > 0) {
        const positiveEvents = data.events.filter(e => e.change > 0);
        const negativeEvents = data.events.filter(e => e.change < 0);
        console.log(`  正面影响: ${positiveEvents.length} 个事件`);
        console.log(`  负面影响: ${negativeEvents.length} 个事件`);
      }
    });

    return pointChanges;
  }

  generateBalancingRecommendations(accessibilityReport, pointChanges) {
    console.log('\n=== 平衡性调整建议 ===');
    
    const recommendations = [];

    // 检查不可达的结局
    accessibilityReport.inaccessible.forEach(ending => {
      console.log(`\n${ending.name} 不可达的可能原因:`);
      
      if (ending.conditions.points) {
        Object.entries(ending.conditions.points).forEach(([pointType, required]) => {
          const maxPossible = this.calculateMaxPossiblePoints(pointType);
          console.log(`  ${pointType}: 需要 ${required}, 理论最大值 ${maxPossible}`);
          
          if (required > maxPossible) {
            recommendations.push({
              type: 'point_requirement_too_high',
              ending: ending.id,
              pointType: pointType,
              required: required,
              maxPossible: maxPossible,
              suggestion: `降低 ${ending.name} 的 ${pointType} 要求从 ${required} 到 ${Math.floor(maxPossible * 0.8)}`
            });
          }
        });
      }

      if (ending.conditions.attributes) {
        ending.conditions.attributes.forEach(attr => {
          if (!attr.startsWith('!')) {
            const canObtain = this.canObtainAttribute(attr);
            if (!canObtain) {
              recommendations.push({
                type: 'missing_attribute_source',
                ending: ending.id,
                attribute: attr,
                suggestion: `为属性 ${attr} 添加获取途径，或从 ${ending.name} 的条件中移除`
              });
            }
          }
        });
      }
    });

    // 检查过于容易达成的结局
    accessibilityReport.accessible.forEach(item => {
      if (item.pathCount > accessibilityReport.totalTests * 0.5) {
        recommendations.push({
          type: 'ending_too_easy',
          ending: item.ending.id,
          pathCount: item.pathCount,
          suggestion: `${item.ending.name} 过于容易达成 (${item.pathCount}/${accessibilityReport.totalTests})，建议提高要求`
        });
      }
    });

    return recommendations;
  }

  calculateMaxPossiblePoints(pointType) {
    let maxPoints = 0;
    
    // 计算每个角色的最高初始值
    this.characters.forEach(char => {
      if (char.initial_state.points[pointType]) {
        maxPoints = Math.max(maxPoints, char.initial_state.points[pointType]);
      }
    });

    // 加上所有可能的正面点数变化
    this.allEvents.forEach(event => {
      if (event.choices) {
        event.choices.forEach(choice => {
          if (choice.outcome && choice.outcome.points_change && choice.outcome.points_change[pointType]) {
            const change = choice.outcome.points_change[pointType];
            if (change > 0) {
              maxPoints += change;
            }
          }
        });
      }
    });

    return maxPoints;
  }

  canObtainAttribute(targetAttribute) {
    return this.allEvents.some(event => {
      if (event.choices) {
        return event.choices.some(choice => {
          return choice.outcome && 
                 choice.outcome.attributes_add && 
                 choice.outcome.attributes_add.includes(targetAttribute);
        });
      }
      return false;
    });
  }

  generateBalancedConfig(recommendations) {
    console.log('\n=== 生成平衡配置 ===');
    
    const balancedEvents = JSON.parse(JSON.stringify(this.allEvents));
    let changesApplied = 0;

    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'point_requirement_too_high':
          const ending = balancedEvents.find(e => e.id === rec.ending);
          if (ending && ending.conditions && ending.conditions.points) {
            const oldValue = ending.conditions.points[rec.pointType];
            ending.conditions.points[rec.pointType] = Math.floor(rec.maxPossible * 0.8);
            console.log(`✅ 调整 ${rec.ending} 的 ${rec.pointType} 要求: ${oldValue} -> ${ending.conditions.points[rec.pointType]}`);
            changesApplied++;
          }
          break;
      }
    });

    if (changesApplied > 0) {
      // 保存平衡后的配置
      const outputPath = path.join(__dirname, 'stories/deadline_story_balanced.json');
      const balancedDeadlineEvents = balancedEvents.filter(e => 
        e.id.startsWith('main_') || e.id.startsWith('ending_')
      );
      
      fs.writeFileSync(outputPath, JSON.stringify(balancedDeadlineEvents, null, 2));
      console.log(`✅ 已生成平衡配置: ${outputPath}`);
      console.log(`应用了 ${changesApplied} 项调整`);
    } else {
      console.log('❌ 没有需要调整的项目');
    }

    return { balancedEvents, changesApplied };
  }

  generateDetailedReport() {
    const reportPath = path.join(__dirname, 'balance_report.md');
    let report = '# 游戏平衡性分析报告\n\n';
    
    report += `生成时间: ${new Date().toLocaleString()}\n\n`;
    
    report += '## 结局条件分析\n\n';
    this.endings.forEach(ending => {
      report += `### ${ending.name}\n`;
      report += `- 优先级: ${ending.conditions.priority}\n`;
      
      if (ending.conditions.points) {
        report += '- 点数要求:\n';
        Object.entries(ending.conditions.points).forEach(([key, value]) => {
          report += `  - ${key} >= ${value}\n`;
        });
      }
      
      if (ending.conditions.attributes && ending.conditions.attributes.length > 0) {
        report += `- 属性要求: ${ending.conditions.attributes.join(', ')}\n`;
      }
      report += '\n';
    });

    fs.writeFileSync(reportPath, report);
    console.log(`✅ 详细报告已保存: ${reportPath}`);
  }

  async run() {
    console.log('🎮 游戏平衡性分析器启动');
    
    this.loadData();
    this.analyzeEndingRequirements();
    this.generateChoiceCombinations();
    const pointChanges = this.analyzePointProgression();
    const accessibilityReport = this.systematicPathTesting();
    const recommendations = this.generateBalancingRecommendations(accessibilityReport, pointChanges);
    
    console.log('\n=== 调整建议汇总 ===');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.suggestion}`);
    });

    const balanceResult = this.generateBalancedConfig(recommendations);
    this.generateDetailedReport();
    
    console.log('\n🎯 分析完成！');
    return {
      accessibilityReport,
      recommendations,
      balanceResult
    };
  }
}

if (require.main === module) {
  const analyzer = new GameBalanceAnalyzer();
  analyzer.run().catch(error => {
    console.error('分析失败:', error);
  });
}

module.exports = GameBalanceAnalyzer;