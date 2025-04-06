-- Create insurance_plans table
CREATE TABLE IF NOT EXISTS public.insurance_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_name TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    annual_premium DECIMAL(10,2) NOT NULL,
    annual_deductible DECIMAL(10,2) NOT NULL,
    coinsurance_percentage INTEGER NOT NULL,
    copay_amount DECIMAL(10,2),
    out_of_pocket_max DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_name, plan_name)
);

-- Create procedure_coverage table to store coverage details for each procedure
CREATE TABLE IF NOT EXISTS public.procedure_coverage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insurance_plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
    procedure_id INTEGER REFERENCES public.procedures(id) ON DELETE CASCADE,
    coverage_percentage INTEGER NOT NULL,
    prior_authorization_required BOOLEAN DEFAULT false,
    network_status TEXT NOT NULL, -- 'in-network', 'out-of-network', 'both'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(insurance_plan_id, procedure_id)
);

-- Insert sample insurance plans
INSERT INTO public.insurance_plans (
    provider_name,
    plan_name,
    plan_type,
    annual_premium,
    annual_deductible,
    coinsurance_percentage,
    copay_amount,
    out_of_pocket_max
) VALUES
    ('Aetna', 'Open Choice PPO', 'PPO', 4800.00, 1000.00, 20, 25.00, 5000.00),
    ('Aetna', 'Select HMO', 'HMO', 3600.00, 500.00, 10, 15.00, 3000.00),
    ('Blue Cross Blue Shield', 'Blue PPO', 'PPO', 4200.00, 750.00, 15, 20.00, 4000.00),
    ('Blue Cross Blue Shield', 'Blue HMO', 'HMO', 3000.00, 250.00, 5, 10.00, 2500.00),
    ('Cigna', 'Open Access Plus', 'PPO', 4500.00, 1000.00, 20, 25.00, 4500.00),
    ('Cigna', 'LocalPlus', 'HMO', 3300.00, 500.00, 10, 15.00, 3000.00),
    ('UnitedHealthcare', 'Choice Plus', 'PPO', 5100.00, 1000.00, 20, 30.00, 5500.00),
    ('UnitedHealthcare', 'Navigate HMO', 'HMO', 3900.00, 500.00, 10, 20.00, 3500.00);

-- Insert sample procedure coverage data
WITH procedure_ids AS (
    SELECT id, name FROM public.procedures
),
insurance_plan_ids AS (
    SELECT id, provider_name, plan_name FROM public.insurance_plans
)
INSERT INTO public.procedure_coverage (
    insurance_plan_id,
    procedure_id,
    coverage_percentage,
    prior_authorization_required,
    network_status
)
SELECT 
    ip.id as insurance_plan_id,
    p.id as procedure_id,
    CASE 
        WHEN ip.plan_type = 'PPO' THEN 80
        ELSE 90
    END as coverage_percentage,
    CASE 
        WHEN p.name IN ('MRI Scan', 'CT Scan') THEN true
        ELSE false
    END as prior_authorization_required,
    CASE 
        WHEN ip.plan_type = 'PPO' THEN 'both'
        ELSE 'in-network'
    END as network_status
FROM insurance_plan_ids ip
CROSS JOIN procedure_ids p; 