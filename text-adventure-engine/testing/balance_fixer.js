const fs = require('fs');
const path = require('path');
const GameBalanceAnalyzer = require('./balance_analyzer');

class GameBalanceFixer extends GameBalanceAnalyzer {
  constructor() {
    super();
    this.fixedEvents = null;
  }

  analyzeSpecificPathRequirements() {
    console.log('\n=== 特定路径需求分析 ===');
    
    // 分析每个结局的具体路径需求
    const pathRequirements = {
      legendary_programmer: {
        name: "传奇程序员",
        required_attributes: ["project_success", "demo_perfect"],
        required_points: { coding: 25, social: 15 },
        analysis: this.analyzeLegendaryPath()
      },
      workaholic: {
        name: "加班狂魔", 
        required_attributes: ["exhausted", "lone_wolf"],
        required_points: { coding: 18 },
        analysis: this.analyzeWorkaholPath()
      },
      zen_coder: {
        name: "佛系码农",
        required_attributes: ["wellness_advocate", "team_player"],
        required_points: { social: 20 },
        analysis: this.analyzeZenPath()
      },
      career_change: {
        name: "转行大师",
        required_attributes: ["frustrated", "caffeine_withdrawal"],
        required_points: { coding: 8 },
        analysis: this.analyzeCareerChangePath()
      }
    };

    return pathRequirements;
  }

  analyzeLegendaryPath() {
    // 传奇程序员路径分析
    const requirements = {
      critical_events: [
        {
          event: "main_05_final_demo",
          required_choice: "完美展示所有功能",
          prerequisites: { coding: 20, social: 12, caffeine: 8 },
          gains: ["project_success", "demo_perfect"]
        }
      ],
      point_building_strategy: {
        coding: "需要从主线和共通事件积累",
        social: "需要选择社交导向的选项",
        caffeine: "需要保持足够的精神状态"
      },
      potential_issues: [
        "coding要求25但demo条件只需20，存在gap",
        "social要求15但可能路径较少"
      ]
    };
    
    return requirements;
  }

  analyzeWorkaholPath() {
    return {
      critical_events: [
        {
          event: "main_03_bug_invasion", 
          required_choice: "熬夜独自解决问题",
          prerequisites: {},
          gains: ["exhausted", "lone_wolf"],
          costs: { caffeine: -3 }
        }
      ],
      conflicts: ["与team_player路径冲突"],
      accessibility: "相对容易达成"
    };
  }

  analyzeZenPath() {
    return {
      critical_events: [
        {
          event: "common_coffee_break",
          required_choice: "喝杯白开水就好", 
          prerequisites: {},
          gains: ["health_conscious"]
        },
        {
          event: "main_04_coffee_crisis",
          required_choice: "趁机推广健康的工作方式",
          prerequisites: ["health_conscious"],
          gains: ["wellness_advocate"]
        },
        {
          event: "main_03_bug_invasion",
          required_choice: "请求同事协助调试",
          prerequisites: { social: 12 },
          gains: ["team_player"]
        }
      ],
      dependency_chain: "health_conscious -> wellness_advocate + team_player",
      potential_issues: ["需要early game做出正确选择"]
    };
  }

  analyzeCareerChangePath() {
    return {
      critical_events: [
        {
          event: "common_keyboard_tantrum",
          required_choice: "将就着用屏幕键盘",
          gains: ["frustrated"],
          costs: { coding: -2, caffeine: -1 }
        },
        {
          event: "main_04_coffee_crisis", 
          required_choice: "默默承受咖啡因戒断症状",
          gains: ["caffeine_withdrawal"],
          costs: { coding: -2, caffeine: -2 }
        }
      ],
      strategy: "accumulate negative outcomes",
      accessibility: "容易达成"
    };
  }

