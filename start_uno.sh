#!/bin/bash

ROOMS=2

for i in $(seq 1 $ROOMS); do
  port=$((3000 + $i - 1))
  
  echo "Launching room $i at port $port"
  screen -dmS "uno.$i" node server/uno.js -p $port
done
