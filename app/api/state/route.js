import { NextResponse } from 'next/server';
import { db as firebaseDb } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STATE_DOC_ID = 'game_state';

// Fallback logic for offline mode
import { readDb, writeDb } from '@/lib/local-db';

async function fetchState() {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return readDb();
  }
  const docRef = doc(firebaseDb, 'wedding', STATE_DOC_ID);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    const defaultState = {
      gameState: 'waiting',
      currentQuestionIndex: null,
      phaseStartTime: null,
      questions: [],
      users: {}
    };
    await setDoc(docRef, defaultState);
    return defaultState;
  }
  return snap.data();
}

async function saveState(data) {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    writeDb(data);
    return;
  }
  const docRef = doc(firebaseDb, 'wedding', STATE_DOC_ID);
  await setDoc(docRef, data);
}

function processGameState(dbState) {
  const now = Date.now();
  let changed = false;
  if (dbState.gameState === 'active') {
    const elapsed = now - dbState.phaseStartTime;
    if (elapsed >= 60000) {
      dbState.gameState = 'reveal';
      dbState.phaseStartTime = now;
      changed = true;
    }
  } else if (dbState.gameState === 'reveal') {
    const elapsed = now - dbState.phaseStartTime;
    if (elapsed >= 10000) {
      const nextIndex = dbState.currentQuestionIndex + 1;
      if (nextIndex < dbState.questions.length) {
        dbState.gameState = 'active';
        dbState.currentQuestionIndex = nextIndex;
        dbState.phaseStartTime = now;
      } else {
        dbState.gameState = 'finished';
      }
      changed = true;
    }
  }
  return changed;
}

export async function GET() {
  const dbState = await fetchState();
  if (processGameState(dbState)) {
    await saveState(dbState);
  }
  return NextResponse.json(dbState);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const dbState = await fetchState();
    
    processGameState(dbState);

    const { action, payload } = body;

    if (action === 'start_game') {
      if (dbState.questions.length > 0) {
        dbState.gameState = 'active';
        dbState.currentQuestionIndex = 0;
        dbState.phaseStartTime = Date.now();
      }
    } else if (action === 'stop_game') {
      dbState.gameState = 'waiting';
      dbState.currentQuestionIndex = null;
      dbState.phaseStartTime = null;
    } else if (action === 'submit_answer') {
      if (dbState.gameState === 'active' && dbState.currentQuestionIndex !== null) {
        const { userId, selectedIndex } = payload;
        const currentQ = dbState.questions[dbState.currentQuestionIndex];
        const questionId = currentQ.id;

        if (!dbState.users[userId]) {
          dbState.users[userId] = { id: userId, name: payload.name || 'Anonymous', score: 0, answered: [] };
        }
        const user = dbState.users[userId];
        
        if (!user.answered.includes(questionId)) {
          user.answered.push(questionId);
          if (currentQ.answer === selectedIndex) {
            user.score += currentQ.points;
          }
        }
      }
    } else if (action === 'admin_update_questions') {
      dbState.questions = payload.questions;
    } else if (action === 'register_user') {
      if (!dbState.users[payload.userId]) {
        dbState.users[payload.userId] = { id: payload.userId, name: payload.name, score: 0, answered: [] };
      }
    } else if (action === 'reset') {
      dbState.gameState = 'waiting';
      dbState.currentQuestionIndex = null;
      dbState.phaseStartTime = null;
      dbState.users = {};
    }

    processGameState(dbState); 
    await saveState(dbState);
    return NextResponse.json({ success: true, db: dbState });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
