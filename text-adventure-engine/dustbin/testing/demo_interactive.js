const GameEngine = require('./game/main');

// 演示交互式游戏的完整功能，包括暂停
async function runInteractiveDemo() {
  console.log('=== 文字冒险游戏引擎 - 交互式演示 ===');
  console.log('');
  console.log('这个演示将展示完整的交互式游戏体验，包括：');
  console.log('1. 角色选择后的暂停');
  console.log('2. 每次选择后的暂停');
  console.log('3. 完整的游戏流程');
  console.log('');
  console.log('注意：每次看完结果后，请按回车键继续...');
  console.log('');
  
  const game = new GameEngine();
  await game.start();
}

if (require.main === module) {
  runInteractiveDemo().catch(error => {
    console.error('游戏运行错误:', error);
    process.exit(1);
  });
}