@echo off
chcp 65001 > nul
cd /d D:\Pressing_Lab\GESTION\CORE\V3\pressingsana

if not exist "node_modules\" (
  npm install
)

if not exist "data\" mkdir data

start /B node server.js > nul 2>&1
