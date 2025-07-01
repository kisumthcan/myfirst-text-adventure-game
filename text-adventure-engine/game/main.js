const fs = require('fs');
const path = require('path');
const { input, select, confirm } = require('@inquirer/prompts');
const stateManager = require('./state_manager');
const eventHandler = require('./event_handler');

class GameEngine {
  constructor() {
    this.config = null;
    this.characters = null;
    this.allEvents = [];
    this.playerState = null;
    this.currentTurn = 1;
  }

  loadConfig() {
    try {
      const gameRulesPath = path.join(__dirname, '../config/game_rules.json');
      const charactersPath = path.join(__dirname, '../config/initial_characters.json');
      
      this.config = JSON.parse(fs.readFileSync(gameRulesPath, 'utf8'));
      this.characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
      
      console.log('配置文件加载成功');
    } catch (error) {
      console.error('配置文件加载失败:', error.message);
      process.exit(1);
    }
  }

  loadAllEvents() {
    try {
      const storiesDir = path.join(__dirname, '../stories');
      const files = fs.readdirSync(storiesDir).filter(file => file.endsWith('.json'));
      
      this.allEvents = [];
      
      files.forEach(file => {
        const filePath = path.join(storiesDir, file);
        const events = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.allEvents = this.allEvents.concat(events);
      });
      
      console.log(`成功加载 ${this.allEvents.length} 个事件`);
    } catch (error) {
      console.error('故事文件加载失败:', error.message);
      process.exit(1);
    }
  }

  async selectCharacter() {
    const choices = this.characters.map(char => ({
      name: `${char.name} - ${char.description}`,
      value: char
    }));

    const selectedCharacter = await select({
      message: '请选择你的初始角色：',
      choices: choices
    });

    return selectedCharacter;
  }

  async gameLoop() {
    while (this.currentTurn <= this.config.total_turns) {
      console.log(`\n=== 第 ${this.currentTurn} 回合 ===`);
      
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
      
      const selectedEvent = eventHandler.selectEventByPriority(availableEvents);
      
      const endingTriggered = await this.executeEvent(selectedEvent);
      if (endingTriggered) {
        return;
      }
      
      const ending = eventHandler.checkEndings(this.allEvents, this.playerState);
      if (ending) {
        console.log('\n=== 游戏结束 ===');
        console.log(ending.text);
        return;
      }
      
      this.currentTurn++;
    }
    
    console.log('\n=== 游戏结束 ===');
    console.log(this.config.default_ending.text);
  }

  async executeEvent(event) {
    console.log(`\n${event.text}`);
    
    // 构建所有选择，包括不可选的（显示为禁用状态）
    const choices = event.choices.map((choice) => {
      const isAvailable = stateManager.checkConditions(this.playerState, choice.conditions);
      
      if (isAvailable) {
        return {
          name: choice.text,
          value: choice
        };
      } else {
        const reason = stateManager.generateChoiceReasonText(this.playerState, choice.conditions);
        return {
          name: `${choice.text} (不可选: ${reason})`,
          value: choice,
          disabled: true
        };
      }
    });

    // 检查是否有可选择的选项
    const hasAvailableChoices = choices.some(choice => !choice.disabled);
    if (!hasAvailableChoices) {
      console.log('\n❌ 没有可选择的选项。');
      return false;
    }

    const selectedChoice = await select({
      message: '\n请选择：',
      choices: choices
    });
    const outcome = selectedChoice.outcome;
    
    console.log(`\n${outcome.text}`);
    
    // 显示选择的具体影响
    stateManager.displayChoiceImpact(outcome);
    
    stateManager.updatePlayerState(this.playerState, outcome);
    
    // 如果不是结局事件，等待用户按回车继续
    if (event.type !== 'ending') {
      await input({
        message: '\n按回车键继续下一回合...'
      });
    }
    
    return event.type === 'ending';
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
    
    await input({
      message: '\n按回车键开始游戏...'
    });
    
    await this.gameLoop();
  }
}

if (require.main === module) {
  const game = new GameEngine();
  game.start().catch(error => {
    console.error('游戏运行错误:', error);
    process.exit(1);
  });
}

module.exports = GameEngine;
