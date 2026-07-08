"use client";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
  const { state, dispatch } = useStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [submittedFor, setSubmittedFor] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || !state) return <div className="container"><p>載入中...</p></div>;

  const currentQ = state.questions.find(q => q.id === state.currentQuestionId);
  const myScore = state.users[user.id]?.score || 0;
  const myAnswered = state.users[user.id]?.answered || [];

  const hasAnsweredCurrent = currentQ && (myAnswered.includes(currentQ.id) || submittedFor === currentQ.id);

  const submitAnswer = async (index) => {
    if (hasAnsweredCurrent) return;
    setSubmittedFor(currentQ.id);
    await dispatch('submit_answer', {
      userId: user.id,
      name: user.name,
      questionId: currentQ.id,
      selectedIndex: index
    });
  };

  return (
    <div className="container">
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>嗨，{user.name}！</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>目前積分：{myScore} 分</p>
      </div>

      {!currentQ ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2>等待出題中...</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>請留意大螢幕，主持人馬上就會發布下一題！</p>
        </div>
      ) : (
        <div className="glass-card">
          <h2>{currentQ.text}</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>此題分數：{currentQ.points} 分</p>
          
          <div className="options-grid">
            {currentQ.options.map((opt, i) => (
              <div 
                key={i} 
                className="option-card"
                onClick={() => submitAnswer(i)}
                style={{ 
                  opacity: hasAnsweredCurrent ? 0.6 : 1, 
                  cursor: hasAnsweredCurrent ? 'not-allowed' : 'pointer',
                  pointerEvents: hasAnsweredCurrent ? 'none' : 'auto'
                }}
              >
                {opt}
              </div>
            ))}
          </div>

          {hasAnsweredCurrent && (
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem' }}>
              您已送出答案！請看大螢幕等待結果...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
