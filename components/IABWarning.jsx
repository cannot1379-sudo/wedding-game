"use client";
import { useEffect, useState } from "react";
import styles from "./IABWarning.module.css";

export default function IABWarning() {
  const [isIAB, setIsIAB] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    // 偵測 LINE In-App Browser 避免遺失 Cookie/Session
    if (ua.indexOf("Line") > -1) {
      setIsIAB(true);
    }
  }, []);

  if (!isIAB) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>請使用預設瀏覽器開啟</h2>
        <p>為了確保您的登入狀態與遊戲進度不會遺失，請點擊右上角的選單，選擇<strong>「以預設瀏覽器開啟」</strong> (如 Safari 或 Chrome)。</p>
      </div>
    </div>
  );
}
