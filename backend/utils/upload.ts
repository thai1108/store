import { Environment } from '@/types/common';

export interface UploadOptions {
  folder?: string; // e.g., 'avatars', 'products'
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
  maxSize?: number; // in bytes
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  message?: string;
}

export class UploadService {
  private storage: R2Bucket;
  private baseUrl: string;

  constructor(storage: R2Bucket, baseUrl: string) {
    this.storage = storage;
    this.baseUrl = baseUrl;
  }

  /**
   * Upload a file to R2 storage
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Set defaults
      const {
        folder = 'uploads',
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSize = 5 * 1024 * 1024, // 5MB default
      } = options;

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
      }

      // Validate file size
      if (file.size > maxSize) {
        return {
          success: false,
          message: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const key = `${folder}/${timestamp}-${randomString}.${extension}`;

      // Upload to R2
      await this.storage.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Generate URL
      // For public access, you need to configure R2 bucket with custom domain
      // or use R2.dev subdomain (requires enabling public access)
      const url = this.baseUrl ? `${this.baseUrl}/${key}` : key;

      return {
        success: true,
        url,
        key,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: 'Failed to upload file',
      };
    }
  }

  /**
   * Delete a file from R2 storage
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.storage.delete(key);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get a file from R2 storage
   */
  async getFile(key: string): Promise<R2ObjectBody | null> {
    try {
      return await this.storage.get(key);
    } catch (error) {
      console.error('Get file error:', error);
      return null;
    }
  }

  /**
   * Get a signed URL for temporary access (if needed)
   */
  getPublicUrl(key: string): string {
    return this.baseUrl ? `${this.baseUrl}/${key}` : key;
  }
}

/**
 * Helper function to create upload service instance
 */
export function createUploadService(env: Environment, request: Request): UploadService {
  // Generate base URL from request URL to ensure correct domain
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}/api/storage`;
  
  return new UploadService(env.STORAGE, baseUrl);
}
