@echo off
call npm i
call npm install -g @sap/cds@6.7.0
call cds deploy --to sqlite:my.db
pause