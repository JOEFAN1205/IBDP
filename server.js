const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize data file if it doesn't exist
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      members: {
        JOE: {
          name: 'JOE',
          avatar: '🎯',
          status: '准备中',
          content: '暂未填写升学情况...',
          universities: [],
          lastUpdated: new Date().toISOString()
        },
        Alice: {
          name: 'Alice',
          avatar: '🌸',
          status: '准备中',
          content: '暂未填写升学情况...',
          universities: [],
          lastUpdated: new Date().toISOString()
        },
        Mill: {
          name: 'Mill',
          avatar: '⚡',
          status: '准备中',
          content: '暂未填写升学情况...',
          universities: [],
          lastUpdated: new Date().toISOString()
        },
        Rain: {
          name: 'Rain',
          avatar: '🌧️',
          status: '准备中',
          content: '暂未填写升学情况...',
          universities: [],
          lastUpdated: new Date().toISOString()
        }
      },
      announcements: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Read data
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Password validation - each person's password is their English name
const PASSWORDS = {
  JOE: 'JOE',
  Alice: 'Alice',
  Mill: 'Mill',
  Rain: 'Rain'
};

// API: Get all members data
app.get('/api/members', (req, res) => {
  const data = readData();
  res.json(data.members);
});

// API: Get single member data
app.get('/api/members/:name', (req, res) => {
  const data = readData();
  const member = data.members[req.params.name];
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

// API: Verify password
app.post('/api/auth', (req, res) => {
  const { name, password } = req.body;
  if (PASSWORDS[name] && PASSWORDS[name] === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: '密码错误' });
  }
});

// API: Update member data (requires password)
app.put('/api/members/:name', (req, res) => {
  const { password, content, status, universities, avatar } = req.body;
  const name = req.params.name;

  if (!PASSWORDS[name] || PASSWORDS[name] !== password) {
    return res.status(401).json({ error: '密码错误，无法修改' });
  }

  const data = readData();
  if (!data.members[name]) {
    return res.status(404).json({ error: 'Member not found' });
  }

  if (content !== undefined) data.members[name].content = content;
  if (status !== undefined) data.members[name].status = status;
  if (universities !== undefined) data.members[name].universities = universities;
  if (avatar !== undefined) data.members[name].avatar = avatar;
  data.members[name].lastUpdated = new Date().toISOString();

  writeData(data);
  res.json({ success: true, member: data.members[name] });
});

// API: Get announcements
app.get('/api/announcements', (req, res) => {
  const data = readData();
  res.json(data.announcements || []);
});

// API: Post announcement (any authenticated member)
app.post('/api/announcements', (req, res) => {
  const { name, password, message } = req.body;

  if (!PASSWORDS[name] || PASSWORDS[name] !== password) {
    return res.status(401).json({ error: '密码错误' });
  }

  const data = readData();
  if (!data.announcements) data.announcements = [];
  data.announcements.unshift({
    author: name,
    message,
    timestamp: new Date().toISOString()
  });

  // Keep max 50 announcements
  if (data.announcements.length > 50) {
    data.announcements = data.announcements.slice(0, 50);
  }

  writeData(data);
  res.json({ success: true });
});

// Initialize data and start server
initData();
app.listen(PORT, () => {
  console.log(`🚀 SCW IBDP 12-4 Tracker running at http://localhost:${PORT}`);
});