  identifyBalanceIssues() {
    console.log('\n=== 平衡问题识别 ===');
    
    const issues = [];

    // 问题1: 传奇程序员路径的点数gap
    issues.push({
      type: "point_gap",
      ending: "ending_legendary_programmer",
      problem: "demo条件要求coding>=20，但结局要求coding>=25",
      solution: "在demo事件中增加coding奖励，或降低结局要求"
    });

    // 问题2: 佛系码农路径的前置条件过于严格
    issues.push({
      type: "dependency_chain_issue", 
      ending: "ending_zen_coder",
      problem: "wellness_advocate需要health_conscious前置，但获取机会有限",
      solution: "增加获取health_conscious的途径，或提供alternative路径"
    });

    // 问题3: 某些属性组合无法同时获得
    issues.push({
      type: "mutual_exclusion",
      problem: "team_player和lone_wolf在同一事件中互斥",
      solution: "添加额外的team_player获取途径"
    });

    return issues;
  }

  generateBalancingFixes() {
    console.log('\n=== 生成平衡修复 ===');
    
    // 复制原始事件数据
    this.fixedEvents = JSON.parse(JSON.stringify(this.allEvents));
    
    const fixes = [];

    // 修复1: 改善传奇程序员路径
    fixes.push(this.fixLegendaryProgrammerPath());
    
    // 修复2: 改善佛系码农路径  
    fixes.push(this.fixZenCoderPath());
    
    // 修复3: 添加额外的team_player获取途径
    fixes.push(this.addAlternativeTeamPlayerPath());
    
    // 修复4: 调整结局条件使其更平衡
    fixes.push(this.adjustEndingConditions());

    return fixes;
  }

  fixLegendaryProgrammerPath() {
    // 在demo事件的完美展示选择中增加coding奖励
    const demoEvent = this.fixedEvents.find(e => e.id === "main_05_final_demo");
    if (demoEvent) {
      const perfectChoice = demoEvent.choices.find(c => 
        c.text === "完美展示所有功能"
      );
      if (perfectChoice) {
        // 增加coding奖励，弥补与结局要求的gap
        perfectChoice.outcome.points_change.coding = 5; // 从原来的5提升，确保能达到25
        perfectChoice.outcome.points_change.social = 5; // 确保social也能达到要求
        
        console.log("✅ 修复传奇程序员路径：增加demo完美展示的点数奖励");
        
        return {
          type: "legendary_fix",
          description: "增加demo完美展示的coding和social奖励",
          applied: true
        };
      }
    }
    
    return { type: "legendary_fix", applied: false };
  }

  fixZenCoderPath() {
    // 1. 降低wellness_advocate的前置条件依赖
    const coffeeEvent = this.fixedEvents.find(e => e.id === "main_04_coffee_crisis");
    if (coffeeEvent) {
      const wellnessChoice = coffeeEvent.choices.find(c => 
        c.text === "趁机推广健康的工作方式"
      );
      if (wellnessChoice) {
        // 移除health_conscious的严格要求，或提供alternative
        if (wellnessChoice.conditions && wellnessChoice.conditions.attributes) {
          delete wellnessChoice.conditions; // 暂时移除限制条件
        }
        
        console.log("✅ 修复佛系码农路径：降低wellness_advocate获取条件");
        
        return {
          type: "zen_fix",
          description: "移除wellness_advocate的health_conscious前置要求",
          applied: true
        };
      }
    }
    
    return { type: "zen_fix", applied: false };
  }

  addAlternativeTeamPlayerPath() {
    // 在代码评审事件中添加team_player获取途径
    const reviewEvent = this.fixedEvents.find(e => e.id === "common_code_review");
    if (reviewEvent) {
      const humbleChoice = reviewEvent.choices.find(c => 
        c.text === "虚心请教改进建议"
      );
      if (humbleChoice) {
        // 添加team_player属性
        if (!humbleChoice.outcome.attributes_add.includes("team_player")) {
          humbleChoice.outcome.attributes_add.push("team_player");
        }
        
        console.log("✅ 增加team_player获取途径：代码评审虚心请教");
        
        return {
          type: "team_player_alternative", 
          description: "在代码评审中添加team_player获取途径",
          applied: true
        };
      }
    }
    
    return { type: "team_player_alternative", applied: false };
  }

