#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js dev server..."
  npx next dev --turbopack -p 3000
  echo "[$(date)] Server died, restarting in 3s..."
  sleep 3
done
