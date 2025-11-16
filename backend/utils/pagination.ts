export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
  message?: string;
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const encodeCursor = (id: string, createdAt: string): string => {
  return Buffer.from(JSON.stringify({ id, createdAt })).toString('base64');
};

export const decodeCursor = (cursor: string): { id: string; createdAt: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getLimit = (requestedLimit?: number): number => {
  if (!requestedLimit) return DEFAULT_PAGE_LIMIT;
  return Math.min(requestedLimit, MAX_PAGE_LIMIT);
};
