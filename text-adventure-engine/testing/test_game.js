const GameEngine = require('./game/main');
const stateManager = require('./game/state_manager');
const eventHandler = require('./game/event_handler');

class TestGameEngine extends GameEngine {
  constructor(testCharacterId, testChoices = []) {
    super();
    this.testCharacterId = testCharacterId;
    this.testChoices = testChoices;
    this.choiceIndex = 0;
  }

  async selectCharacter() {
    const character = this.characters.find(char => char.id === this.testCharacterId);
    if (!character) {
      throw new Error(`找不到角色: ${this.testCharacterId}`);
    }
    console.log(`[自动选择] ${character.name} - ${character.description}`);
    return character;
  }

  async executeEvent(event) {
    console.log(`\n${event.text}`);
    
    const availableChoices = eventHandler.filterAvailableChoices(event.choices, this.playerState);
    
    if (availableChoices.length === 0) {
      console.log('没有可选择的选项。');
      return false;
    }
    
    console.log('\n可选择的选项:');
    availableChoices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice.text}`);
    });
    
    let selectedIndex = 0;
    if (this.choiceIndex < this.testChoices.length) {
      selectedIndex = this.testChoices[this.choiceIndex];
      this.choiceIndex++;
    }
    
    if (selectedIndex >= availableChoices.length) {
      selectedIndex = 0;
    }
    
    const selectedChoice = availableChoices[selectedIndex];
    console.log(`\n[自动选择] ${selectedChoice.text}`);
    
    const outcome = selectedChoice.outcome;
    console.log(`\n${outcome.text}`);
    
    stateManager.updatePlayerState(this.playerState, outcome);
    stateManager.displayPlayerState(this.playerState);
    
    return event.type === 'ending';
  }

  async gameLoop() {
    while (this.currentTurn <= this.config.total_turns) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`第 ${this.currentTurn} 回合`);
      console.log(`${'='.repeat(50)}`);
      
      const availableEvents = eventHandler.filterAvailableEvents(
        this.allEvents, 
        this.currentTurn, 
        this.playerState
      );
      
      if (availableEvents.length === 0) {
        console.log('没有可触发的事件，跳过此回合。');
        this.currentTurn++;
        continue;
      }
      
      console.log(`\n可触发事件: ${availableEvents.length} 个`);
      
      const selectedEvent = eventHandler.selectEventByPriority(availableEvents);
      console.log(`选中事件: ${selectedEvent.name} (优先级: ${selectedEvent.conditions?.priority || 0})`);
      
      const endingTriggered = await this.executeEvent(selectedEvent);
      if (endingTriggered) {
        return;
      }
      
      const ending = eventHandler.checkEndings(this.allEvents, this.playerState);
      if (ending) {
        console.log('\n' + '='.repeat(50));
        console.log('游戏结束');
        console.log('='.repeat(50));
        console.log(ending.text);
        return;
      }
      
      this.currentTurn++;
      
      if (this.currentTurn > 10) {
        console.log('\n[测试限制] 已运行10回合，停止测试。');
        break;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('游戏结束');
    console.log('='.repeat(50));
    console.log(this.config.default_ending.text);
  }

  async start() {
    console.log('=== 文字冒险游戏引擎 ===\n');
    
    this.loadConfig();
    this.loadAllEvents();
    
    const selectedCharacter = await this.selectCharacter();
    this.playerState = stateManager.initializePlayerState(selectedCharacter);
    
    console.log(`\n你选择了：${selectedCharacter.name}`);
    console.log(selectedCharacter.description);
    stateManager.displayPlayerState(this.playerState);
    
    // 测试模式下跳过"按回车开始游戏"的暂停
    console.log('\n[测试模式] 自动开始游戏...');
    
    await this.gameLoop();
  }
}

async function testArchitectPlaythrough() {
  console.log('\n' + '='.repeat(60));
  console.log('测试：资深架构师游戏流程');
  console.log('='.repeat(60));
  
  const game = new TestGameEngine('persona_architect', [0, 0, 0, 1, 0]);
  await game.start();
}

async function testInternPlaythrough() {
  console.log('\n' + '='.repeat(60));
  console.log('测试：热血实习生游戏流程');
  console.log('='.repeat(60));
  
  const game = new TestGameEngine('persona_intern', [1, 1, 1, 0, 1]);
  await game.start();
}

async function runAllTests() {
  try {
    await testArchitectPlaythrough();
    console.log('\n\n');
    await testInternPlaythrough();
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { TestGameEngine, testArchitectPlaythrough, testInternPlaythrough };