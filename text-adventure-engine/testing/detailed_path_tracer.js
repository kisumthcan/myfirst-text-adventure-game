const fs = require('fs');
const path = require('path');
const stateManager = require('./game/state_manager');
const eventHandler = require('./game/event_handler');

class DetailedPathTracer {
  constructor() {
    this.config = null;
    this.characters = null;
    this.allEvents = [];
  }

  loadData(useBalanced = false) {
    const gameRulesPath = path.join(__dirname, 'config/game_rules.json');
    const charactersPath = path.join(__dirname, 'config/initial_characters.json');
    
    this.config = JSON.parse(fs.readFileSync(gameRulesPath, 'utf8'));
    this.characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    
    // 选择使用哪个版本的故事文件
    const storiesDir = path.join(__dirname, 'stories');
    let files = ['common_events.json'];
    
    if (useBalanced && fs.existsSync(path.join(storiesDir, 'deadline_story_balanced.json'))) {
      files.push('deadline_story_balanced.json');
      console.log('🔧 使用平衡版本的故事文件');
    } else {
      files.push('deadline_story.json');
      console.log('📖 使用原始版本的故事文件');
    }
    
    this.allEvents = [];
    files.forEach(file => {
      const filePath = path.join(storiesDir, file);
      const events = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.allEvents = this.allEvents.concat(events);
    });
  }

  traceOptimalPath(characterId, targetEndingId) {
    console.log(`\n=== 追踪最优路径：${characterId} -> ${targetEndingId} ===`);
    
    const character = this.characters.find(char => char.id === characterId);
    const targetEnding = this.allEvents.find(e => e.id === targetEndingId);
    
    if (!character || !targetEnding) {
      console.log('❌ 角色或结局未找到');
      return null;
    }
    
    console.log('🎯 目标结局:', targetEnding.name);
    console.log('📋 要求:');
    if (targetEnding.conditions.points) {
      Object.entries(targetEnding.conditions.points).forEach(([key, value]) => {
        console.log(`   ${key} >= ${value}`);
      });
    }
    if (targetEnding.conditions.attributes) {
      console.log(`   属性: ${targetEnding.conditions.attributes.join(', ')}`);
    }
    
    // 尝试多种策略
    const strategies = [
      { name: "积极策略", choices: [0, 0, 0, 0, 0, 0, 0, 0] },
      { name: "平衡策略", choices: [1, 0, 1, 0, 1, 0, 1, 0] },
      { name: "社交策略", choices: [2, 2, 1, 2, 1, 1, 1, 1] },
      { name: "技术策略", choices: [0, 0, 0, 2, 0, 0, 0, 0] },
    ];
    
    let bestPath = null;
    let bestScore = -1;
    
    strategies.forEach(strategy => {
      const result = this.simulatePathWithDetails(character, strategy.choices);
      const score = this.calculateEndingScore(result.finalState, targetEnding);
      
      console.log(`\n📊 ${strategy.name} (选择: ${strategy.choices.slice(0, 4).join(',')}):`);
      console.log(`   最终状态: coding=${result.finalState.points.coding}, social=${result.finalState.points.social}, caffeine=${result.finalState.points.caffeine}`);
      console.log(`   属性: ${result.finalState.attributes.slice(-3).join(', ')}...`);
      console.log(`   匹配分数: ${score}/100`);
      
      if (result.achievedEnding) {
        console.log(`   ✅ 达成结局: ${result.achievedEnding.name}`);
      } else {
        console.log(`   ❌ 未达成任何结局`);
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestPath = result;
      }
    });
    
    if (bestPath && bestPath.achievedEnding && bestPath.achievedEnding.id === targetEndingId) {
      console.log(`\n🎉 成功找到达成 ${targetEnding.name} 的路径！`);
      this.printDetailedPath(bestPath);
      return bestPath;
    } else {
      console.log(`\n❌ 未能找到达成 ${targetEnding.name} 的路径`);
      console.log(`最接近的分数: ${bestScore}/100`);
      
      if (bestPath) {
        console.log('\n🔍 最佳尝试的详细信息:');
        this.printDetailedPath(bestPath);
        this.diagnoseFailure(bestPath, targetEnding);
      }
      
      return null;
    }
  }

