-- ==============================================================================
--  ESLAMI GLOBAL TRADING - POSTGRESQL ENTERPRISE MIGRATION DDL INITIATION
--  Migration ID: 20260522000000_enterprise_init
-- ==============================================================================

-- Enable Core Extensions for Typo Tolerance (trigram) & UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
--  1. ENUMERATED TYPES DEFINITIONS
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'GLOBAL_ADMIN', 
            'TRADE_BROKER', 
            'LOGISTICS_OFFICER', 
            'REGISTERED_CLIENT', 
            'COMPLIANCE_AUDITOR'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider') THEN
        CREATE TYPE storage_provider AS ENUM (
            'LOCAL_DISK', 
            'AWS_S3', 
            'CLOUDFLARE_R2', 
            'GOOGLE_CLOUD_STORAGE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'optimization_status') THEN
        CREATE TYPE optimization_status AS ENUM (
            'PENDING', 
            'PROCESSING', 
            'OPTIMIZED', 
            'FAILED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_state') THEN
        CREATE TYPE publish_state AS ENUM (
            'DRAFT', 
            'PENDING_COMPLIANCE', 
            'PUBLISHED', 
            'ARCHIVED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM (
            'LOW', 
            'MEDIUM', 
            'HIGH', 
            'URGENT'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customs_workflow_stage') THEN
        CREATE TYPE customs_workflow_stage AS ENUM (
            'INITIATED', 
            'DOCUMENT_VERIFICATION', 
            'TARIFF_EVALUATION', 
            'CUSTOMS_SUBMISSION', 
            'PASSED', 
            'SUSPENDED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rfq_status') THEN
        CREATE TYPE rfq_status AS ENUM (
            'SUBMITTED', 
            'UNDER_REVIEW', 
            'QUOTED', 
            'NEGOTIATING', 
            'CONCLUDED', 
            'CANCELLED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_state') THEN
        CREATE TYPE verification_state AS ENUM (
            'PENDING_UPLOAD', 
            'UNDER_REVIEW', 
            'APPROVED', 
            'REJECTED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM (
            'QUEUED', 
            'RUNNING', 
            'COMPLETED', 
            'FAILED'
        );
    END IF;
END $$;

-- ==========================================
--  2. RELATIONAL TABLES INITIATION (CORE DROME)
-- ==========================================

-- A. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone_number VARCHAR(100),
    role user_role DEFAULT 'REGISTERED_CLIENT' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_backup_codes JSONB,
    
    login_attempts_limit INT DEFAULT 5 NOT NULL,
    failed_login_attempts INT DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_password_change_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_fingerprint_hash VARCHAR(255),
    last_ip_address VARCHAR(150),
    ip_reputation_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),
    archived_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- B. Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_provider storage_provider DEFAULT 'LOCAL_DISK' NOT NULL,
    bucket_name VARCHAR(255),
    object_key VARCHAR(512) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    extension VARCHAR(50) NOT NULL,
    checksum_sha256 CHAR(64),
    file_size INT NOT NULL,
    width INT,
    height INT,
    
    alt_en VARCHAR(255),
    alt_fa VARCHAR(255),
    alt_ar VARCHAR(255),
    alt_zh VARCHAR(255),
    
    optimization_status optimization_status DEFAULT 'PENDING' NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_object_key ON media_files(object_key);
CREATE INDEX IF NOT EXISTS idx_media_deleted_at ON media_files(deleted_at);

-- C. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_fa VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    name_zh VARCHAR(255),
    
    description_en TEXT NOT NULL,
    description_fa TEXT NOT NULL,
    description_ar TEXT,
    description_zh TEXT,
    
    slug_en VARCHAR(255) UNIQUE NOT NULL,
    slug_fa VARCHAR(255) UNIQUE NOT NULL,
    slug_ar VARCHAR(255) UNIQUE,
    slug_zh VARCHAR(255) UNIQUE,
    
    canonical_url_en VARCHAR(512),
    canonical_url_fa VARCHAR(512),
    
    thumbnail_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    
    price_range_min DECIMAL(12, 2) NOT NULL,
    price_range_max DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    unit VARCHAR(100) NOT NULL,
    hs_code VARCHAR(100) NOT NULL,
    origin_en VARCHAR(255) NOT NULL,
    origin_fa VARCHAR(255) NOT NULL,
    min_order_quantity DECIMAL(12, 2) NOT NULL,
    lead_time_days INT NOT NULL,
    
    categories VARCHAR(150)[] NOT NULL,
    purity_grade_en VARCHAR(255),
    purity_grade_fa VARCHAR(255),
    packaging_details_en TEXT,
    packaging_details_fa TEXT,
    technical_specs JSONB NOT NULL,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
-- Trigrams mapping for fuzzy searching names
CREATE INDEX IF NOT EXISTS idx_products_name_en_trgm ON products USING gin(name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_fa_trgm ON products USING gin(name_fa gin_trgm_ops);

-- Many-to-Many Bridge Product <> Media
CREATE TABLE IF NOT EXISTS _product_media_images (
    A UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    B UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    PRIMARY KEY (A, B)
);
CREATE INDEX IF NOT EXISTS idx_product_media_b ON _product_media_images(B);

-- D. CMS Blog Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status publish_state DEFAULT 'DRAFT' NOT NULL,
    
    title_en VARCHAR(255) NOT NULL,
    title_fa VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    title_zh VARCHAR(255),
    
    slug_en VARCHAR(255) UNIQUE NOT NULL,
    slug_fa VARCHAR(255) UNIQUE NOT NULL,
    slug_ar VARCHAR(255) UNIQUE,
    slug_zh VARCHAR(255) UNIQUE,
    
    content_en TEXT NOT NULL,
    content_fa TEXT NOT NULL,
    content_ar TEXT,
    content_zh TEXT,
    
    seo_title_en VARCHAR(255),
    seo_title_fa VARCHAR(255),
    seo_desc_en VARCHAR(512),
    seo_desc_fa VARCHAR(512),
    og_image_en VARCHAR(512),
    og_image_fa VARCHAR(512),
    hreflang_tags JSONB,
    
    featured_image_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    tags VARCHAR(100)[] NOT NULL,
    views_count INT DEFAULT 0 NOT NULL,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Many-to-Many Bridge Post <> Media
CREATE TABLE IF NOT EXISTS _post_media_images (
    A UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    B UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    PRIMARY KEY (A, B)
);
CREATE INDEX IF NOT EXISTS idx_post_media_b ON _post_media_images(B);

-- E. Content Versions Layout (Audit Rollback Snapshot Engine)
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- "Post", "Product"
    entity_id UUID NOT NULL,
    version_number INT NOT NULL,
    snapshot JSONB NOT NULL,
    comment VARCHAR(255),
    edited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (entity_type, entity_id, version_number)
);

-- F. RFQ Cargo Tables
CREATE TABLE IF NOT EXISTS rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(100) UNIQUE NOT NULL,
    status rfq_status DEFAULT 'SUBMITTED' NOT NULL,
    priority_level priority_level DEFAULT 'MEDIUM' NOT NULL,
    customs_stage customs_workflow_stage DEFAULT 'INITIATED' NOT NULL,
    
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    broker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    incoterm VARCHAR(20) NOT NULL,
    destination_port VARCHAR(255) NOT NULL,
    discharge_country VARCHAR(150) NOT NULL,
    target_delivery_date DATE,
    payment_terms VARCHAR(255),
    internal_notes TEXT,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_rfqs_number ON rfqs(rfq_number);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deleted_at ON rfqs(deleted_at);

CREATE TABLE IF NOT EXISTS rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    target_quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    purity_grade_value VARCHAR(255),
    packaging_request TEXT
);

