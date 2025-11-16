import { Environment } from '@/types/common';
import { authService } from '@/services/auth.service';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateRequest(
  request: Request,
  env: Environment
): Promise<{ 
  authenticated: boolean; 
  userId?: string; 
  user?: { id: string; email: string; role: string }; 
  error?: string 
}> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'No authorization token provided',
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const user = await authService.verifyToken(env, token);
    
    if (!user) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed',
    };
  }
}

export function createUnauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
