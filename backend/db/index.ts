import { drizzle } from 'drizzle-orm/d1';
import { Environment } from '@/types/common';
import * as schema from './schema';

export const getDb = (env: Environment) => {
  return drizzle(env.DB, { schema });
};

export { schema };
