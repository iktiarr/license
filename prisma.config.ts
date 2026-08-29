import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env.local if present (for local development)
config({ path: '.env.local' });
config(); // fallback to standard .env

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  'postgresql://dummy:dummy@localhost:5432/dummy';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
});
