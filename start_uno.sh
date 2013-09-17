#!/bin/bash


TOTAL_ROOMS=2

for i in {1..$TOTAL_ROOMS}; do
  port=$((3000 + $i - 1))
  
  echo "Launching room $i at port $port"
  screen -dmS "uno.$i" node server/uno.js -p $port
done
