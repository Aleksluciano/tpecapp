@echo off
call npm i
call npm install -g @sap/cds-dk
call cds deploy --to sqlite:my.db
pause