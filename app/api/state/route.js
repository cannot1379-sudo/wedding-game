import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/local-db';

function processGameState(db) {
  const now = Date.now();
  let changed = false;

  if (db.gameState === 'active') {
    const elapsed = now - db.phaseStartTime;
    // 60秒作答時間
    if (elapsed >= 60000) {
      db.gameState = 'reveal';
      db.phaseStartTime = now;
      changed = true;
    }
  } else if (db.gameState === 'reveal') {
    const elapsed = now - db.phaseStartTime;
    // 10秒公布答案時間
    if (elapsed >= 10000) {
      const nextIndex = db.currentQuestionIndex + 1;
      if (nextIndex < db.questions.length) {
        db.gameState = 'active';
        db.currentQuestionIndex = nextIndex;
        db.phaseStartTime = now;
      } else {
        db.gameState = 'finished';
      }
      changed = true;
    }
  }
  return changed;
}

export async function GET() {
  const db = readDb();
  if (processGameState(db)) {
    writeDb(db);
  }
  return NextResponse.json(db);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = readDb();
    
    // 在處理動作前先更新狀態機
    processGameState(db);

    const { action, payload } = body;

    if (action === 'start_game') {
      if (db.questions.length > 0) {
        db.gameState = 'active';
        db.currentQuestionIndex = 0;
        db.phaseStartTime = Date.now();
      }
    } else if (action === 'stop_game') {
      db.gameState = 'waiting';
      db.currentQuestionIndex = null;
      db.phaseStartTime = null;
    } else if (action === 'submit_answer') {
      if (db.gameState === 'active' && db.currentQuestionIndex !== null) {
        const { userId, selectedIndex } = payload;
        const currentQ = db.questions[db.currentQuestionIndex];
        const questionId = currentQ.id;

        if (!db.users[userId]) {
          db.users[userId] = { id: userId, name: payload.name || 'Anonymous', score: 0, answered: [] };
        }
        const user = db.users[userId];
        
        if (!user.answered.includes(questionId)) {
          user.answered.push(questionId);
          if (currentQ.answer === selectedIndex) {
            user.score += currentQ.points;
          }
        }
      }
    } else if (action === 'admin_update_questions') {
      db.questions = payload.questions;
    } else if (action === 'register_user') {
      if (!db.users[payload.userId]) {
        db.users[payload.userId] = { id: payload.userId, name: payload.name, score: 0, answered: [] };
      }
    } else if (action === 'reset') {
      db.gameState = 'waiting';
      db.currentQuestionIndex = null;
      db.phaseStartTime = null;
      db.users = {};
    }

    // 處理完動作後，如果剛好有狀態變更(例如 reset)，確保會被寫入
    processGameState(db); 
    writeDb(db);
    return NextResponse.json({ success: true, db });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
