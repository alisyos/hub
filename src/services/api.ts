import { OutLink, OutLinkFormData } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // 상대 경로 사용
  : 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 모든 아웃링크 조회
  async getOutLinks(): Promise<OutLink[]> {
    return this.request<OutLink[]>('/outlinks');
  }

  // 새 아웃링크 생성
  async createOutLink(data: OutLinkFormData): Promise<OutLink> {
    return this.request<OutLink>('/outlinks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 아웃링크 수정
  async updateOutLink(id: string, data: OutLinkFormData): Promise<OutLink> {
    return this.request<OutLink>(`/outlinks?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 아웃링크 삭제
  async deleteOutLink(id: string): Promise<void> {
    return this.request<void>(`/outlinks?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 