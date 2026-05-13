#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PID_FILE=".dev.pid"
LOG_FILE=".dev.log"
PORT=4321

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "dev server already running (pid $(cat "$PID_FILE")) → http://localhost:${PORT}/"
  exit 0
fi

rm -f "$PID_FILE" "$LOG_FILE"
nohup pnpm dev >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

for _ in {1..40}; do
  if grep -q "Local" "$LOG_FILE" 2>/dev/null; then
    echo "✓ dev server up (pid $(cat "$PID_FILE")) → http://localhost:${PORT}/"
    echo "  logs: tail -f $LOG_FILE"
    echo "  stop: ./stop.sh"
    exit 0
  fi
  sleep 0.25
done

echo "✗ dev server did not become ready in 10s. Last log:"
tail -20 "$LOG_FILE"
exit 1
