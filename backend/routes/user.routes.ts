import { Environment } from '@/types/common';
import { authService } from '@/services/auth.service';
import { orderService } from '@/services/order.service';
import { AuthRequest, RegisterRequest } from '@/types/auth';
import { createUploadService } from '@/utils/upload';

export const userRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // POST /api/users/register - Register new user
    if (method === 'POST' && segments.length === 3 && segments[2] === 'register') {
      const data: RegisterRequest = await request.json();
      const result = await authService.register(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/users/login - User login
    if (method === 'POST' && segments.length === 3 && segments[2] === 'login') {
      const data: AuthRequest = await request.json();
      const result = await authService.login(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/users/me - Get current user info
    if (method === 'GET' && segments.length === 3 && segments[2] === 'me') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data: user }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/users/me/orders - Get user's order history
    if (method === 'GET' && segments.length === 4 && segments[2] === 'me' && segments[3] === 'orders') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await orderService.getUserOrders(env, user.id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/users/me - Update user profile
    if (method === 'PUT' && segments.length === 3 && segments[2] === 'me') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await request.json() as { name?: string; phone?: string; address?: string };
      const { name, phone, address } = data;

      // Update user in database
      const now = new Date().toISOString();
      await env.DB.prepare(
        `UPDATE users SET name = ?, phone = ?, address = ?, updatedAt = ? WHERE id = ?`
      ).bind(name || user.name, phone || null, address || null, now, user.id).run();

      // Fetch updated user
      const updatedUser = await env.DB.prepare(
        `SELECT id, email, name, phone, address, avatarUrl, role, createdAt, updatedAt FROM users WHERE id = ?`
      ).bind(user.id).first();

      return new Response(JSON.stringify({ success: true, data: updatedUser }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/users/me/avatar - Upload avatar
    if (method === 'POST' && segments.length === 4 && segments[2] === 'me' && segments[3] === 'avatar') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        // Parse multipart form data
        const formData = await request.formData();
        const avatarFile = formData.get('avatar') as File;
        
        if (!avatarFile) {
          return new Response(JSON.stringify({ success: false, message: 'No file uploaded' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Upload to R2 using upload service
        const uploadService = createUploadService(env, request);
        const uploadResult = await uploadService.uploadFile(avatarFile, {
          folder: 'avatars',
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
          maxSize: 5 * 1024 * 1024, // 5MB
        });

        if (!uploadResult.success) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: uploadResult.message || 'Failed to upload avatar' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Delete old avatar from R2 if exists
        if (user.avatarUrl && user.avatarUrl.includes('avatars/')) {
          // Extract key from URL (handle both full URLs and keys)
          const oldKey = user.avatarUrl.includes('://') 
            ? user.avatarUrl.split('/').slice(-2).join('/')
            : user.avatarUrl;
          await uploadService.deleteFile(oldKey);
        }

        // Update user in database with new avatar URL
        const now = new Date().toISOString();
        await env.DB.prepare(
          `UPDATE users SET avatarUrl = ?, updatedAt = ? WHERE id = ?`
        ).bind(uploadResult.url, now, user.id).run();

        return new Response(JSON.stringify({ 
          success: true, 
          data: { avatarUrl: uploadResult.url } 
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        return new Response(JSON.stringify({ success: false, message: 'Failed to upload avatar' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in user router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};