#!/bin/bash
# 应用最终优化配置
cp stories/deadline_story_optimized_balanced.json stories/deadline_story_final_balanced.json
cp stories/common_events_optimized.json stories/common_events.json
echo "✅ 已应用最终优化配置"
echo "现在运行最终测试："
echo "  cd testing && node comprehensive_branch_tester.js"
