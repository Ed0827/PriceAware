-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.procedure_coverage;
DROP TABLE IF EXISTS public.insurance_plans;
DROP TABLE IF EXISTS public.procedure_costs;
DROP TABLE IF EXISTS public.historical_procedure_costs;
DROP TABLE IF EXISTS public.procedures;
DROP TABLE IF EXISTS public.hospitals;

-- Create hospitals table
CREATE TABLE public.hospitals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    type TEXT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0,
    insurance TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create procedures table
CREATE TABLE public.procedures (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    recovery_time TEXT,
    success_rate DECIMAL(5,2),
    risks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create historical_procedure_costs table
CREATE TABLE public.historical_procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES public.procedures(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    average_cost DECIMAL(10,2) NOT NULL,
    min_cost DECIMAL(10,2),
    max_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(procedure_id, date)
);

-- Create procedure_costs table
CREATE TABLE public.procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES public.procedures(id) ON DELETE CASCADE,
    hospital_id INTEGER REFERENCES public.hospitals(id) ON DELETE CASCADE,
    average_cost DECIMAL(10,2) NOT NULL,
    min_cost DECIMAL(10,2),
    max_cost DECIMAL(10,2),
    out_of_pocket_cost DECIMAL(10,2),
    cost_trend TEXT,
    cost_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(procedure_id, hospital_id)
);

-- Create insurance_plans table
CREATE TABLE public.insurance_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    type TEXT NOT NULL,
    annual_premium DECIMAL(10,2) NOT NULL,
    deductible DECIMAL(10,2) NOT NULL,
    copay_percentage DECIMAL(5,2) NOT NULL,
    coverage_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, provider)
);

-- Create procedure_coverage table
CREATE TABLE public.procedure_coverage (
    id SERIAL PRIMARY KEY,
    insurance_plan_id INTEGER REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
    procedure_id INTEGER REFERENCES public.procedures(id) ON DELETE CASCADE,
    coverage_percentage DECIMAL(5,2) NOT NULL,
    prior_authorization_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(insurance_plan_id, procedure_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_hospitals_zip_code ON public.hospitals(zip_code);
CREATE INDEX idx_hospitals_insurance ON public.hospitals USING GIN(insurance);
CREATE INDEX idx_procedures_name ON public.procedures(name);
CREATE INDEX idx_procedures_category ON public.procedures(category);
CREATE INDEX idx_historical_costs_procedure_date ON public.historical_procedure_costs(procedure_id, date);
CREATE INDEX idx_procedure_costs_procedure_hospital ON public.procedure_costs(procedure_id, hospital_id);
CREATE INDEX idx_insurance_plans_provider ON public.insurance_plans(provider);
CREATE INDEX idx_procedure_coverage_insurance_procedure ON public.procedure_coverage(insurance_plan_id, procedure_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_hospitals_updated_at
    BEFORE UPDATE ON public.hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at
    BEFORE UPDATE ON public.procedures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historical_costs_updated_at
    BEFORE UPDATE ON public.historical_procedure_costs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_costs_updated_at
    BEFORE UPDATE ON public.procedure_costs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_plans_updated_at
    BEFORE UPDATE ON public.insurance_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_coverage_updated_at
    BEFORE UPDATE ON public.procedure_coverage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 