@echo off
chcp 65001 >nul
echo ===================================================
echo 歡迎使用婚禮問答遊戲 - 本地開發與測試環境啟動器
echo ===================================================
echo.
echo 系統將會自動為您啟動伺服器，並開啟三個瀏覽器分頁。
echo.
echo 啟動期間請稍候...
echo (注意：請勿關閉隨後彈出的黑色伺服器視窗！)

:: 確保切換到正確的專案目錄，即使這個 bat 被拉到桌面上也能運作
cd /d "J:\AI app\game\wedding"

start "Wedding Game Local Server" cmd /k "npm run dev"

echo 等待伺服器啟動 (大約 5 秒鐘)...
timeout /t 5 /nobreak >nul

echo 正在為您開啟「賓客介面」、「後台管理」與「大螢幕」...
start http://localhost:3000/
start http://localhost:3000/admin
start http://localhost:3000/leaderboard

echo.
echo ===================================================
echo 開啟完成！
echo 您現在可以隨意修改 app 目錄下的程式碼了，
echo 只要一存檔，網頁就會自動重新整理並顯示最新畫面！
echo ===================================================
pause
