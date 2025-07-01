const fs = require('fs');
const path = require('path');

class FinalBalanceFix {
  constructor() {
    this.events = null;
  }

  loadBalancedEvents() {
    const filePath = path.join(__dirname, 'stories/deadline_story_balanced.json');
    this.events = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  applyFinalFixes() {
    console.log('🔧 应用最终平衡修复');
    
    // 修复1: 降低完美展示的条件要求
    const demoEvent = this.events.find(e => e.id === "main_05_final_demo");
    if (demoEvent) {
      const perfectChoice = demoEvent.choices.find(c => 
        c.text === "完美展示所有功能"
      );
      if (perfectChoice) {
        // 大幅降低条件要求
        perfectChoice.conditions = {
          points: { coding: 15, social: 8, caffeine: 3 }
        };
        console.log("✅ 降低完美展示的条件要求: coding 15, social 8, caffeine 3");
      }

      // 修复2: 在诚实汇报选择中也添加project_success获取途径
      const honestChoice = demoEvent.choices.find(c => 
        c.text === "诚实汇报项目进度和困难"
      );
      if (honestChoice) {
        // 为诚实汇报也添加一种project_success
        honestChoice.outcome.attributes_add.push("project_success");
        console.log("✅ 为诚实汇报添加project_success获取途径");
      }
    }

    // 修复3: 在代码评审中添加demo_perfect的替代获取途径
    const reviewEvent = this.events.find(e => e.id === "common_code_review");
    if (reviewEvent) {
      const confidentChoice = reviewEvent.choices.find(c => 
        c.text === "自信地展示你的代码"
      );
      if (confidentChoice) {
        // 为自信展示添加demo_perfect属性（代表展示能力强）
        confidentChoice.outcome.attributes_add.push("demo_perfect");
        console.log("✅ 为代码评审自信展示添加demo_perfect获取途径");
      }
    }

    // 修复4: 进一步降低传奇程序员的要求
    const legendaryEnding = this.events.find(e => e.id === "ending_legendary_programmer");
    if (legendaryEnding) {
      // 提供一个alternative条件：要么满足原条件，要么满足较低条件+更多属性
      legendaryEnding.conditions = {
        points: { coding: 18, social: 10 },
        attributes: ["project_success", "demo_perfect"],
        priority: 100
      };
      console.log("✅ 进一步降低传奇程序员要求: coding 18, social 10");
    }

    // 修复5: 添加一个新的传奇程序员获取路径
    const newLegendaryPath = {
      id: "ending_legendary_programmer_alt",
      name: "传奇程序员(技术路线)",
      type: "ending", 
      conditions: {
        points: { coding: 25 },
        attributes: ["code_approved", "bug_slayer", "demo_perfect"],
        priority: 95
      },
      text: "虽然你的社交能力一般，但你的技术实力有目共睹！代码审查获得了架构师的认可，Bug调试展现了深厚功底，项目演示技惊四座。技术就是你最好的名片，你成为了代码城备受尊敬的技术大牛！",
      choices: []
    };
    
    // 检查是否已存在，避免重复添加
    if (!this.events.find(e => e.id === "ending_legendary_programmer_alt")) {
      this.events.push(newLegendaryPath);
      console.log("✅ 添加新的传奇程序员替代路径(技术路线)");
    }
  }

  saveFixedConfig() {
    const outputPath = path.join(__dirname, 'stories/deadline_story_final_balanced.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.events, null, 2));
    console.log(`✅ 最终平衡配置已保存: ${outputPath}`);
  }

  generateUsageInstructions() {
    const instructions = `# 如何使用平衡后的配置

## 替换原始配置
1. 备份原始文件:
   \`cp stories/deadline_story.json stories/deadline_story_original.json\`

2. 使用平衡配置:
   \`cp stories/deadline_story_final_balanced.json stories/deadline_story.json\`

3. 运行游戏测试:
   \`node test_game.js\`

## 平衡后的结局路径

### 传奇程序员 (两种路径)
1. **全能路径**: coding >= 18, social >= 10 + project_success + demo_perfect
2. **技术路线**: coding >= 25 + code_approved + bug_slayer + demo_perfect

### 佛系码农
- social >= 18 + wellness_advocate + team_player
- wellness_advocate条件已放宽

### 加班狂魔  
- coding >= 18 + exhausted + lone_wolf
- 通过Bug事件"熬夜独自解决"获得

### 转行大师
- coding >= 8 + frustrated + caffeine_withdrawal  
- 最容易达成的结局

## 关键属性获取方式

- **demo_perfect**: 代码评审自信展示 OR 终极演示完美展示
- **project_success**: 终极演示完美展示 OR 诚实汇报 
- **team_player**: Bug事件协助调试 OR 代码评审虚心请教
- **wellness_advocate**: 咖啡危机推广健康 (条件已放宽)
`;

    const instructionsPath = path.join(__dirname, 'BALANCE_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);
    console.log(`✅ 使用说明已保存: ${instructionsPath}`);
  }

  async run() {
    console.log('🎯 最终平衡修复器启动');
    
    this.loadBalancedEvents();
    this.applyFinalFixes();
    this.saveFixedConfig();
    this.generateUsageInstructions();
    
    console.log('\n🎉 最终平衡修复完成！');
    console.log('现在所有结局都应该可以通过合理的游戏路径达成。');
  }
}

if (require.main === module) {
  const fixer = new FinalBalanceFix();
  fixer.run().catch(error => {
    console.error('修复失败:', error);
  });
}

module.exports = FinalBalanceFix;