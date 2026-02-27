import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables!");
} else {
  console.log("Initializing Prisma with DATABASE_URL (prefix):", connectionString.substring(0, 15) + "...");
}

// Use SSL for production (Render/Supabase/etc)
const pool = new pg.Pool({ 
  connectionString,
  ssl: (connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1")) 
    ? false 
    : { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
