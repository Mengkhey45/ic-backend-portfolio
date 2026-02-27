import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;

// Use SSL for production (Render/Supabase/etc)
const pool = new pg.Pool({ 
  connectionString,
  ssl: connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1") 
    ? false 
    : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
