/**
 * Rate Limiting Middleware
 * Chống DDOS và spam API bằng cách giới hạn số request từ 1 IP trong khoảng thời gian
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store cho rate limiting (sẽ persist trong Cloudflare Worker)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number; // Số request tối đa
  windowMs: number; // Thời gian window (milliseconds)
  message?: string; // Message khi bị rate limit
}

// Cleanup expired entries định kỳ
// setInterval(() => {
//   const now = Date.now();
//   for (const [key, entry] of rateLimitStore.entries()) {
//     if (now > entry.resetTime) {
//       rateLimitStore.delete(key);
//     }
//   }
// }, 60000); // Cleanup mỗi phút

/**
 * Get client identifier từ request
 */
function getClientId(request: Request): string {
  // Lấy IP từ Cloudflare headers
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp) return cfConnectingIp;

  // Fallback: X-Forwarded-For
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  // Fallback: X-Real-IP
  const xRealIp = request.headers.get('X-Real-IP');
  if (xRealIp) return xRealIp;

  return 'unknown';
}

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const { maxRequests, windowMs, message = 'Too many requests, please try again later.' } = config;

  return async (request: Request): Promise<Response | null> => {
    const clientId = getClientId(request);
    const now = Date.now();
    const key = clientId;

    let entry = rateLimitStore.get(key);

    // Nếu entry không tồn tại hoặc đã hết hạn, tạo mới
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
      return null; // Allow request
    }

    // Tăng count
    entry.count++;

    // Check nếu vượt limit
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return new Response(
        JSON.stringify({
          success: false,
          message,
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      );
    }

    // Update entry
    rateLimitStore.set(key, entry);

    // Allow request, return null
    return null;
  };
}

/**
 * Các preset rate limit configs
 */
export const rateLimitConfigs = {
  // Strict: Cho endpoints nhạy cảm (login, register)
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests/phút
    message: 'Too many attempts. Please wait a moment before trying again.',
  },

  // Moderate: Cho endpoints thông thường (products, orders)
  moderate: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests/phút
    message: 'Too many requests. Please slow down.',
  },

  // Relaxed: Cho endpoints public (health check)
  relaxed: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1000 requests/phút
    message: 'Rate limit exceeded.',
  },

  // Admin: Cho admin endpoints
  admin: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 requests/phút
    message: 'Admin rate limit exceeded.',
  },
};

/**
 * Apply rate limit với config
 */
export async function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const limiter = rateLimit(config);
  return await limiter(request);
}
