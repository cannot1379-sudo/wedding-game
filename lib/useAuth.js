"use client";
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('wedding_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (name) => {
    const newUser = { id: `user_${Math.random().toString(36).substring(2, 9)}`, name };
    localStorage.setItem('wedding_user', JSON.stringify(newUser));
    setUser(newUser);
    
    // 將使用者註冊到全域狀態中
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register_user', payload: { userId: newUser.id, name: newUser.name } })
    });
  };

  const logout = () => {
    localStorage.removeItem('wedding_user');
    setUser(null);
  };

  return { user, loading, login, logout };
}