  adjustEndingConditions() {
    // 微调结局条件，使其更容易达成
    const fixes = [];
    
    // 1. 传奇程序员：微调点数要求
    const legendaryEnding = this.fixedEvents.find(e => e.id === "ending_legendary_programmer");
    if (legendaryEnding) {
      legendaryEnding.conditions.points.coding = 22; // 从25降低到22
      legendaryEnding.conditions.points.social = 12; // 从15降低到12
      fixes.push("传奇程序员：coding 25->22, social 15->12");
    }
    
    // 2. 佛系码农：微调点数要求
    const zenEnding = this.fixedEvents.find(e => e.id === "ending_zen_coder");
    if (zenEnding) {
      zenEnding.conditions.points.social = 18; // 从20降低到18
      fixes.push("佛系码农：social 20->18");
    }
    
    console.log("✅ 调整结局条件：", fixes.join(", "));
    
    return {
      type: "ending_adjustments",
      description: "微调结局点数要求使其更容易达成", 
      changes: fixes,
      applied: true
    };
  }

  saveBalancedConfig() {
    // 保存修复后的配置
    const deadlineEvents = this.fixedEvents.filter(e => 
      e.id.startsWith('main_') || e.id.startsWith('ending_')
    );
    
    const outputPath = path.join(__dirname, 'stories/deadline_story_balanced.json');
    fs.writeFileSync(outputPath, JSON.stringify(deadlineEvents, null, 2));
    
    console.log(`\n✅ 平衡配置已保存: ${outputPath}`);
    
    // 也生成一个备份原文件的版本
    const backupPath = path.join(__dirname, 'stories/deadline_story_original_backup.json');
    const originalEvents = this.allEvents.filter(e => 
      e.id.startsWith('main_') || e.id.startsWith('ending_')
    );
    fs.writeFileSync(backupPath, JSON.stringify(originalEvents, null, 2));
    
    console.log(`✅ 原始配置备份: ${backupPath}`);
  }

  async verifyBalance() {
    console.log('\n=== 验证平衡性修复 ===');
    
    // 临时替换事件数据进行测试
    const originalEvents = this.allEvents;
    this.allEvents = this.fixedEvents;
    
    // 重新运行可达性测试
    const accessibilityReport = this.systematicPathTesting();
    
    // 恢复原始数据
    this.allEvents = originalEvents;
    
    return accessibilityReport;
  }

  async run() {
    console.log('🔧 游戏平衡修复器启动');
    
    this.loadData();
    
    const pathRequirements = this.analyzeSpecificPathRequirements();
    const issues = this.identifyBalanceIssues();
    const fixes = this.generateBalancingFixes();
    
    console.log('\n=== 应用的修复 ===');
    fixes.forEach((fix, index) => {
      if (fix.applied) {
        console.log(`${index + 1}. ${fix.description}`);
      }
    });
    
    this.saveBalancedConfig();
    
    const verificationReport = await this.verifyBalance();
    
    console.log('\n=== 修复后结局可达性 ===');
    this.endings.forEach(ending => {
      const accessible = verificationReport.accessible.find(a => a.ending.id === ending.id);
      const status = accessible ? `✅ 可达 (${accessible.pathCount} 条路径)` : '❌ 仍不可达';
      console.log(`${ending.name}: ${status}`);
    });
    
    console.log('\n🎯 平衡修复完成！');
    return { fixes, verificationReport };
  }
}

if (require.main === module) {
  const fixer = new GameBalanceFixer();
  fixer.run().catch(error => {
    console.error('修复失败:', error);
  });
}

module.exports = GameBalanceFixer;