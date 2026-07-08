"use client";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
  const { state, dispatch } = useStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(0);
  const [submittedFor, setSubmittedFor] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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

  if (loading || !user || !state) return <div className="container"><p>載入中...</p></div>;

  const currentQ = state.questions[state.currentQuestionIndex];
  const myScore = state.users[user.id]?.score || 0;
  const myAnswered = state.users[user.id]?.answered || [];

  const hasAnsweredCurrent = currentQ && (myAnswered.includes(currentQ.id) || submittedFor === currentQ.id);

  const submitAnswer = async (index) => {
    if (state.gameState !== 'active' || hasAnsweredCurrent) return;
    setSubmittedFor(currentQ.id);
    await dispatch('submit_answer', {
      userId: user.id,
      name: user.name,
      selectedIndex: index
    });
  };

  return (
    <div className="container">
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>嗨，{user.name}！</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>目前總積分：{myScore} 分</p>
      </div>

      {state.gameState === 'waiting' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2>遊戲即將開始...</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>請準備好，等候主持人開始遊戲！</p>
        </div>
      )}

      {state.gameState === 'finished' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2>🎉 遊戲結束 🎉</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>您最終獲得了 <strong>{myScore}</strong> 分！</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>請看大螢幕公布最終的得獎者！</p>
        </div>
      )}

      {(state.gameState === 'active' || state.gameState === 'reveal') && currentQ && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 'bold', color: '#666' }}>第 {state.currentQuestionIndex + 1} 題</span>
            <span style={{ fontWeight: 'bold', color: state.gameState === 'active' ? '#ff4757' : '#6c757d', fontSize: '1.2rem' }}>
              剩餘 {timeLeft} 秒
            </span>
          </div>
          <h2>{currentQ.text}</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>此題分數：{currentQ.points} 分</p>
          
          <div className="options-grid">
            {currentQ.options.map((opt, i) => {
              const isReveal = state.gameState === 'reveal';
              const isCorrect = isReveal && i === currentQ.answer;
              const isWrong = isReveal && i !== currentQ.answer;
              
              let bg = 'white';
              let color = 'inherit';
              let border = '#e2e8f0';
              
              if (isReveal) {
                if (isCorrect) {
                  bg = '#d4edda';
                  color = '#155724';
                  border = '#c3e6cb';
                } else if (isWrong) {
                  bg = '#f8d7da';
                  color = '#721c24';
                  border = '#f5c6cb';
                }
              }

              return (
                <div 
                  key={i} 
                  className="option-card"
                  onClick={() => submitAnswer(i)}
                  style={{ 
                    opacity: (hasAnsweredCurrent && !isReveal) ? 0.6 : 1, 
                    cursor: (hasAnsweredCurrent || isReveal) ? 'default' : 'pointer',
                    pointerEvents: (hasAnsweredCurrent || isReveal) ? 'none' : 'auto',
                    background: bg,
                    color: color,
                    borderColor: border
                  }}
                >
                  {opt}
                  {isCorrect && ' ✔️'}
                </div>
              );
            })}
          </div>

          {state.gameState === 'active' && hasAnsweredCurrent && (
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem' }}>
              您已送出答案！等待公布結果...
            </div>
          )}
          
          {state.gameState === 'reveal' && (
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              正確答案是：<span style={{ color: '#28a745' }}>{currentQ.options[currentQ.answer]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
