#!/bin/bash

for i in {0..1}; do
  port=$((3000 + $i))
  screen -dmS "uni.$i" node server/uno.js -p $port
done
