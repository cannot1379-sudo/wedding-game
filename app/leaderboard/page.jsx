"use client";
import { useStore } from "@/lib/useStore";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const { state } = useStore();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (!state) return <div className="container"><p>載入中...</p></div>;

  const currentQ = state.questions.find(q => q.id === state.currentQuestionId);
  const users = Object.values(state.users).sort((a, b) => b.score - a.score);
  const topUsers = users.slice(0, 10);

  return (
    <div className="container" style={{ flexDirection: 'row', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto', gap: '2rem' }}>
      
      {/* 左側：QR Code 與 目前題目 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>掃描加入遊戲！</h2>
          <div className="qr-container">
            {baseUrl && (
              <QRCodeSVG 
                value={baseUrl} 
                size={220}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
              />
            )}
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>或前往網址：{baseUrl}</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', flex: 1 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>目前題目</h2>
          {!currentQ ? (
            <p style={{ fontSize: '1.5rem', color: '#666', marginTop: '2rem' }}>等待主持人發布題目...</p>
          ) : (
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#333' }}>{currentQ.text}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
                {currentQ.options.map((opt, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', fontSize: '1.2rem', border: '2px solid #e2e8f0' }}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右側：排行榜 */}
      <div className="glass-card" style={{ flex: 1, width: '100%', minHeight: '80vh' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #FF7EB3, #FF758C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏆 即時積分排行榜
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
