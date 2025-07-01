#!/bin/bash
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
