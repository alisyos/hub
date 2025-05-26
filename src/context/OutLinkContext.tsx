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

// 현재 앱 버전
const CURRENT_VERSION = '1.0.0';
const STORAGE_KEY = 'outlinks';
const VERSION_KEY = 'outlinks_version';

// 초기 데이터 (모든 사용자에게 동일하게 시작)
const initialOutLinks: OutLink[] = [
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

// 데이터 마이그레이션 함수
const migrateData = (data: any[], fromVersion: string, toVersion: string): OutLink[] => {
  console.log(`데이터 마이그레이션: ${fromVersion} → ${toVersion}`);
  
  // 버전별 마이그레이션 로직
  let migratedData = [...data];
  
  // 예시: 버전 1.0.0 이전 데이터에 새로운 필드 추가
  if (fromVersion < '1.0.0') {
    migratedData = migratedData.map(item => ({
      ...item,
      // 새로운 필드가 없으면 기본값 추가
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    }));
  }
  
  return migratedData.map((link: any) => ({
    ...link,
    createdAt: new Date(link.createdAt),
    updatedAt: new Date(link.updatedAt),
  }));
};

// localStorage에서 데이터 로드 (버전 관리 포함)
const loadOutLinksFromStorage = (): OutLink[] => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      
      // 버전 확인 및 마이그레이션
      if (storedVersion && storedVersion !== CURRENT_VERSION) {
        console.log('버전 업데이트 감지:', storedVersion, '→', CURRENT_VERSION);
        const migratedData = migrateData(parsed, storedVersion, CURRENT_VERSION);
        
        // 마이그레이션된 데이터 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        
        console.log('데이터 마이그레이션 완료');
        return migratedData;
      } else if (!storedVersion) {
        // 버전 정보가 없는 경우 (이전 버전)
        console.log('버전 정보 없음 - 마이그레이션 수행');
        const migratedData = migrateData(parsed, '0.0.0', CURRENT_VERSION);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        
        return migratedData;
      } else {
        // 동일한 버전 - Date 객체만 복원
        return parsed.map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt),
          updatedAt: new Date(link.updatedAt),
        }));
      }
    } else {
      // 처음 실행 - 초기 데이터 사용
      console.log('처음 실행 - 초기 데이터 로드');
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return initialOutLinks;
    }
  } catch (error) {
    console.error('localStorage에서 데이터 로드 실패:', error);
    // 오류 발생 시 초기 데이터 사용
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return initialOutLinks;
  }
};

// localStorage에 데이터 저장 (버전 정보 포함)
const saveOutLinksToStorage = (outLinks: OutLink[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outLinks));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log('localStorage에 데이터 저장됨 (버전:', CURRENT_VERSION, '):', outLinks);
  } catch (error) {
    console.error('localStorage에 데이터 저장 실패:', error);
  }
};

// 데이터 백업 함수
const backupData = () => {
  try {
    const currentData = localStorage.getItem(STORAGE_KEY);
    const currentVersion = localStorage.getItem(VERSION_KEY);
    const timestamp = new Date().toISOString();
    
    if (currentData) {
      localStorage.setItem(`${STORAGE_KEY}_backup_${timestamp}`, currentData);
      localStorage.setItem(`${VERSION_KEY}_backup_${timestamp}`, currentVersion || 'unknown');
      console.log('데이터 백업 완료:', timestamp);
    }
  } catch (error) {
    console.error('데이터 백업 실패:', error);
  }
};

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
      setError(err instanceof Error ? err.message : '데이터 로드에 실패했습니다.');
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