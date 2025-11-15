import { User, AuthRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import { Environment } from '@/types/common';
import { userRepository } from '@/repositories/user.repository';
import { validateEmail } from '@/utils/helpers';

export const authService = {
  async register(env: Environment, data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!data.email || !validateEmail(data.email)) {
        return {
          success: false,
          message: 'Invalid email format',
        };
      }

      if (!data.password || data.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters',
        };
      }

      if (!data.name || data.name.trim().length < 2) {
        return {
          success: false,
          message: 'Name must be at least 2 characters',
        };
      }

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(env, data.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      const user = await userRepository.create(env, data);
      const token = await this.generateJWT(user);

      return {
        success: true,
        user,
        token,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: 'Failed to register user',
      };
    }
  },

  async login(env: Environment, data: AuthRequest): Promise<AuthResponse> {
    try {
      if (!data.email || !validateEmail(data.email)) {
        return {
          success: false,
          message: 'Invalid email format',
        };
      }

      if (!data.password) {
        return {
          success: false,
          message: 'Password is required',
        };
      }

      const userWithPassword = await userRepository.findByEmail(env, data.email);
      if (!userWithPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      const isValidPassword = await userRepository.verifyPassword(data.password, userWithPassword.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...user } = userWithPassword;
      const token = await this.generateJWT(user);

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      return {
        success: false,
        message: 'Failed to login',
      };
    }
  },

  async verifyToken(env: Environment, token: string): Promise<User | null> {
    try {
      const payload = await this.verifyJWT(token);
      if (!payload || !payload.userId) {
        return null;
      }

      const user = await userRepository.findById(env, payload.userId);
      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  },

  async generateJWT(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
    
    const signature = await this.sign(`${encodedHeader}.${encodedPayload}`, 'your-secret-key');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  async verifyJWT(token: string): Promise<any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSignature = await this.sign(`${header}.${payload}`, 'your-secret-key');
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  },

  async sign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
  },
};