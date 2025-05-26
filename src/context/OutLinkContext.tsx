import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { OutLink, OutLinkFormData } from '../types';
import { apiService } from '../services/api';

interface OutLinkContextType {
  outLinks: OutLink[];
  loading: boolean;
  error: string | null;
  addOutLink: (data: OutLinkFormData) => Promise<void>;
  updateOutLink: (id: string, data: OutLinkFormData) => Promise<void>;
  deleteOutLink: (id: string) => Promise<void>;
  getOutLinkById: (id: string) => OutLink | undefined;
  refreshOutLinks: () => Promise<void>;
}

const OutLinkContext = createContext<OutLinkContextType | undefined>(undefined);

// Fallback 데이터
const fallbackOutLinks: OutLink[] = [
  {
    id: '1',
    name: 'GPT 에이전트',
    description: 'AI 기반 대화형 에이전트 서비스',
    isApplied: true,
    category: 'AI 서비스',
    userPageUrl: 'https://agent.gptko.co.kr',
    adminPageUrl: 'https://admin.agent.gptko.co.kr',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '번역 서비스',
    description: '다국어 번역 및 언어 학습 플랫폼',
    isApplied: false,
    category: '언어 서비스',
    userPageUrl: 'https://translate.example.com',
    adminPageUrl: 'https://admin.translate.example.com',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: '문서 관리',
    description: '클라우드 기반 문서 관리 시스템',
    isApplied: true,
    category: '생산성',
    userPageUrl: 'https://docs.example.com',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

export const OutLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [outLinks, setOutLinks] = useState<OutLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 서버에서 데이터 로드
  const refreshOutLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('서버에서 데이터 로드 중...');
      
      const data = await apiService.getOutLinks();
      console.log('서버에서 로드된 데이터:', data);
      
      // Date 객체 변환
      const processedData = data.map(link => ({
        ...link,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt),
      }));
      
      setOutLinks(processedData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      console.log('Fallback 데이터 사용');
      
      // API 실패 시 fallback 데이터 사용
      setOutLinks(fallbackOutLinks);
      setError('서버 연결에 실패했습니다. 기본 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshOutLinks();
  }, [refreshOutLinks]);

  const addOutLink = useCallback(async (data: OutLinkFormData) => {
    try {
      setError(null);
      console.log('새 아웃링크 추가 중:', data);
      
      const newOutLink = await apiService.createOutLink(data);
      console.log('서버에서 생성된 아웃링크:', newOutLink);
      
      // 로컬 상태 업데이트
      const processedOutLink = {
        ...newOutLink,
        createdAt: new Date(newOutLink.createdAt),
        updatedAt: new Date(newOutLink.updatedAt),
      };
      
      setOutLinks(prev => [...prev, processedOutLink]);
    } catch (err) {
      console.error('아웃링크 추가 실패:', err);
      setError(err instanceof Error ? err.message : '아웃링크 추가에 실패했습니다.');
      throw err;
    }
  }, []);

  const updateOutLink = useCallback(async (id: string, data: OutLinkFormData) => {
    try {
      setError(null);
      console.log('아웃링크 수정 중:', id, data);
      
      const updatedOutLink = await apiService.updateOutLink(id, data);
      console.log('서버에서 수정된 아웃링크:', updatedOutLink);
      
      // 로컬 상태 업데이트
      const processedOutLink = {
        ...updatedOutLink,
        createdAt: new Date(updatedOutLink.createdAt),
        updatedAt: new Date(updatedOutLink.updatedAt),
      };
      
      setOutLinks(prev =>
        prev.map(link =>
          link.id === id ? processedOutLink : link
        )
      );
    } catch (err) {
      console.error('아웃링크 수정 실패:', err);
      setError(err instanceof Error ? err.message : '아웃링크 수정에 실패했습니다.');
      throw err;
    }
  }, []);

  const deleteOutLink = useCallback(async (id: string) => {
    try {
      setError(null);
      console.log('아웃링크 삭제 중:', id);
      
      await apiService.deleteOutLink(id);
      console.log('서버에서 아웃링크 삭제 완료:', id);
      
      // 로컬 상태 업데이트
      setOutLinks(prev => prev.filter(link => link.id !== id));
    } catch (err) {
      console.error('아웃링크 삭제 실패:', err);
      setError(err instanceof Error ? err.message : '아웃링크 삭제에 실패했습니다.');
      throw err;
    }
  }, []);

  const getOutLinkById = useCallback((id: string) => {
    return outLinks.find(link => link.id === id);
  }, [outLinks]);

  return (
    <OutLinkContext.Provider
      value={{
        outLinks,
        loading,
        error,
        addOutLink,
        updateOutLink,
        deleteOutLink,
        getOutLinkById,
        refreshOutLinks,
      }}
    >
      {children}
    </OutLinkContext.Provider>
  );
};

export const useOutLink = () => {
  const context = useContext(OutLinkContext);
  if (context === undefined) {
    throw new Error('useOutLink must be used within an OutLinkProvider');
  }
  return context;
}; 