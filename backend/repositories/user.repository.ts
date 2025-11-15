import { User, RegisterRequest } from '@/types/auth';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

export const userRepository = {
  async create(env: Environment, data: RegisterRequest): Promise<User> {
    const id = generateId();
    const now = getCurrentTimestamp();

    const user: User = {
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone,
      role: 'customer',
      createdAt: now,
      updatedAt: now,
    };

    await env.DB.prepare(
      'INSERT INTO users (id, email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        user.id,
        user.email,
        user.name,
        user.phone || null,
        await this.hashPassword(data.password),
        user.role,
        user.createdAt,
        user.updatedAt,
      )
      .run();

    return user;
  },

  async findByEmail(env: Environment, email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();

    return result as (User & { passwordHash: string }) | null;
  },

  async findById(env: Environment, id: string): Promise<User | null> {
    const result = await env.DB.prepare('SELECT id, email, name, phone, role, createdAt, updatedAt FROM users WHERE id = ?')
      .bind(id)
      .first();

    return result as User | null;
  },

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  },
};