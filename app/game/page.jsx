"use client";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function BadmintonIcon() {
  return (
    <svg viewBox="0 0 100 100" width="28" height="28" className="badminton-bounce" style={{ flexShrink: 0 }}>
      {/* Feathers outline */}
      <path d="M 35 65 L 20 20 Q 50 10 80 20 L 65 65 Z" fill="#FFFFFF" stroke="#FF8BA7" strokeWidth="4" strokeLinejoin="round" />
      {/* Feather lines */}
      <path d="M 38 65 L 32 18" stroke="#FFC2D1" strokeWidth="3" />
      <path d="M 44 65 L 44 14" stroke="#FFC2D1" strokeWidth="3" />
      <path d="M 50 65 L 56 14" stroke="#FFC2D1" strokeWidth="3" />
      <path d="M 56 65 L 68 18" stroke="#FFC2D1" strokeWidth="3" />
      {/* Feather cross lines */}
      <path d="M 26 40 Q 50 35 74 40" fill="none" stroke="#FF8BA7" strokeWidth="3" />
      <path d="M 30 55 Q 50 50 70 55" fill="none" stroke="#FF8BA7" strokeWidth="3" />
      {/* Cork / Base */}
      <path d="M 35 65 C 35 85, 65 85, 65 65 Z" fill="#BDE0FE" stroke="#FF8BA7" strokeWidth="4" />
      {/* Cute Face on Cork */}
      <circle cx="45" cy="71" r="3" fill="#5D5D5D" />
      <circle cx="55" cy="71" r="3" fill="#5D5D5D" />
      <path d="M 48 75 Q 50 77 52 75" fill="none" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="74" r="2" fill="#FF8BA7" />
      <circle cx="60" cy="74" r="2" fill="#FF8BA7" />
    </svg>
  );
}

