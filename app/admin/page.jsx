"use client";
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/useStore';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();

  const [newText, setNewText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [ans, setAns] = useState(0);
  const [points, setPoints] = useState(10);

  const [timeLeft, setTimeLeft] = useState(0);
  const [qDurationInput, setQDurationInput] = useState(60);
  const [rDurationInput, setRDurationInput] = useState(10);

  useEffect(() => {
    if (state) {
      if (state.questionDuration !== undefined) setQDurationInput(state.questionDuration);
      if (state.revealDuration !== undefined) setRDurationInput(state.revealDuration);
    }
  }, [state?.questionDuration, state?.revealDuration]);

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

  const startGame = () => {
    if(state.questions.length === 0) return alert('請先新增題目');
    dispatch('start_game', {});
  };

  const stopGame = () => dispatch('stop_game', {});

  const addQuestion = (e) => {
    e.preventDefault();
    const validOptions = [opt1, opt2, opt3, opt4].filter(Boolean);
    const newQ = {
      id: `q${Date.now()}`,
      text: newText,
      options: validOptions,
      answer: Number(ans) >= validOptions.length ? 0 : Number(ans),
      points: Number(points)
    };
    dispatch('admin_update_questions', { questions: [...state.questions, newQ] });
    setNewText(""); setOpt1(""); setOpt2(""); setOpt3(""); setOpt4("");
    setAns(0);
  };

  const deleteQuestion = (id) => {
    if (confirm('確定要刪除這題嗎？')) {
      const newQuestions = state.questions.filter(q => q.id !== id);
      dispatch('admin_update_questions', { questions: newQuestions });
    }
  };

  const resetGame = () => {
    if(confirm('確定要重置所有積分與遊戲進度嗎？')) {
      dispatch('reset', {});
    }
  };

  const getStatusText = () => {
    if (state.gameState === 'waiting') return '等待開始';
    if (state.gameState === 'finished') return '遊戲結束 (顯示最終成績)';
    const currentQ = state.questions[state.currentQuestionIndex];
    if (state.gameState === 'active') return `正在作答：第 ${state.currentQuestionIndex + 1} 題 - ${currentQ?.text}`;
    if (state.gameState === 'reveal') return `公布答案：第 ${state.currentQuestionIndex + 1} 題`;
    return '未知狀態';
  };

  return (
    <div className="container" style={{ padding: '2rem', display: 'block', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'left' }}>管理員後台</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
        <h2>遊戲流程控制 (自動化)</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={startGame} disabled={state.gameState !== 'waiting' && state.gameState !== 'finished'} style={{ flex: 1, background: (state.gameState !== 'waiting' && state.gameState !== 'finished') ? '#ccc' : '#28a745' }}>開始遊戲 (自動換題)</button>
          <button className="btn-primary" onClick={stopGame} disabled={state.gameState === 'waiting'} style={{ flex: 1, background: state.gameState === 'waiting' ? '#ccc' : '#6c757d' }}>強制停止</button>
          <button className="btn-primary" onClick={resetGame} style={{ flex: 1, background: '#dc3545' }}>重置遊戲</button>
          <button className="btn-primary" onClick={() => router.push('/leaderboard')} style={{ flex: 1 }}>大螢幕</button>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', padding: '0.8rem', background: '#fff0f3', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginRight: '0.5rem', fontSize: '0.95rem' }}>⏱️ 每題答題時間 (秒)：</label>
            <input 
              type="number" 
              className="input-field" 
              min="5" 
              value={qDurationInput} 
              onChange={e => {
                const val = Number(e.target.value);
                setQDurationInput(val);
                dispatch('update_settings', { questionDuration: val, revealDuration: rDurationInput });
              }} 
              style={{ width: '85px', margin: 0, padding: '0.5rem', border: '2px solid var(--secondary)', borderRadius: '8px' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginRight: '0.5rem', fontSize: '0.95rem' }}>📢 答案公布時間 (秒)：</label>
            <input 
              type="number" 
              className="input-field" 
              min="3" 
              value={rDurationInput} 
              onChange={e => {
                const val = Number(e.target.value);
                setRDurationInput(val);
                dispatch('update_settings', { questionDuration: qDurationInput, revealDuration: val });
              }} 
              style={{ width: '85px', margin: 0, padding: '0.5rem', border: '2px solid var(--secondary)', borderRadius: '8px' }} 
            />
          </div>
        </div>
        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>目前狀態：<strong>{getStatusText()}</strong></p>
          {(state.gameState === 'active' || state.gameState === 'reveal') && (
            <p style={{ fontSize: '1.5rem', color: '#ff4757', fontWeight: 'bold' }}>剩餘時間：{timeLeft} 秒</p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
        <h2>新增題目</h2>
        <form onSubmit={addQuestion}>
          <input className="input-field" placeholder="題目" value={newText} onChange={e=>setNewText(e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input className="input-field" placeholder="選項 1" value={opt1} onChange={e=>setOpt1(e.target.value)} required />
            <input className="input-field" placeholder="選項 2" value={opt2} onChange={e=>setOpt2(e.target.value)} required />
            <input className="input-field" placeholder="選項 3" value={opt3} onChange={e=>setOpt3(e.target.value)} />
            <input className="input-field" placeholder="選項 4" value={opt4} onChange={e=>setOpt4(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <label>正確解答：</label>
            <select className="input-field" value={ans} onChange={e=>setAns(e.target.value)} style={{ width: 'auto', minWidth: '150px', margin: 0 }}>
              {[opt1, opt2, opt3, opt4].filter(Boolean).map((opt, idx) => (
                <option key={idx} value={idx}>{`選項 ${idx + 1} (${opt})`}</option>
              ))}
            </select>
            <label>設定積分：</label>
            <input type="number" className="input-field" min="1" value={points} onChange={e=>setPoints(e.target.value)} style={{ width: '80px', margin: 0 }} />
          </div>
          <button type="submit" className="btn-primary" disabled={state.gameState !== 'waiting'}>新增題目 (遊戲中無法新增)</button>
        </form>
      </div>

      <div className="glass-card" style={{ maxWidth: '100%' }}>
        <h2>題目列表 (共 {state.questions.length} 題)</h2>
        {state.questions.map((q, idx) => (
          <div key={q.id} style={{ border: '2px solid #e2e8f0', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', opacity: state.currentQuestionIndex === idx ? 1 : 0.6, position: 'relative' }}>
            <button 
              onClick={() => deleteQuestion(q.id)} 
              disabled={state.gameState !== 'waiting'}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: state.gameState !== 'waiting' ? '#ccc' : '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: state.gameState !== 'waiting' ? 'not-allowed' : 'pointer' }}>
              刪除
            </button>
            <h3 style={{ marginBottom: '1rem', paddingRight: '4rem' }}>{idx + 1}. {q.text} ({q.points} 分)</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
              {q.options.map((o, i) => (
                <li key={i} style={{ color: i === q.answer ? '#28a745' : 'inherit', fontWeight: i === q.answer ? 'bold' : 'normal', marginBottom: '0.5rem' }}>
                  {o} {i === q.answer && ' (正確答案)'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
