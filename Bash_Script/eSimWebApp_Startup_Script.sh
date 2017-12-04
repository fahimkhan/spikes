#!/bin/bash

cd /home/fahim/www/ngSpice

pm2 start app.js --name="ngSpice"

cd /home/fahim/www/eSim

pm2 start app.js --name="eSim"

