import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/local-db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = readDb();
    const { action, payload } = body;

    if (action === 'set_question') {
      db.currentQuestionId = payload.questionId;
    } else if (action === 'submit_answer') {
      const { userId, questionId, selectedIndex } = payload;
      const q = db.questions.find(q => q.id === questionId);
      if (!db.users[userId]) {
        db.users[userId] = { id: userId, name: payload.name || 'Anonymous', score: 0, answered: [] };
      }
      const user = db.users[userId];
      if (!user.answered.includes(questionId)) {
        user.answered.push(questionId);
        if (q && q.answer === selectedIndex) {
          user.score += q.points;
        }
      }
    } else if (action === 'admin_update_questions') {
      db.questions = payload.questions;
    } else if (action === 'register_user') {
      if (!db.users[payload.userId]) {
        db.users[payload.userId] = { id: payload.userId, name: payload.name, score: 0, answered: [] };
      }
    } else if (action === 'reset') {
      db.currentQuestionId = null;
      db.users = {};
    }

    writeDb(db);
    return NextResponse.json({ success: true, db });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
