-- Ensure the PostgreSQL Extensions required for Eslami advanced analytics, 
-- cryptographic operations, and weighted full-text-search indexes are configured.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
