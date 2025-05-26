import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export interface OutLink {
  id: string;
  name: string;
  description: string;
  isApplied: boolean;
  category: string;
  userPageUrl: string;
  adminPageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const OUTLINKS_KEY = 'outlinks';

// 초기 데이터
const initialOutLinks: OutLink[] = [
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

// 로컬 개발용 메모리 저장소
let localMemoryStore: OutLink[] | null = null;

// KV 사용 가능 여부 확인
const isKVAvailable = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// 데이터 저장 함수
const setData = async (data: OutLink[]) => {
  if (isKVAvailable()) {
    await kv.set(OUTLINKS_KEY, data);
  } else {
    localMemoryStore = data;
    console.log('로컬 메모리에 데이터 저장:', data.length, '개 항목');
  }
};

// 데이터 조회 함수
const getData = async (): Promise<OutLink[] | null> => {
  if (isKVAvailable()) {
    return await kv.get<OutLink[]>(OUTLINKS_KEY);
  } else {
    console.log('로컬 메모리에서 데이터 조회:', localMemoryStore?.length || 0, '개 항목');
    return localMemoryStore;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
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
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    let outLinks = await getData();
    
    // 데이터가 없으면 초기 데이터로 설정
    if (!outLinks) {
      outLinks = initialOutLinks;
      await setData(outLinks);
      console.log('초기 데이터로 설정됨');
    }
    
    res.status(200).json(outLinks);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Failed to fetch outlinks' });
  }
}

// POST: 새 아웃링크 생성
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, isApplied, category, userPageUrl, adminPageUrl } = req.body;
    
    if (!name || !description || !category || !userPageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const outLinks = await getData() || initialOutLinks;
    
    const newOutLink: OutLink = {
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
    
    const updatedOutLinks = [...outLinks, newOutLink];
    await setData(updatedOutLinks);
    
    res.status(201).json(newOutLink);
  } catch (error) {
    console.error('POST Error:', error);
    res.status(500).json({ error: 'Failed to create outlink' });
  }
}

// PUT: 아웃링크 수정
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { name, description, isApplied, category, userPageUrl, adminPageUrl } = req.body;
    
    if (!id || !name || !description || !category || !userPageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const outLinks = await getData() || initialOutLinks;
    
    const updatedOutLinks = outLinks.map(link =>
      link.id === id
        ? {
            ...link,
            name,
            description,
            isApplied: Boolean(isApplied),
            category,
            userPageUrl,
            adminPageUrl: adminPageUrl || undefined,
            updatedAt: new Date().toISOString(),
          }
        : link
    );
    
    await setData(updatedOutLinks);
    
    const updatedLink = updatedOutLinks.find(link => link.id === id);
    res.status(200).json(updatedLink);
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ error: 'Failed to update outlink' });
  }
}

// DELETE: 아웃링크 삭제
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }
    
    const outLinks = await getData() || initialOutLinks;
    
    const updatedOutLinks = outLinks.filter(link => link.id !== id);
    await setData(updatedOutLinks);
    
    res.status(200).json({ message: 'Outlink deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ error: 'Failed to delete outlink' });
  }
} 