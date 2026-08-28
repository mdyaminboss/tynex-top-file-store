export type CategoryType = 'Apps' | 'Games' | 'Tools' | 'Open Source' | 'Templates' | 'Documents' | 'Other Files';

export interface FileItem {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  version: string;
  fileSize: string;
  iconUrl: string;
  fileUrl: string;
  storagePath: string;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: any;
}
