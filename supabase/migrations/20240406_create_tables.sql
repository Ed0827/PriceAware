-- Create procedures table
CREATE TABLE IF NOT EXISTS public.procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recovery_time VARCHAR(100),
    success_rate VARCHAR(50),
    risks TEXT,
    cost DECIMAL(10,2),
    insurance_coverage DECIMAL(10,2),
    out_of_pocket_cost DECIMAL(10,2)
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    insurance TEXT[],
    distance VARCHAR(50)
);

-- Create procedure_costs table
CREATE TABLE IF NOT EXISTS public.procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_name VARCHAR(255) NOT NULL,
    average_cost DECIMAL(10,2),
    min_cost DECIMAL(10,2),
    max_cost DECIMAL(10,2),
    insurance_coverage DECIMAL(10,2),
    out_of_pocket_cost DECIMAL(10,2),
    cost_trend VARCHAR(50),
    cost_explanation TEXT,
    zip_code VARCHAR(20)
);

-- Insert sample data for procedures
INSERT INTO public.procedures (name, description, recovery_time, success_rate, risks, cost, insurance_coverage, out_of_pocket_cost)
VALUES 
    ('Appendectomy', 'Surgical removal of the appendix', '2-4 weeks', '98%', 'Infection, bleeding, damage to nearby organs', 15000, 12000, 3000),
    ('Knee Arthroscopy', 'Minimally invasive procedure to diagnose and treat knee joint problems', '4-6 weeks', '95%', 'Infection, blood clots, nerve damage', 8500, 6800, 1700);

-- Insert sample data for hospitals
INSERT INTO public.hospitals (name, address, zip_code, phone, insurance, distance)
VALUES 
    ('University of Kansas Hospital', '4000 Cambridge St, Kansas City, KS', '66160', '913-588-5000', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Cigna'], '0 miles'),
    ('AdventHealth Shawnee Mission', '9100 W 74th St, Overland Park, KS', '66204', '913-676-2000', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid'], '5.3 miles');

-- Insert sample data for procedure_costs
INSERT INTO public.procedure_costs (procedure_name, average_cost, min_cost, max_cost, insurance_coverage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code)
VALUES 
    ('Appendectomy', 14500, 12800, 18200, 11600, 2900, 'Stable', 'Standard procedure with consistent pricing', '66160'),
    ('Appendectomy', 15200, 13500, 19000, 12160, 3040, 'Rising', 'Higher costs due to specialization and equipment', '66204'); 