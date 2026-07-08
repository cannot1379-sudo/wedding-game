# 遊戲部署與更新 SOP

本專案已設定 GitHub Actions CI/CD 流水線，當程式碼推送至 GitHub 的 `main` 分支時，會自動觸發部署流程。
自動部署包含：
1. 將前端/後端打包為 Docker Image
2. 上傳至 Google Cloud Container Registry (GCR)
3. 部署至 Google Cloud Run
4. 自動注入 Firebase 所需的環境變數進行串連

## 如何發布更新

請在終端機依序執行以下指令即可完成更新，系統將自動處理雲端與資料庫的部署：

```powershell
# 1. 將所有修改加入版控
git add .

# 2. 提交更新 (請將引號內的文字換成您的更新說明)
git commit -m "更新說明"

# 3. 推送至 GitHub (將會自動觸發 Google Cloud 與 Firebase 的更新)
git push origin main
```

> **注意**：如果本地端尚未設定遠端伺服器 (Remote URL)，請先執行 `git remote add origin <您的 GitHub Repo 網址>`，再執行 `git push -u origin main`。
