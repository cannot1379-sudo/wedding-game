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
      const qDuration = (state.questionDuration || 60) * 1000;
      const rDuration = (state.revealDuration || 10) * 1000;
      const duration = state.gameState === 'active' ? qDuration : state.gameState === 'reveal' ? rDuration : 0;
      setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  if (!state) return <div className="container"><p>載入中...</p></div>;

  const currentQ = state.gameState !== 'waiting' && state.gameState !== 'finished'
    ? state.questions[state.currentQuestionIndex]
    : null;

  const users = Object.values(state.users).sort((a, b) => b.score - a.score);
  const top3 = users.slice(0, 3);
  const restUsers = users.slice(3);

  // Auto columns: target ~12 rows so fewer columns, wider cards
  const gridCols = restUsers.length > 0 ? Math.max(2, Math.min(Math.ceil(restUsers.length / 12), 9)) : 2;
  const gridFontSize = Math.max(0.72, 1.0 - (gridCols - 2) * 0.03) + 'rem';
  const gridPaddingV = Math.max(0.3, 0.55 - (gridCols - 2) * 0.025);
  const gridPaddingH = Math.max(0.4, 0.8 - (gridCols - 2) * 0.04);
  const gridPadding = gridPaddingV + 'rem ' + gridPaddingH + 'rem';
  const gridGap = Math.max(0.25, 0.5 - (gridCols - 2) * 0.025) + 'rem';

  const panelStyle = {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '2px solid rgba(255,194,209,0.6)',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 12px 40px rgba(255,139,167,0.25)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const panelTopBar = {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '6px',
    background: 'linear-gradient(to right, var(--primary), #BDE0FE)',
    borderRadius: '24px 24px 0 0',
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'row',
      gap: '0.8rem',
      padding: '0.8rem',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ═══ 左側欄（獨立控制高度比例） ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: 0 }}>

        {/* 左上：QR Code（flex: 2 = 佔左側 2/3 高度） */}
        <div style={{ ...panelStyle, flex: 2, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={panelTopBar} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>🏸 掃描 QR Code 參加遊戲！</h2>
          {baseUrl && (
            <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '0.8rem' }}>
              <QRCodeSVG value={baseUrl} size={180} bgColor={"#ffffff"} fgColor={"#333333"} level={"H"} />
            </div>
          )}
          <p style={{ fontSize: '1rem', color: '#888' }}>用手機掃描即可加入 💖</p>
        </div>

        {/* 左下：目前題目（flex: 1 = 佔左側 1/3 高度） */}
        <div style={{ ...panelStyle, flex: 1, justifyContent: 'center' }}>
          <div style={panelTopBar} />
          {state.gameState === 'waiting' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>⏳</div>
              <h2 style={{ fontSize: '1.4rem', color: '#888' }}>活動即將開始</h2>
              <p style={{ marginTop: '0.4rem', color: '#aaa' }}>等候主持人發球！</p>
            </div>
          )}
          {state.gameState === 'finished' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.4rem', color: '#ff4757' }}>遊戲結束！</h2>
              <p style={{ marginTop: '0.4rem', fontSize: '1rem', color: '#888' }}>請看排行榜最終結果</p>
            </div>
          )}
          {(state.gameState === 'active' || state.gameState === 'reveal') && currentQ && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.95rem', color: '#888', fontWeight: 'bold' }}>第 {state.currentQuestionIndex + 1} 題 / 共 {state.questions.length} 題</span>
                <span style={{
                  fontSize: '1.8rem', fontWeight: 'bold',
                  color: state.gameState === 'active' ? '#ff4757' : '#6c757d',
                  background: state.gameState === 'active' ? '#fff0f3' : '#f0f0f0',
                  padding: '0.15rem 0.7rem', borderRadius: '10px',
                }}>{timeLeft}s</span>
              </div>
              {state.gameState === 'reveal' && (
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.4rem' }}>📢 時間到！公布答案：</p>
              )}
              <p style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#333', marginBottom: '0.8rem', lineHeight: 1.4 }}>{currentQ.text}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {currentQ.options.map((opt, i) => {
                  const isReveal = state.gameState === 'reveal';
                  const isCorrect = isReveal && i === currentQ.answer;
                  return (
                    <div key={i} style={{
                      padding: '0.5rem 0.7rem',
                      background: isCorrect ? '#d4edda' : '#f8f9fa',
                      color: isCorrect ? '#155724' : 'inherit',
                      borderRadius: '10px', fontSize: '0.95rem',
                      border: isCorrect ? '2px solid #c3e6cb' : '2px solid #FFE5EC',
                      fontWeight: isCorrect ? 'bold' : 'normal',
                      transform: isCorrect ? 'scale(1.03)' : 'none',
                      transition: 'all 0.3s ease',
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

      {/* ═══ 右側欄（獨立控制高度比例） ═══ */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: 0 }}>

        {/* 右上：排行榜標題 + 前三名頒獎台（flex: 1） */}
        <div style={{ ...panelStyle, flex: 1, padding: '0.8rem 1.2rem' }}>
          <div style={panelTopBar} />
          <h1 style={{ fontSize: '1.4rem', textAlign: 'center', marginBottom: '0.4rem' }}>🏆 積分排行榜</h1>
          {users.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: '#999' }}>目前還沒有賓客加入...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flex: 1 }}>
              {top3[1] && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, #E8E8E8 0%, #B0B0B0 100%)', borderRadius: '16px', padding: '0.6rem 0.5rem', boxShadow: '0 6px 20px rgba(192,192,192,0.3)', color: 'white' }}>
                  <span style={{ fontSize: '1.6rem' }}>🥈</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.2rem', textAlign: 'center' }}>{top3[1].name}</span>
                  <span style={{ fontSize: '0.9rem', marginTop: '0.1rem', opacity: 0.9 }}>{top3[1].score} 分</span>
                </div>
              )}
              {top3[0] && (
                <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', borderRadius: '20px', padding: '0.9rem 0.5rem', boxShadow: '0 10px 30px rgba(255,215,0,0.45)', color: 'white', transform: 'scale(1.04)', zIndex: 1 }}>
                  <span style={{ fontSize: '2.2rem' }}>🥇</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.2rem', textAlign: 'center' }}>{top3[0].name}</span>
                  <span style={{ fontSize: '1rem', marginTop: '0.1rem', opacity: 0.9 }}>{top3[0].score} 分</span>
                </div>
              )}
              {top3[2] && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', borderRadius: '16px', padding: '0.6rem 0.5rem', boxShadow: '0 5px 15px rgba(205,127,50,0.3)', color: 'white' }}>
                  <span style={{ fontSize: '1.6rem' }}>🥉</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.2rem', textAlign: 'center' }}>{top3[2].name}</span>
                  <span style={{ fontSize: '0.9rem', marginTop: '0.1rem', opacity: 0.9 }}>{top3[2].score} 分</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右下：參加現況（flex: 2.5 = 佔右側更多高度） */}
        <div style={{ ...panelStyle, flex: 2.5 }}>
          <div style={panelTopBar} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 0 }}>🏸 參加現況</h2>
            <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>共 {users.length} 人參賽</span>
          </div>
          {restUsers.length === 0 && users.length <= 3 && users.length > 0 && (
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>前三名已顯示於上方排行榜</p>
          )}
          {restUsers.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + gridCols + ', 1fr)', gap: gridGap, flex: 1, alignContent: 'start' }}>
              {restUsers.map((u, idx) => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', fontWeight: 'bold',
                  background: '#f8f9fa', color: 'var(--text-color)',
                  border: '2px solid #FFE5EC', fontSize: gridFontSize,
                  padding: gridPadding, borderRadius: '10px', overflow: 'hidden', gap: '4px',
                }}>
                  <span style={{ color: '#aaa', fontSize: '0.8em', minWidth: '26px', textAlign: 'right', flexShrink: 0 }}>#{idx + 4}</span>
                  <span style={{ flex: 1, marginLeft: '4px', wordBreak: 'break-word', lineHeight: 1.2 }}>{u.name}</span>
                  <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{u.score}分</span>
                </div>
              ))}
            </div>
          )}
          {users.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#bbb', fontSize: '1rem' }}>等待賓客加入中...</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
