const fs = require('fs');
const path = require('path');

// 文件清理管理器 - 维护项目文件整洁性
class CleanupManager {
  constructor() {
    this.projectRoot = __dirname;
    this.dustbinPath = path.join(this.projectRoot, 'dustbin');
    this.activeFiles = new Set();
    this.redundantFiles = new Set();
    this.cleanupLog = [];
  }

  // 定义项目的核心活跃文件
  defineActiveFiles() {
    const coreFiles = [
      // 核心游戏引擎
      'game/main.js',
      'game/state_manager.js', 
      'game/event_handler.js',
      
      // 当前使用的配置文件
      'config/game_rules.json',
      'config/initial_characters.json',
      
      // 当前活跃的故事文件
      'stories/common_events.json',
      'stories/deadline_story_final_balanced.json',
      
      // 主要测试工具
      'testing/comprehensive_branch_tester.js',
      'testing/enhanced_balance_fixer.js',
      'testing/final_balance_optimizer.js',
      'testing/test_ui_improvements.js',
      
      // 项目文档
      'project_log.md',
      'game_story_bible.md',
      'README.md',
      'package.json'
    ];

    coreFiles.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        this.activeFiles.add(fullPath);
      }
    });

    console.log(`✅ 已识别 ${this.activeFiles.size} 个核心活跃文件`);
  }

  // 扫描并识别冗余文件
  scanForRedundantFiles() {
    console.log('\\n🔍 扫描冗余文件...');
    
    const redundantPatterns = [
      // 旧版本和备份文件
      'stories/deadline_story.json',
      'stories/deadline_story_balanced.json', 
      'stories/deadline_story_enhanced_balanced.json',
      'stories/deadline_story_optimized_balanced.json',
      'stories/deadline_story_original_backup.json',
      'stories/common_events_optimized.json',
      
      // 旧的测试文件 (已移至testing目录)
      'test_game.js',
      'test_extended.js',
      'demo_interactive.js',
      
      // 旧的平衡工具 (已被新版本取代)
      'balance_analyzer.js',
      'balance_fixer.js', 
      'detailed_path_tracer.js',
      'final_balance_fix.js',
      'final_verification.js',
      
      // 临时和中间文件
      'balance_report.md',
      'FINAL_BALANCE_REPORT.md',
      'BALANCE_INSTRUCTIONS.md',
      'apply_enhanced_balance.sh',
      'apply_final_optimization.sh'
    ];

    redundantPatterns.forEach(pattern => {
      const fullPath = path.join(this.projectRoot, pattern);
      if (fs.existsSync(fullPath)) {
        this.redundantFiles.add(fullPath);
        console.log(`  📁 发现冗余文件: ${pattern}`);
      }
    });

    // 扫描stories目录中的其他json文件
    const storiesDir = path.join(this.projectRoot, 'stories');
    if (fs.existsSync(storiesDir)) {
      const files = fs.readdirSync(storiesDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const fullPath = path.join(storiesDir, file);
          const relativePath = path.join('stories', file);
          
          // 如果不是当前活跃的故事文件，标记为冗余
          if (!this.activeFiles.has(fullPath) && 
              file !== 'common_events.json' && 
              file !== 'deadline_story_final_balanced.json') {
            this.redundantFiles.add(fullPath);
            console.log(`  📁 发现冗余故事文件: ${relativePath}`);
          }
        }
      });
    }

    console.log(`\\n📊 发现 ${this.redundantFiles.size} 个冗余文件`);
  }

  // 创建垃圾箱目录
  createDustbin() {
    if (!fs.existsSync(this.dustbinPath)) {
      fs.mkdirSync(this.dustbinPath, { recursive: true });
      console.log(`✅ 创建垃圾箱目录: ${this.dustbinPath}`);
    }

    // 创建子目录用于分类存放
    const categories = ['stories', 'testing', 'balance_tools', 'scripts', 'reports'];
    categories.forEach(category => {
      const categoryPath = path.join(this.dustbinPath, category);
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
      }
    });
  }

  // 确定文件分类
  categorizeFile(filePath) {
    const fileName = path.basename(filePath);
    const parentDir = path.basename(path.dirname(filePath));
    
    if (filePath.includes('stories/')) return 'stories';
    if (fileName.includes('test') || fileName.includes('demo')) return 'testing';
    if (fileName.includes('balance') || fileName.includes('analyzer') || fileName.includes('fixer')) return 'balance_tools';
    if (fileName.endsWith('.sh') || fileName.includes('apply')) return 'scripts';
    if (fileName.endsWith('.md') && fileName !== 'README.md' && fileName !== 'project_log.md') return 'reports';
    
    return 'misc';
  }

  // 移动文件到垃圾箱
  moveTodustbin() {
    console.log('\\n🗑️ 移动冗余文件到垃圾箱...');
    
    let movedCount = 0;
    
    this.redundantFiles.forEach(filePath => {
      try {
        const fileName = path.basename(filePath);
        const category = this.categorizeFile(filePath);
        const targetDir = path.join(this.dustbinPath, category);
        const targetPath = path.join(targetDir, fileName);
        
        // 如果目标文件已存在，添加时间戳
        let finalTargetPath = targetPath;
        if (fs.existsSync(targetPath)) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const ext = path.extname(fileName);
          const nameWithoutExt = fileName.replace(ext, '');
          finalTargetPath = path.join(targetDir, `${nameWithoutExt}_${timestamp}${ext}`);
        }
        
        fs.renameSync(filePath, finalTargetPath);
        
        const relativePath = path.relative(this.projectRoot, filePath);
        const relativeTarget = path.relative(this.projectRoot, finalTargetPath);
        
        console.log(`  ✅ ${relativePath} → ${relativeTarget}`);
        
        this.cleanupLog.push({
          source: relativePath,
          target: relativeTarget,
          category: category,
          timestamp: new Date().toISOString()
        });
        
        movedCount++;
        
      } catch (error) {
        console.log(`  ❌ 移动失败 ${filePath}: ${error.message}`);
      }
    });
    
    console.log(`\\n📦 成功移动 ${movedCount} 个文件到垃圾箱`);
  }

  // 生成清理报告
  generateCleanupReport() {
    console.log('\\n📋 生成清理报告...');
    
    const report = `# 项目文件清理报告

生成时间: ${new Date().toLocaleString()}

## 清理概况

- 核心活跃文件: ${this.activeFiles.size} 个
- 发现冗余文件: ${this.redundantFiles.size} 个  
- 成功移动文件: ${this.cleanupLog.length} 个

## 核心活跃文件列表

${Array.from(this.activeFiles).map(file => {
  const relativePath = path.relative(this.projectRoot, file);
  return `- ${relativePath}`;
}).join('\\n')}

## 清理操作记录

${this.cleanupLog.map(entry => {
  return `### ${entry.category} - ${entry.source}
- 源文件: ${entry.source}
- 目标位置: ${entry.target}
- 处理时间: ${entry.timestamp}`;
}).join('\\n\\n')}

## 垃圾箱文件分类

### stories/ 
已移动的故事配置文件，包含各个版本的平衡配置

### testing/
已移动的旧测试文件，已被新的testing/目录下的文件取代

### balance_tools/
已移动的旧平衡工具，已被增强版工具取代

### scripts/
已移动的临时脚本文件

### reports/
已移动的临时报告文件

## 垃圾箱恢复说明

如需恢复某个文件，可以从dustbin/相应分类目录中找到并移动回原位置。

**注意：**垃圾箱中的文件不会被自动删除，需要手动管理。建议定期检查并清理确实不需要的文件。
`;

    const reportPath = path.join(this.projectRoot, 'cleanup_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`✅ 清理报告已保存: cleanup_report.md`);
  }

  // 创建还原脚本
  createRestoreScript() {
    const restoreScript = `#!/bin/bash
# 文件还原脚本
# 用法: bash restore_files.sh [category] [filename]

DUSTBIN_DIR="dustbin"
PROJECT_ROOT="."

if [ "$#" -eq 0 ]; then
    echo "📋 垃圾箱内容:"
    echo "=============="
    for category in stories testing balance_tools scripts reports misc; do
        if [ -d "$DUSTBIN_DIR/$category" ]; then
            echo ""
            echo "📁 $category/"
            ls -la "$DUSTBIN_DIR/$category" 2>/dev/null | grep -v "^total" | grep -v "^d" | awk '{print "  " $9}'
        fi
    done
    echo ""
    echo "用法示例:"
    echo "  bash restore_files.sh stories deadline_story.json"
    echo "  bash restore_files.sh testing test_game.js"
    exit 0
fi

CATEGORY="$1"
FILENAME="$2"

if [ -z "$CATEGORY" ] || [ -z "$FILENAME" ]; then
    echo "❌ 请指定分类和文件名"
    echo "用法: bash restore_files.sh [category] [filename]"
    exit 1
fi

SOURCE_FILE="$DUSTBIN_DIR/$CATEGORY/$FILENAME"
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ 文件不存在: $SOURCE_FILE"
    exit 1
fi

# 根据分类确定还原位置
case "$CATEGORY" in
    "stories")
        TARGET_DIR="stories"
        ;;
    "testing")
        TARGET_DIR="."
        ;;
    "balance_tools")
        TARGET_DIR="."
        ;;
    "scripts")
        TARGET_DIR="."
        ;;
    "reports")
        TARGET_DIR="."
        ;;
    *)
        TARGET_DIR="."
        ;;
esac

TARGET_FILE="$TARGET_DIR/$FILENAME"

if [ -f "$TARGET_FILE" ]; then
    echo "⚠️  目标文件已存在: $TARGET_FILE"
    read -p "是否覆盖? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ 取消还原"
        exit 1
    fi
fi

mv "$SOURCE_FILE" "$TARGET_FILE"
echo "✅ 文件已还原: $TARGET_FILE"
`;

    const scriptPath = path.join(this.projectRoot, 'restore_files.sh');
    fs.writeFileSync(scriptPath, restoreScript);
    fs.chmodSync(scriptPath, 0o755);
    console.log(`✅ 还原脚本已创建: restore_files.sh`);
  }

  // 显示当前项目结构
  showProjectStructure() {
    console.log('\\n📁 清理后的项目结构:');
    console.log('================================');
    
    const showDir = (dirPath, indent = '') => {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.relative(this.projectRoot, itemPath);
        
        if (fs.statSync(itemPath).isDirectory()) {
          if (item !== 'node_modules' && item !== '.git' && item !== 'dustbin') {
            console.log(`${indent}📁 ${item}/`);
            if (item === 'testing') {
              // 特别显示testing目录的内容
              const testingItems = fs.readdirSync(itemPath);
              testingItems.forEach(testItem => {
                if (testItem.endsWith('.js') || testItem.endsWith('.md')) {
                  console.log(`${indent}  📄 ${testItem}`);
                } else if (testItem === 'test_samples') {
                  const sampleCount = fs.readdirSync(path.join(itemPath, testItem)).length;
                  console.log(`${indent}  📁 ${testItem}/ (${sampleCount} files)`);
                }
              });
            }
          }
        } else {
          if (item.endsWith('.js') || item.endsWith('.json') || item.endsWith('.md')) {
            console.log(`${indent}📄 ${item}`);
          }
        }
      });
    };

    showDir(this.projectRoot);
    
    console.log('\\n📁 dustbin/ (已清理的文件)');
    if (fs.existsSync(this.dustbinPath)) {
      const categories = fs.readdirSync(this.dustbinPath);
      categories.forEach(category => {
        const categoryPath = path.join(this.dustbinPath, category);
        if (fs.statSync(categoryPath).isDirectory()) {
          const fileCount = fs.readdirSync(categoryPath).length;
          console.log(`  📁 ${category}/ (${fileCount} files)`);
        }
      });
    }
  }

  // 执行完整清理流程
  run() {
    console.log('🧹 启动项目文件清理管理器');
    console.log('================================');
    
    // 1. 定义活跃文件
    this.defineActiveFiles();
    
    // 2. 扫描冗余文件
    this.scanForRedundantFiles();
    
    if (this.redundantFiles.size === 0) {
      console.log('\\n✨ 项目文件已经很整洁，无需清理！');
      return;
    }
    
    // 3. 创建垃圾箱
    this.createDustbin();
    
    // 4. 移动冗余文件
    this.moveTodustbin();
    
    // 5. 生成报告
    this.generateCleanupReport();
    
    // 6. 创建还原脚本
    this.createRestoreScript();
    
    // 7. 显示清理后结构
    this.showProjectStructure();
    
    console.log('\\n🎉 文件清理完成！');
    console.log('\\n📋 操作摘要:');
    console.log(`  - 保留核心文件: ${this.activeFiles.size} 个`);
    console.log(`  - 清理冗余文件: ${this.cleanupLog.length} 个`);
    console.log(`  - 生成清理报告: cleanup_report.md`);
    console.log(`  - 创建还原脚本: restore_files.sh`);
    console.log('\\n📖 后续操作:');
    console.log('  - 查看清理报告: cat cleanup_report.md');
    console.log('  - 查看垃圾箱: ls -la dustbin/');
    console.log('  - 还原文件: bash restore_files.sh [category] [filename]');
    console.log('  - 查看还原选项: bash restore_files.sh');
  }
}

if (require.main === module) {
  const cleanup = new CleanupManager();
  try {
    cleanup.run();
  } catch (error) {
    console.error('清理失败:', error);
    process.exit(1);
  }
}

module.exports = CleanupManager;