  simulatePathWithDetails(character, choiceSequence) {
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
        choiceIndex: selectedChoiceIndex,
        stateBefore: JSON.parse(JSON.stringify(playerState)),
        outcome: outcome
      });

      stateManager.updatePlayerState(playerState, outcome);
      choiceIndex++;

      const ending = eventHandler.checkEndings(this.allEvents, playerState);
      if (ending) {
        return {
          character: character.id,
          choiceSequence,
          finalState: playerState,
          achievedEnding: ending,
          pathEvents,
          turns: currentTurn
        };
      }

      currentTurn++;
      if (currentTurn > 40) break;
    }

    return {
      character: character.id,
      choiceSequence,
      finalState: playerState,
      achievedEnding: null,
      pathEvents,
      turns: currentTurn
    };
  }

  calculateEndingScore(playerState, targetEnding) {
    let score = 0;
    
    if (targetEnding.conditions.points) {
      Object.entries(targetEnding.conditions.points).forEach(([pointType, required]) => {
        const current = playerState.points[pointType] || 0;
        if (current >= required) {
          score += 25; // 满足一个点数条件得25分
        } else {
          // 部分分数：接近程度
          score += Math.floor(25 * current / required);
        }
      });
    }
    
    if (targetEnding.conditions.attributes) {
      targetEnding.conditions.attributes.forEach(attr => {
        if (attr.startsWith('!')) {
          const negativeAttr = attr.substring(1);
          if (!playerState.attributes.includes(negativeAttr)) {
            score += 25; // 满足一个否定属性条件得25分
          }
        } else {
          if (playerState.attributes.includes(attr)) {
            score += 25; // 满足一个正面属性条件得25分
          }
        }
      });
    }
    
    return Math.min(score, 100);
  }

  printDetailedPath(pathResult) {
    console.log('\n📝 详细路径追踪:');
    console.log(`起始状态: ${JSON.stringify(pathResult.pathEvents[0]?.stateBefore.points)}`);
    
    pathResult.pathEvents.forEach((step, index) => {
      console.log(`\n回合 ${step.turn}: ${step.eventName}`);
      console.log(`  选择: ${step.choiceText}`);
      if (step.outcome.points_change && Object.keys(step.outcome.points_change).length > 0) {
        console.log(`  点数变化: ${JSON.stringify(step.outcome.points_change)}`);
      }
      if (step.outcome.attributes_add && step.outcome.attributes_add.length > 0) {
        console.log(`  获得属性: ${step.outcome.attributes_add.join(', ')}`);
      }
    });
    
    console.log(`\n最终状态:`);
    console.log(`  点数: ${JSON.stringify(pathResult.finalState.points)}`);
    console.log(`  属性: ${pathResult.finalState.attributes.join(', ')}`);
  }

  diagnoseFailure(pathResult, targetEnding) {
    console.log('\n🔍 失败原因诊断:');
    
    if (targetEnding.conditions.points) {
      Object.entries(targetEnding.conditions.points).forEach(([pointType, required]) => {
        const current = pathResult.finalState.points[pointType] || 0;
        if (current < required) {
          const gap = required - current;
          console.log(`❌ ${pointType}: 需要 ${required}, 实际 ${current}, 缺少 ${gap}`);
        } else {
          console.log(`✅ ${pointType}: 需要 ${required}, 实际 ${current}`);
        }
      });
    }
    
    if (targetEnding.conditions.attributes) {
      targetEnding.conditions.attributes.forEach(attr => {
        if (attr.startsWith('!')) {
          const negativeAttr = attr.substring(1);
          if (pathResult.finalState.attributes.includes(negativeAttr)) {
            console.log(`❌ 不应有属性 ${negativeAttr}, 但实际拥有`);
          } else {
            console.log(`✅ 正确没有属性 ${negativeAttr}`);
          }
        } else {
          if (pathResult.finalState.attributes.includes(attr)) {
            console.log(`✅ 拥有必需属性 ${attr}`);
          } else {
            console.log(`❌ 缺少必需属性 ${attr}`);
          }
        }
      });
    }
  }

  async run() {
    console.log('🔍 详细路径追踪器启动');
    
    // 测试原始版本
    console.log('\n=== 测试原始版本 ===');
    this.loadData(false);
    this.traceOptimalPath('persona_architect', 'ending_legendary_programmer');
    
    // 测试平衡版本
    console.log('\n=== 测试平衡版本 ===');
    this.loadData(true);
    this.traceOptimalPath('persona_architect', 'ending_legendary_programmer');
    this.traceOptimalPath('persona_intern', 'ending_legendary_programmer');
    
    console.log('\n🎯 路径追踪完成！');
  }
}

if (require.main === module) {
  const tracer = new DetailedPathTracer();
  tracer.run().catch(error => {
    console.error('追踪失败:', error);
  });
}

module.exports = DetailedPathTracer;