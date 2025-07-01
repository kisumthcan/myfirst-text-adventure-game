#!/bin/bash
# 应用增强平衡配置
cp stories/deadline_story_enhanced_balanced.json stories/deadline_story_final_balanced.json
echo "✅ 已应用增强平衡配置"
echo "现在可以运行测试验证："
echo "  cd testing && node comprehensive_branch_tester.js"
