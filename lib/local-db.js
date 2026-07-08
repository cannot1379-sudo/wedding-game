import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.json');

const defaultState = {
  gameState: 'waiting', // 'waiting', 'active', 'reveal', 'finished'
  currentQuestionIndex: null,
  phaseStartTime: null,
  questions: [
    { id: 'q1', text: '新郎與新娘第一次約會的地點？', options: ['電影院', '餐廳', '公園', '遊樂園'], answer: 1, points: 10 },
    { id: 'q2', text: '新娘最喜歡的食物？', options: ['拉麵', '火鍋', '壽司', '牛排'], answer: 1, points: 10 },
  ],
  users: {}
};

export function readDb() {
  if (!fs.existsSync(dbPath)) {
    writeDb(defaultState);
    return defaultState;
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return defaultState;
  }
}

export function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
