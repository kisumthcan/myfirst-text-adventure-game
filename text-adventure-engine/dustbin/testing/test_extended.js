const { TestGameEngine } = require('./test_game');

class ExtendedTestGameEngine extends TestGameEngine {
  async gameLoop() {
    while (this.currentTurn <= this.config.total_turns) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`第 ${this.currentTurn} 回合`);
      console.log(`${'='.repeat(50)}`);
      
      const availableEvents = this.loadedEventHandler.filterAvailableEvents(
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
      
      const selectedEvent = this.loadedEventHandler.selectEventByPriority(availableEvents);
      console.log(`选中事件: ${selectedEvent.name} (优先级: ${selectedEvent.conditions?.priority || 0})`);
      
      const endingTriggered = await this.executeEvent(selectedEvent);
      if (endingTriggered) {
        return;
      }
      
      const ending = this.loadedEventHandler.checkEndings(this.allEvents, this.playerState);
      if (ending) {
        console.log('\n' + '='.repeat(50));
        console.log('游戏结束');
        console.log('='.repeat(50));
        console.log(ending.text);
        return;
      }
      
      this.currentTurn++;
      
      // 扩展测试到30回合
      if (this.currentTurn > 30) {
        console.log('\n[测试限制] 已运行30回合，停止测试。');
        break;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('游戏结束');
    console.log('='.repeat(50));
    console.log(this.config.default_ending.text);
  }

  constructor(testCharacterId, testChoices = []) {
    super(testCharacterId, testChoices);
    this.loadedEventHandler = null;
  }

  async start() {
    console.log('=== 文字冒险游戏引擎 ===\n');
    
    this.loadConfig();
    this.loadAllEvents();
    
    // 加载事件处理器
    this.loadedEventHandler = require('./game/event_handler');
    
    const selectedCharacter = await this.selectCharacter();
    const stateManager = require('./game/state_manager');
    this.playerState = stateManager.initializePlayerState(selectedCharacter);
    
    console.log(`\n你选择了：${selectedCharacter.name}`);
    console.log(selectedCharacter.description);
    stateManager.displayPlayerState(this.playerState);
    
    await this.gameLoop();
  }
}

async function testFullGameFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('测试：完整游戏流程（30回合）');
  console.log('='.repeat(60));
  
  // 使用资深架构师，模拟积极选择路径
  const game = new ExtendedTestGameEngine('persona_architect', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  await game.start();
}

if (require.main === module) {
  testFullGameFlow().catch(error => {
    console.error('测试失败:', error);
  });
}