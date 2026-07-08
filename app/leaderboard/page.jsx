"use client";
import { useStore } from "@/lib/useStore";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const { state } = useStore();
  const [baseUrl, setBaseUrl] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!state || !state.phaseStartTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - state.phaseStartTime;
      const duration = state.gameState === 'active' ? 60000 : state.gameState === 'reveal' ? 10000 : 0;
      setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  if (!state) return <div className="container"><p>載入中...</p></div>;

  const currentQ = state.gameState !== 'waiting' && state.gameState !== 'finished' ? state.questions[state.currentQuestionIndex] : null;
  const users = Object.values(state.users).sort((a, b) => b.score - a.score);
  const topUsers = users.slice(0, 10);

  return (
    <div className="container" style={{ flexDirection: 'row', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto', gap: '2rem' }}>
      
      {/* 左側：遊戲狀態與 QR Code */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', transition: 'all 0.5s ease' }}>
        
        {state.gameState !== 'finished' && (
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>掃描加入遊戲！</h2>
            <div className="qr-container">
              {baseUrl && (
                <QRCodeSVG 
                  value={baseUrl} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                />
              )}
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>網址：{baseUrl}</p>
          </div>
        )}

        <div className="glass-card" style={{ textAlign: 'center', flex: 1 }}>
          {state.gameState === 'waiting' && (
            <div style={{ padding: '3rem 0' }}>
              <h2 style={{ fontSize: '2rem', color: '#666' }}>活動即將開始</h2>
              <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>請掃描上方 QR Code 加入並耐心等候</p>
            </div>
          )}

          {state.gameState === 'finished' && (
            <div style={{ padding: '4rem 0' }}>
              <h2 style={{ fontSize: '3rem', color: '#ff4757', marginBottom: '1rem' }}>🎉 遊戲結束 🎉</h2>
              <p style={{ fontSize: '1.5rem' }}>恭喜排行榜上的贏家！</p>
            </div>
          )}

          {(state.gameState === 'active' || state.gameState === 'reveal') && currentQ && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#666' }}>第 {state.currentQuestionIndex + 1} 題</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: state.gameState === 'active' ? '#ff4757' : '#6c757d' }}>
                  {timeLeft} 秒
                </span>
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#333' }}>{currentQ.text}</h3>
              
              {state.gameState === 'reveal' && (
                <h4 style={{ color: '#28a745', marginBottom: '1rem', fontSize: '1.5rem' }}>時間到！公布答案：</h4>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
                {currentQ.options.map((opt, i) => {
                  const isReveal = state.gameState === 'reveal';
                  const isCorrect = isReveal && i === currentQ.answer;
                  
                  return (
                    <div key={i} style={{ 
                      padding: '1rem', 
                      background: isCorrect ? '#d4edda' : '#f8f9fa', 
                      color: isCorrect ? '#155724' : 'inherit',
                      borderRadius: '12px', 
                      fontSize: '1.2rem', 
                      border: isCorrect ? '2px solid #c3e6cb' : '2px solid #e2e8f0',
                      transform: isCorrect ? 'scale(1.05)' : 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: isCorrect ? 'bold' : 'normal'
                    }}>
                      {opt} {isCorrect && ' ✔️'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右側：即時積分排行榜 */}
      <div className="glass-card" style={{ flex: state.gameState === 'finished' ? 2 : 1, width: '100%', minHeight: '80vh', transition: 'all 0.5s ease' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #FF7EB3, #FF758C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏆 積分排行榜
        </h2>
        
        {topUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '3rem', fontSize: '1.2rem' }}>目前還沒有賓客加入...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topUsers.map((u, i) => (
              <div key={u.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem 1.5rem', 
                background: i === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' : i === 1 ? 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)' : i === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)' : '#f8f9fa',
                color: i < 3 ? 'white' : '#333',
                borderRadius: '16px',
                boxShadow: i < 3 ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                transform: i === 0 ? 'scale(1.05)' : 'none',
                transition: 'all 0.3s ease',
                fontWeight: 'bold',
                fontSize: i === 0 ? '1.5rem' : '1.2rem',
                margin: i === 0 ? '0.5rem 0' : '0'
              }}>
                <span style={{ width: '50px' }}>#{i + 1}</span>
                <span style={{ flex: 1 }}>{u.name}</span>
                <span>{u.score} 分</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
