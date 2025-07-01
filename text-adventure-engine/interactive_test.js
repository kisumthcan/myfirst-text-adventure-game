// 简单的交互式测试脚本，用于验证暂停功能
const GameEngine = require('./game/main');

class InteractiveTestEngine extends GameEngine {
  async selectCharacter() {
    // 自动选择资深架构师进行快速测试
    console.log('[测试模式] 自动选择：资深架构师');
    return this.characters.find(char => char.id === 'persona_architect');
  }

  async gameLoop() {
    // 只运行3回合进行快速测试
    let maxTurns = 3;
    while (this.currentTurn <= maxTurns && this.currentTurn <= this.config.total_turns) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`第 ${this.currentTurn} 回合`);
      console.log(`${'='.repeat(50)}`);
      
      const availableEvents = require('./game/event_handler').filterAvailableEvents(
        this.allEvents, 
        this.currentTurn, 
        this.playerState
      );
      
      if (availableEvents.length === 0) {
        console.log('没有可触发的事件，跳过此回合。');
        this.currentTurn++;
        continue;
      }
      
      const selectedEvent = require('./game/event_handler').selectEventByPriority(availableEvents);
      console.log(`选中事件: ${selectedEvent.name}`);
      
      const endingTriggered = await this.executeEvent(selectedEvent);
      if (endingTriggered) {
        return;
      }
      
      this.currentTurn++;
    }
    
    console.log('\n[测试完成] 暂停功能验证结束');
  }
}

async function testInteractivePause() {
  console.log('=== 交互式暂停功能测试 ===');
  console.log('这个测试将验证用户选择后的暂停功能');
  console.log('请注意观察每次选择后是否会暂停等待按回车\n');
  
  const game = new InteractiveTestEngine();
  await game.start();
}

if (require.main === module) {
  testInteractivePause().catch(error => {
    console.error('测试失败:', error);
  });
}