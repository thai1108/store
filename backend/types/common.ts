export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Environment {
  STORAGE: R2Bucket;
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
}