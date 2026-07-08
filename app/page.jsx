"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const [name, setName] = useState("");
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/game");
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await login(name);
    router.push("/game");
  };

  if (loading) return <div className="container"><p>載入中... 🏸</p></div>;

  return (
    <main className="container" style={{ justifyContent: 'center' }}>
      <div className="glass-card">
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🏸💒💖</div>
        <h1>歡迎來到我們的婚禮</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>
          請輸入您的姓名，準備好跟我們一起玩羽球問答遊戲了嗎？✨
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="input-field"
            placeholder="🎀 請輸入您的真實姓名 🎀"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            進入遊戲 (模擬 LINE 登入) 🚀
          </button>
        </form>
      </div>
    </main>
  );
}
