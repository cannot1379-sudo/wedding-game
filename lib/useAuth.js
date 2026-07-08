"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, OAuthProvider, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 若無設定環境變數，維持假登入模式
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      const stored = sessionStorage.getItem('wedding_user');
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Guest'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (name) => {
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        const newUser = { id: `user_${Math.random().toString(36).substring(2, 9)}`, name: name || 'Mock User' };
        sessionStorage.setItem('wedding_user', JSON.stringify(newUser));
        setUser(newUser);
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register_user', payload: { userId: newUser.id, name: newUser.name } })
        });
        return;
      }

      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'mock') {
        await setPersistence(auth, browserSessionPersistence);
      }

      const provider = new OAuthProvider('oidc.line');
      provider.addScope('profile');
      provider.addScope('openid');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Update Firebase profile with the typed name so it sticks
      if (name && name !== firebaseUser.displayName) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(firebaseUser, { displayName: name });
      }

      const newUser = { id: firebaseUser.uid, name: name || firebaseUser.displayName || 'Guest' };
      
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register_user', payload: { userId: newUser.id, name: newUser.name } })
      });
    } catch (error) {
      console.error("Login failed:", error);
      alert('登入失敗，請確認 Firebase 與 LINE Identity Platform 設定是否正確。');
    }
  };

  const logout = async () => {
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'mock') {
      await signOut(auth);
    } else {
      sessionStorage.removeItem('wedding_user');
    }
    setUser(null);
  };

  return { user, loading, login, logout };
}
