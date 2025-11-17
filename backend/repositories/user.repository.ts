import { eq, desc, lt, and, or } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { User, RegisterRequest } from '@/types/auth';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';
import { 
  CursorPaginationParams, 
  CursorPaginationResult,
  decodeCursor,
  encodeCursor,
  getLimit,
} from '@/utils/pagination';

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

  async getAll(
    env: Environment,
    pagination?: CursorPaginationParams,
  ): Promise<CursorPaginationResult<User>> {
    const db = getDb(env);
    const limit = getLimit(pagination?.limit) + 1;

    const conditions = [];
    
    if (pagination?.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      if (decoded) {
        conditions.push(
          or(
            lt(schema.users.createdAt, decoded.createdAt),
            and(
              eq(schema.users.createdAt, decoded.createdAt),
              lt(schema.users.id, typeof decoded.id === 'string' ? Number(decoded.id) : decoded.id)
            )
          )
        );
      }
    }

    const validConditions = conditions.filter(Boolean);
    const results = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        phone: schema.users.phone,
        address: schema.users.address,
        avatarUrl: schema.users.avatarUrl,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(validConditions.length > 0 ? and(...validConditions) : undefined)
      .orderBy(desc(schema.users.createdAt), desc(schema.users.id))
      .limit(limit);

    const hasMore = results.length > limit - 1;
    const data = hasMore ? results.slice(0, -1) : results;

    // Ensure id is string for User type
    const mappedData = data.map(user => ({
      ...user,
      id: String(user.id),
      phone: user.phone === null ? undefined : user.phone,
      address: user.address === null ? undefined : user.address,
      avatarUrl: user.avatarUrl === null ? undefined : user.avatarUrl,
    }));

    const nextCursor = hasMore && mappedData.length > 0
      ? encodeCursor(mappedData[mappedData.length - 1].id, mappedData[mappedData.length - 1].createdAt)
      : null;

    return {
      data: mappedData,
      nextCursor,
      hasMore,
    };
  },
};