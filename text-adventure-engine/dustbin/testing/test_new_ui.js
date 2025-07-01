const { select } = require('@inquirer/prompts');

// 测试新的UI效果
async function testNewUI() {
  console.log('🧪 测试新的选择界面效果');
  console.log('================================');
  
  console.log('\n产品经理老王走向你的工位，手里拿着一份厚厚的需求文档。\'小伙子，公司的未来就靠你了！36天内必须完成这个革命性的应用！\'');
  
  // 模拟选择项（包含不可选的）
  const choices = [
    {
      name: '充满信心地接受挑战 (不可选: 需要 [is_architect])',
      value: 'confident',
      disabled: true
    },
    {
      name: '谦虚地表示会努力完成',
      value: 'humble'
    },
    {
      name: '询问详细的技术需求', 
      value: 'ask_details'
    }
  ];

  try {
    const selected = await select({
      message: '\n请选择：',
      choices: choices
    });
    
    console.log(`\n你选择了: ${selected}`);
    console.log('\n✅ 新UI测试成功！');
    console.log('特点：');
    console.log('- 不显示"📋 所有选项："部分');
    console.log('- 所有选项直接在选择器中显示');
    console.log('- 不可选的选项显示为灰色且无法选中');
    console.log('- 没有数字编号');
    
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\n测试被用户取消');
    } else {
      console.error('测试出错:', error);
    }
  }
}

if (require.main === module) {
  testNewUI();
}

module.exports = testNewUI;