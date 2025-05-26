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