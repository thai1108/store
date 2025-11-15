export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Environment {
  IMAGES_BUCKET: R2Bucket;
  ORDER_CACHE: KVNamespace;
  DB: D1Database;
  ENVIRONMENT: string;
}