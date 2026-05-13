#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PID_FILE=".dev.pid"

if [[ -f "$PID_FILE" ]]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    pkill -P "$PID" 2>/dev/null || true
    kill "$PID" 2>/dev/null || true
    sleep 0.3
    kill -9 "$PID" 2>/dev/null || true
    echo "✓ stopped dev server (pid $PID)"
  else
    echo "pid file present but process $PID not running, cleaning up"
  fi
  rm -f "$PID_FILE"
else
  STRAY=$(pgrep -f "astro dev" || true)
  if [[ -n "$STRAY" ]]; then
    echo "no pid file but found stray astro dev: $STRAY → killing"
    echo "$STRAY" | xargs kill 2>/dev/null || true
  else
    echo "dev server not running"
  fi
fi
