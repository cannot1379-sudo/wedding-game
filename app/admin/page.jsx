"use client";
import { useState } from 'react';
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

  if (!state) return <div className="container"><p>載入中...</p></div>;

  const pushQuestion = (id) => {
    dispatch('set_question', { questionId: id });
  };

  const stopQuestion = () => {
    dispatch('set_question', { questionId: null });
  };

  const addQuestion = (e) => {
    e.preventDefault();
    const newQ = {
      id: `q${Date.now()}`,
      text: newText,
      options: [opt1, opt2, opt3, opt4].filter(Boolean),
      answer: Number(ans),
      points: Number(points)
    };
    dispatch('admin_update_questions', { questions: [...state.questions, newQ] });
    setNewText(""); setOpt1(""); setOpt2(""); setOpt3(""); setOpt4("");
  };

  const resetGame = () => {
    if(confirm('確定要重置所有積分與遊戲進度嗎？')) {
      dispatch('reset', {});
    }
  }

  return (
    <div className="container" style={{ padding: '2rem', display: 'block', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'left' }}>管理員後台</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
        <h2>遊戲控制</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => router.push('/leaderboard')} style={{ flex: 1 }}>大螢幕排行榜</button>
          <button className="btn-primary" onClick={stopQuestion} style={{ flex: 1, background: '#6c757d' }}>停止作答 (關閉目前題目)</button>
          <button className="btn-primary" onClick={resetGame} style={{ flex: 1, background: '#dc3545' }}>重置遊戲</button>
        </div>
        <p style={{ marginTop: '1rem' }}>
          目前題目狀態： <strong>{state.currentQuestionId ? `正在發布題目 ID: ${state.currentQuestionId}` : '等待中...'}</strong>
        </p>
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
            <label>正確解答 (索引 0 起)：</label>
            <input type="number" className="input-field" min="0" max="3" value={ans} onChange={e=>setAns(e.target.value)} style={{ width: '80px', margin: 0 }} />
            <label>設定積分：</label>
            <input type="number" className="input-field" min="1" value={points} onChange={e=>setPoints(e.target.value)} style={{ width: '80px', margin: 0 }} />
          </div>
          <button type="submit" className="btn-primary">新增題目</button>
        </form>
      </div>

      <div className="glass-card" style={{ maxWidth: '100%' }}>
        <h2>題目列表</h2>
        {state.questions.map((q, idx) => (
          <div key={q.id} style={{ border: '2px solid #e2e8f0', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{idx + 1}. {q.text} ({q.points} 分)</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              {q.options.map((o, i) => (
                <li key={i} style={{ color: i === q.answer ? '#28a745' : 'inherit', fontWeight: i === q.answer ? 'bold' : 'normal', marginBottom: '0.5rem' }}>
                  {o} {i === q.answer && ' (正確答案)'}
                </li>
              ))}
            </ul>
            <button 
              className="btn-primary" 
              onClick={() => pushQuestion(q.id)}
              disabled={state.currentQuestionId === q.id}
              style={{ background: state.currentQuestionId === q.id ? '#ccc' : undefined }}
            >
              {state.currentQuestionId === q.id ? '目前發布中' : '發布此題給賓客'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
