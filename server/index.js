const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 초기 데이터
const initialOutLinks = [
  {
    id: '1',
    name: 'GPT 에이전트',
    description: 'AI 기반 대화형 에이전트 서비스',
    isApplied: true,
    category: 'AI 서비스',
    userPageUrl: 'https://agent.gptko.co.kr',
    adminPageUrl: 'https://admin.agent.gptko.co.kr',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: '번역 서비스',
    description: '다국어 번역 및 언어 학습 플랫폼',
    isApplied: false,
    category: '언어 서비스',
    userPageUrl: 'https://translate.example.com',
    adminPageUrl: 'https://admin.translate.example.com',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: '문서 관리',
    description: '클라우드 기반 문서 관리 시스템',
    isApplied: true,
    category: '생산성',
    userPageUrl: 'https://docs.example.com',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

// 메모리 저장소 (개발용)
let outLinks = [...initialOutLinks];

// API 라우트
// GET: 모든 아웃링크 조회
app.get('/api/outlinks', (req, res) => {
  try {
    console.log('GET /api/outlinks - 현재 데이터:', outLinks.length, '개 항목');
    res.json(outLinks);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Failed to fetch outlinks' });
  }
});

// POST: 새 아웃링크 생성
app.post('/api/outlinks', (req, res) => {
  try {
    const { name, description, isApplied, category, userPageUrl, adminPageUrl } = req.body;
    
    if (!name || !description || !category || !userPageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newOutLink = {
      id: Date.now().toString(),
      name,
      description,
      isApplied: Boolean(isApplied),
      category,
      userPageUrl,
      adminPageUrl: adminPageUrl || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    outLinks.push(newOutLink);
    console.log('POST /api/outlinks - 새 아웃링크 추가:', newOutLink.name);
    
    res.status(201).json(newOutLink);
  } catch (error) {
    console.error('POST Error:', error);
    res.status(500).json({ error: 'Failed to create outlink' });
  }
});

// PUT: 아웃링크 수정
app.put('/api/outlinks', (req, res) => {
  try {
    const { id } = req.query;
    const { name, description, isApplied, category, userPageUrl, adminPageUrl } = req.body;
    
    if (!id || !name || !description || !category || !userPageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const index = outLinks.findIndex(link => link.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Outlink not found' });
    }
    
    outLinks[index] = {
      ...outLinks[index],
      name,
      description,
      isApplied: Boolean(isApplied),
      category,
      userPageUrl,
      adminPageUrl: adminPageUrl || undefined,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('PUT /api/outlinks - 아웃링크 수정:', outLinks[index].name);
    
    res.json(outLinks[index]);
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ error: 'Failed to update outlink' });
  }
});

// DELETE: 아웃링크 삭제
app.delete('/api/outlinks', (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }
    
    const index = outLinks.findIndex(link => link.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Outlink not found' });
    }
    
    const deletedLink = outLinks[index];
    outLinks.splice(index, 1);
    
    console.log('DELETE /api/outlinks - 아웃링크 삭제:', deletedLink.name);
    
    res.json({ message: 'Outlink deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ error: 'Failed to delete outlink' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`초기 데이터: ${outLinks.length}개 아웃링크`);
}); 