CREATE TABLE IF NOT EXISTS quotation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    quoted_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    freight_terms VARCHAR(255) NOT NULL,
    compliance_notes TEXT,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (rfq_id, version_number)
);

CREATE TABLE IF NOT EXISTS negotiation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS rfq_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    document_type VARCHAR(150) NOT NULL,
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    verification_state verification_state DEFAULT 'PENDING_UPLOAD' NOT NULL,
    verifier_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- G. API Keys & Webhooks Routing
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    token_hash CHAR(64) UNIQUE NOT NULL, -- SHA-256 Hex Digest
    scopes VARCHAR(150)[] NOT NULL,
    rate_limit_rpc INT DEFAULT 60 NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_url TEXT NOT NULL,
    signing_key VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    events VARCHAR(150)[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- H. Async Job Queues Schema
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_name VARCHAR(100) DEFAULT 'default' NOT NULL,
    payload JSONB NOT NULL,
    status job_status DEFAULT 'QUEUED' NOT NULL,
    attempts INT DEFAULT 0 NOT NULL,
    max_attempts INT DEFAULT 3 NOT NULL,
    priority INT DEFAULT 0 NOT NULL,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_processing ON jobs(status, run_at);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    failed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    error TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name VARCHAR(255) UNIQUE NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE NOT NULL
);

-- ==============================================================================
--  3. HIGH-SCALE INTENSE DATAFALLS: TIMESCALED TIME RANGE PARTITIONED ARCHITECTURES
-- ==============================================================================

-- A. Audit Events (Partitioned by Year/Quarter Range)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    action_type VARCHAR(100) NOT NULL,
    actor_id UUID,
    before_state JSONB,
    after_state JSONB,
    correlation_id UUID NOT NULL,
    request_id VARCHAR(255),
    ip_address VARCHAR(150),
    user_agent VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Creating physical Range Partition Slabs for next 5 years (Dynamic range allocation in production)
CREATE TABLE IF NOT EXISTS audit_events_y2025 PARTITION OF audit_events
    FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_events_y2026 PARTITION OF audit_events
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_events_y2027 PARTITION OF audit_events
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_events_y2028 PARTITION OF audit_events
    FOR VALUES FROM ('2028-01-01 00:00:00+00') TO ('2029-01-01 00:00:00+00');

