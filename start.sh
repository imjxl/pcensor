#!/bin/sh
cd `dirname "$0"`
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2 nohup /root/.nvm/versions/node/v16.15.1/bin/node server.js > logfile.log 2>&1 &