function BadmintonNet() {
  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 1rem auto', padding: '0 0.5rem' }}>
      <svg viewBox="0 0 400 70" width="100%" height="70" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <pattern id="net-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#FFC2D1" strokeWidth="1.5" />
          </pattern>
        </defs>
        {/* Left pole */}
        <rect x="18" y="5" width="6" height="60" rx="3" fill="#DDBEAA" stroke="#FF8BA7" strokeWidth="2" />
        {/* Right pole */}
        <rect x="376" y="5" width="6" height="60" rx="3" fill="#DDBEAA" stroke="#FF8BA7" strokeWidth="2" />
        {/* Net mesh area */}
        <rect x="24" y="16" width="352" height="38" fill="url(#net-grid)" stroke="#FF8BA7" strokeWidth="1.5" />
        {/* Net Top Band */}
        <rect x="24" y="12" width="352" height="6" fill="#FFF" stroke="#FF8BA7" strokeWidth="2" rx="1" />
        
        {/* Flying shuttlecock over the net */}
        <g transform="translate(185, -2) scale(0.55)">
          <g className="badminton-bounce" style={{ transformOrigin: '50px 70px' }}>
            {/* Feathers outline */}
            <path d="M 35 65 L 20 20 Q 50 10 80 20 L 65 65 Z" fill="#FFFFFF" stroke="#FF8BA7" strokeWidth="4" strokeLinejoin="round" />
            {/* Feather lines */}
            <path d="M 38 65 L 32 18" stroke="#FFC2D1" strokeWidth="3" />
            <path d="M 44 65 L 44 14" stroke="#FFC2D1" strokeWidth="3" />
            <path d="M 50 65 L 56 14" stroke="#FFC2D1" strokeWidth="3" />
            <path d="M 56 65 L 68 18" stroke="#FFC2D1" strokeWidth="3" />
            {/* Feather cross lines */}
            <path d="M 26 40 Q 50 35 74 40" fill="none" stroke="#FF8BA7" strokeWidth="3" />
            <path d="M 30 55 Q 50 50 70 55" fill="none" stroke="#FF8BA7" strokeWidth="3" />
            {/* Cork / Base */}
            <path d="M 35 65 C 35 85, 65 85, 65 65 Z" fill="#BDE0FE" stroke="#FF8BA7" strokeWidth="4" />
            {/* Cute Face on Cork */}
            <circle cx="45" cy="71" r="3" fill="#5D5D5D" />
            <circle cx="55" cy="71" r="3" fill="#5D5D5D" />
            <path d="M 48 75 Q 50 77 52 75" fill="none" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="74" r="2" fill="#FF8BA7" />
            <circle cx="60" cy="74" r="2" fill="#FF8BA7" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function GamePage() {
  const { state, dispatch } = useStore();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(0);
  const [submittedFor, setSubmittedFor] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

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
      const qDuration = (state.questionDuration || 60) * 1000;
      const rDuration = (state.revealDuration || 10) * 1000;
      const duration = state.gameState === 'active' ? qDuration : state.gameState === 'reveal' ? rDuration : 0;
      setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  // 當題目改變時，清空使用者的選擇
  useEffect(() => {
    setSelectedOption(null);
  }, [state?.currentQuestionIndex]);

  if (loading || !user || !state) return <div className="container"><p>載入中... 🏸</p></div>;

  const currentQ = state.questions[state.currentQuestionIndex];
  const myScore = state.users[user.id]?.score || 0;
  const myAnswered = state.users[user.id]?.answered || [];

  const hasAnsweredCurrent = currentQ && (myAnswered.includes(currentQ.id) || submittedFor === currentQ.id);

  const submitAnswer = async () => {
    if (state.gameState !== 'active' || hasAnsweredCurrent || selectedOption === null) return;
    setSubmittedFor(currentQ.id);
    await dispatch('submit_answer', {
      userId: user.id,
      name: user.name,
      selectedIndex: selectedOption
    });
  };

  return (
    <div className="container">
      <BadmintonNet />
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
        <button 
          onClick={logout}
          style={{ position: 'absolute', right: '1rem', top: '1rem', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          登出 / 換名字
        </button>
        <h2>嗨，{user.name}！ 💖</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>目前總積分：{myScore} 分 🏆</p>
      </div>

      {state.gameState === 'waiting' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2>遊戲即將開始... ⏳</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>請準備好，等候主持人發球！ 🏸</p>
        </div>
      )}

      {state.gameState === 'finished' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2>🎉 比賽結束 🎉</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>您最終獲得了 <strong>{myScore}</strong> 分！ 🏅</p>
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
          <h2>✨ {currentQ.text} ✨</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>此題分數：{currentQ.points} 分</p>
          
          <div className="options-grid">
            {currentQ.options.map((opt, i) => {
              const isReveal = state.gameState === 'reveal';
              const isCorrect = isReveal && i === currentQ.answer;
              const isWrong = isReveal && i !== currentQ.answer;
              const isSelected = selectedOption === i;
              
              let bg = 'white';
              let color = 'inherit';
              let border = '#FFE5EC';
              
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
              } else if (isSelected) {
                // Selected but not yet revealed: use pastel blue
                bg = '#BDE0FE';
                color = '#003049';
                border = '#A2D2FF';
              }

              return (
                <div 
                  key={i} 
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (state.gameState === 'active' && !hasAnsweredCurrent) {
                      setSelectedOption(i);
                    }
                  }}
                  style={{ 
                    opacity: (hasAnsweredCurrent && !isReveal && !isSelected) ? 0.6 : 1, 
                    cursor: (hasAnsweredCurrent || isReveal) ? 'default' : 'pointer',
                    pointerEvents: (hasAnsweredCurrent || isReveal) ? 'none' : 'auto',
                    background: bg,
                    color: color,
                    borderColor: border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {isSelected && <BadmintonIcon />}
                  <span>{opt}</span>
                  {isCorrect && ' ✔️'}
                </div>
              );
            })}
          </div>

          {state.gameState === 'active' && !hasAnsweredCurrent && (
            <button 
              className="btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%', fontSize: '1.2rem', padding: '1rem', opacity: selectedOption === null ? 0.5 : 1 }}
              onClick={submitAnswer}
              disabled={selectedOption === null}
            >
              殺球送出！ 🏸
            </button>
          )}

          {state.gameState === 'active' && hasAnsweredCurrent && (
            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              您已送出答案！等待裁判判決... 🎾
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