CREATE INDEX IF NOT EXISTS idx_audit_meta ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_events(correlation_id);


-- B. Analytics Sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_hash VARCHAR(255) NOT NULL,
    visitor_ip VARCHAR(150),
    user_agent VARCHAR(255),
    device_type VARCHAR(50),
    country_code VARCHAR(10),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON analytics_sessions(fingerprint_hash);

-- C. Analytics Events (Partitioned by Quarter Range)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid(),
    sessionId UUID NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    category VARCHAR(150) NOT NULL,
    url_path VARCHAR(512) NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Range Slabs setup for Analytics
CREATE TABLE IF NOT EXISTS analytics_events_2026_q1 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS analytics_events_2026_q2 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS analytics_events_2026_q3 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS analytics_events_2026_q4 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);


-- ==============================================================================
--  4. ENTERPRISE MULTILINGUAL ADVANCED SEARCH ENGINE (TSVECTOR TRIGGERS)
-- ==============================================================================

-- A. Add Dedicated tsvector Columns for Weighted GIN High-Performance Searches
ALTER TABLE products ADD COLUMN IF NOT EXISTS textsearch_en_vector tsvector;
ALTER TABLE products ADD COLUMN IF NOT EXISTS textsearch_fa_vector tsvector;

-- B. Create Search Vector Sync Generator Triggers
CREATE OR REPLACE FUNCTION sync_products_search_vectors() RETURNS trigger AS $$
BEGIN
    NEW.textsearch_en_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name_en, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.origin_en, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description_en, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.purity_grade_en, '')), 'D');
        
    -- Persian/Arabic standard fallback dictionaries
    NEW.textsearch_fa_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.name_fa, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.origin_fa, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.description_fa, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(NEW.purity_grade_fa, '')), 'D');
        
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_vector_update ON products;
CREATE TRIGGER trigger_products_vector_update
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION sync_products_search_vectors();

-- C. Apply GIN Fast Search Indexes over vectors
CREATE INDEX IF NOT EXISTS idx_products_search_en ON products USING gin(textsearch_en_vector);
CREATE INDEX IF NOT EXISTS idx_products_search_fa ON products USING gin(textsearch_fa_vector);


-- D. Repeat Search Optimization over blog Content
ALTER TABLE posts ADD COLUMN IF NOT EXISTS textsearch_en_vector tsvector;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS textsearch_fa_vector tsvector;

CREATE OR REPLACE FUNCTION sync_posts_search_vectors() RETURNS trigger AS $$
BEGIN
    NEW.textsearch_en_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title_en, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.content_en, '')), 'C');
        
    NEW.textsearch_fa_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.title_fa, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.content_fa, '')), 'C');
        
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_posts_vector_update ON posts;
CREATE TRIGGER trigger_posts_vector_update
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION sync_posts_search_vectors();

CREATE INDEX IF NOT EXISTS idx_posts_search_en ON posts USING gin(textsearch_en_vector);
CREATE INDEX IF NOT EXISTS idx_posts_search_fa ON posts USING gin(textsearch_fa_vector);


-- ==============================================================================
--  5. DATABASE PERFORMANCE MATERIALIZED VIEWS
-- ==============================================================================

-- Create high-speed Materialized view for dashboard telemetry aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_broker_rfq_telemetry AS
SELECT 
    r.broker_id,
    u.full_name AS broker_name,
    COUNT(r.id) FILTER (WHERE r.status = 'UNDER_REVIEW') AS pending_reviews,
    COUNT(r.id) FILTER (WHERE r.status = 'QUOTED') AS active_quotations,
    COUNT(r.id) FILTER (WHERE r.status = 'CONCLUDED') AS closed_deals,
    AVG(EXTRACT(EPOCH FROM (q.created_at - r.created_at))/3600)::numeric(10,2) AS avg_turnaround_hours
FROM rfqs r
LEFT JOIN users u ON r.broker_id = u.id
LEFT JOIN LATERAL (
    SELECT MIN(created_at) AS created_at FROM quotation_history q WHERE q.rfq_id = r.id
) q ON TRUE
WHERE r.deleted_at IS NULL
GROUP BY r.broker_id, u.full_name;

-- Unique Index to support CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_broker_rfq ON mv_broker_rfq_telemetry(broker_id);


-- ==============================================================================
--  6. SECURITY COMPLIANCE RULES: ROW LEVEL SECURITY (RLS) BLUEPRINTS
-- ==============================================================================

-- Enable Row-Level Security on tables tracking enterprise client context
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_history ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Registered Client can only see their own records
DROP POLICY IF EXISTS rfq_client_isolation_policy ON rfqs;
CREATE POLICY rfq_client_isolation_policy ON rfqs
    FOR ALL
    TO public
    USING (
        -- If actor is client, enforce email/id identity mapping
        (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'REGISTERED_CLIENT' 
        AND client_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- Administrative staff bypass constraints
        (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) IN ('GLOBAL_ADMIN', 'TRADE_BROKER', 'LOGISTICS_OFFICER', 'COMPLIANCE_AUDITOR')
    );
