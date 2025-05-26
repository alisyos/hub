export interface OutLink {
  id: string;
  name: string;
  description: string;
  isApplied: boolean;
  category: string;
  userPageUrl: string;
  adminPageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutLinkFormData {
  name: string;
  description: string;
  isApplied: boolean;
  category: string;
  userPageUrl: string;
  adminPageUrl?: string;
}

export type OutLinkStatus = 'applied' | 'not-applied';

export interface CategoryOption {
  value: string;
  label: string;
} 