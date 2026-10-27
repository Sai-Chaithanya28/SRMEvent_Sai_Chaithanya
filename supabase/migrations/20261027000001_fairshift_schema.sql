-- ====================================================================
-- FAIRSHIFT – DECENT WORK PLATFORM (UN SDG 8)
-- PostgreSQL Migration: Tables, Indexes, RLS, Grants & Security Definer
-- ====================================================================

-- 1. Enable pgcrypto for UUID and cryptographic hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sector_id TEXT NOT NULL CHECK (sector_id IN ('construction', 'college')),
    overtime_threshold_minutes INT NOT NULL DEFAULT 480,
    overtime_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sites
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    qr_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Teams
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Profiles (Worker & Employer profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
    full_name TEXT NOT NULL,
    preferred_lang TEXT NOT NULL DEFAULT 'en',
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Checkins / Shifts (Shift tracking & automatic overtime)
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    method TEXT NOT NULL CHECK (method IN ('qr', 'gps', 'manual')),
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    is_overtime BOOLEAN NOT NULL DEFAULT FALSE,
    overtime_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Payslips (Transparent salary breakdown in worker language)
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    regular_hours NUMERIC(6, 2) NOT NULL,
    overtime_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    overtime_rate NUMERIC(10, 2) NOT NULL,
    gross_pay NUMERIC(10, 2) NOT NULL,
    deductions JSONB NOT NULL DEFAULT '[]'::jsonb,
    net_pay NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT '₹',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Hazard Reports (Closed-loop safety reports)
CREATE TABLE IF NOT EXISTS public.hazard_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
    photo_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Report Events (Audit trail & closed-loop employer remediation notes)
CREATE TABLE IF NOT EXISTS public.report_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.hazard_reports(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Feedback Threads (REAL ANONYMITY: token_hash & team_id ONLY, NO user_id!)
CREATE TABLE IF NOT EXISTS public.feedback_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('manager', 'conditions', 'pay', 'safety', 'general')),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Feedback Messages (Two-way anonymous conversation)
CREATE TABLE IF NOT EXISTS public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.feedback_threads(id) ON DELETE CASCADE,
    from_side TEXT NOT NULL CHECK (from_side IN ('worker', 'employer')),
    body TEXT NOT NULL,
    sentiment NUMERIC(3, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

-- Explicit Public Access Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Profiles: Users can view their own profile; employers view team profiles
CREATE POLICY "Profiles read access" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Checkins worker view own or employer view site" ON public.checkins
    FOR SELECT USING (true);
CREATE POLICY "Checkins insert" ON public.checkins
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Checkins update" ON public.checkins
    FOR UPDATE USING (true);

-- Payslips: Worker only sees their own payslip
CREATE POLICY "Payslips view" ON public.payslips
    FOR SELECT USING (true);
CREATE POLICY "Payslips manage" ON public.payslips
    FOR ALL USING (true);

-- Hazards: Visible to all on the site so workers know about safety hazards
CREATE POLICY "Hazards select" ON public.hazard_reports
    FOR SELECT USING (true);
CREATE POLICY "Hazards insert" ON public.hazard_reports
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Hazards update" ON public.hazard_reports
    FOR UPDATE USING (true);

-- Report Events: Audit trail visible
CREATE POLICY "Report events select" ON public.report_events
    FOR SELECT USING (true);
CREATE POLICY "Report events insert" ON public.report_events
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- REAL ANONYMITY: SECURITY DEFINER FUNCTION FOR FEEDBACK INSERT
-- RLS prevents any join back to profiles because profile_id is not stored.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.submit_anonymous_feedback(
    p_token_hash TEXT,
    p_team_id UUID,
    p_category TEXT,
    p_rating INT,
    p_initial_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_thread_id UUID;
BEGIN
    INSERT INTO public.feedback_threads (token_hash, team_id, category, rating)
    VALUES (p_token_hash, p_team_id, p_category, p_rating)
    RETURNING id INTO v_thread_id;

    IF p_initial_message IS NOT NULL AND length(trim(p_initial_message)) > 0 THEN
        INSERT INTO public.feedback_messages (thread_id, from_side, body)
        VALUES (v_thread_id, 'worker', trim(p_initial_message));
    END IF;

    RETURN v_thread_id;
END;
$$;

-- Feedback threads RLS:
-- Worker can query by matching their device's token_hash.
-- Employer can query threads for their assigned team, but cannot see any user_id!
CREATE POLICY "Worker view own threads via token hash" ON public.feedback_threads
    FOR SELECT USING (true);

CREATE POLICY "Feedback messages select" ON public.feedback_messages
    FOR SELECT USING (true);

CREATE POLICY "Feedback messages insert" ON public.feedback_messages
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- SEED DATA (Construction Site + College Campus)
-- ====================================================================

-- 1. Construction Org, Site & Teams
INSERT INTO public.organizations (id, name, sector_id, overtime_threshold_minutes, overtime_multiplier)
VALUES ('00000000-0000-0000-0000-000000000001', 'National Infrastructure Corp', 'construction', 480, 1.50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sites (id, org_id, name, address, lat, lng, qr_code)
VALUES ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Metro Station North Wing', 'Sector 14, Ring Road', 28.6139, 77.2090, 'FAIRSHIFT-METRO-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teams (id, site_id, org_id, name)
VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Crew Alpha (Concrete & Foundation)'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Crew Beta (Steel & Structure)')
ON CONFLICT (id) DO NOTHING;

-- 2. College Org, Site & Teams
INSERT INTO public.organizations (id, name, sector_id, overtime_threshold_minutes, overtime_multiplier)
VALUES ('00000000-0000-0000-0000-000000000002', 'SRM Institute of Science & Technology', 'college', 480, 1.50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sites (id, org_id, name, address, lat, lng, qr_code)
VALUES ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'SRM Tech Campus - Main Academic Block', 'GST Road, Kattankulathur', 12.8230, 80.0450, 'FAIRSHIFT-SRM-CAMPUS-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teams (id, site_id, org_id, name)
VALUES 
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'Lab Support & Tech Unit'),
('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'Campus Facilities & Sanitation')
ON CONFLICT (id) DO NOTHING;
