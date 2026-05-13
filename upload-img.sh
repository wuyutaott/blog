#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ $# -ne 1 ]]; then
  echo "用法: $0 <文件名>"
  echo "  把图片先放到 ./image/，文件名遵守 §3 命名规范（小写 + 短横线 + 描述性）"
  echo "  示例: $0 iceland-aurora.jpg"
  echo "  → 等价于 ./scripts/mediactl add ./image/iceland-aurora.jpg --name iceland-aurora --compress"
  exit 1
fi

FILE="$1"
SRC="./image/$FILE"

if [[ ! -f "$SRC" ]]; then
  echo "✗ 找不到 $SRC"
  echo "  先把图片放到 ./image/$FILE 再跑这个命令"
  exit 1
fi

NAME="${FILE%.*}"

exec ./scripts/mediactl add "$SRC" --name "$NAME" --compress
