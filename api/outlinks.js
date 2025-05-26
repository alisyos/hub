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

// 메모리 저장소 (임시)
let outLinks = [...initialOutLinks];

export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        handleGet(req, res);
        break;
      case 'POST':
        handlePost(req, res);
        break;
      case 'PUT':
        handlePut(req, res);
        break;
      case 'DELETE':
        handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET: 모든 아웃링크 조회
function handleGet(req, res) {
  try {
    console.log('GET /api/outlinks - 현재 데이터:', outLinks.length, '개 항목');
    res.status(200).json(outLinks);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Failed to fetch outlinks' });
  }
}

// POST: 새 아웃링크 생성
function handlePost(req, res) {
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
}

// PUT: 아웃링크 수정
function handlePut(req, res) {
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
    
    res.status(200).json(outLinks[index]);
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ error: 'Failed to update outlink' });
  }
}

// DELETE: 아웃링크 삭제
function handleDelete(req, res) {
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
    
    res.status(200).json({ message: 'Outlink deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ error: 'Failed to delete outlink' });
  }
} 