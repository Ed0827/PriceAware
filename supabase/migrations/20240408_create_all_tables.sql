-- Drop existing tables in correct order (reverse of creation)
DROP TABLE IF EXISTS public.historical_procedure_costs;
DROP TABLE IF EXISTS public.procedure_costs;
DROP TABLE IF EXISTS public.procedures;
DROP TABLE IF EXISTS public.hospitals;

-- Create hospitals table first (no dependencies)
CREATE TABLE public.hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    website TEXT,
    insurance TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample hospitals
INSERT INTO public.hospitals (name, address, city, state, zip_code, phone, website, insurance)
VALUES 
    ('University of Kansas Hospital', '4000 Cambridge St', 'Kansas City', 'KS', '66160', '913-588-5000', 'www.kuhospital.org', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Cigna']),
    ('AdventHealth Shawnee Mission', '9100 W 74th St', 'Overland Park', 'KS', '66204', '913-676-2000', 'www.adventhealth.com', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid']);

-- Create procedures table (no dependencies)
CREATE TABLE public.procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    recovery_time VARCHAR(100),
    success_rate VARCHAR(50),
    risks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample procedures
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Blood Test', 'Common diagnostic procedure to analyze blood components and detect various conditions', 'Laboratory', 'Immediate', '99%', 'Minimal risk: slight pain or bruising at needle site'),
    ('Chest X-Ray', 'Imaging test to examine the chest, lungs, heart, and blood vessels', 'Imaging', 'Immediate', '99%', 'Low radiation exposure'),
    ('COVID-19 Test', 'Test to detect the presence of SARS-CoV-2 virus', 'Laboratory', 'Immediate', '95%', 'Minimal risk: slight discomfort during sample collection'),
    ('Physical Therapy', 'Treatment to improve mobility, function, and manage pain', 'Therapy', 'Varies', '85%', 'Minimal risk: temporary muscle soreness'),
    ('Orthopedic Consultation', 'Medical evaluation of musculoskeletal conditions', 'Consultation', 'Immediate', 'N/A', 'Minimal risk: none'),
    ('MRI Scan', 'Detailed imaging of internal organs and structures', 'Imaging', 'Immediate', '99%', 'Low risk: may cause anxiety in claustrophobic patients'),
    ('Appendectomy', 'Surgical removal of the appendix', 'Surgery', '2-4 weeks', '98%', 'Infection, bleeding, damage to nearby organs'),
    ('Knee Arthroscopy', 'Minimally invasive procedure to diagnose and treat knee joint problems', 'Surgery', '4-6 weeks', '95%', 'Infection, blood clots, nerve damage'),
    ('Colonoscopy', 'Examination of the colon using a flexible tube with a camera', 'Endoscopy', '1-2 days', '99%', 'Low risk: rare complications may include bleeding or perforation');

-- Create procedure_costs table (depends on procedures and hospitals)
CREATE TABLE public.procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES public.procedures(id),
    hospital_id INTEGER REFERENCES public.hospitals(id),
    min_cost DECIMAL(10,2),
    max_cost DECIMAL(10,2),
    average_cost DECIMAL(10,2),
    insurance_coverage_percentage INTEGER,
    out_of_pocket_cost DECIMAL(10,2),
    cost_trend VARCHAR(50),
    cost_explanation TEXT,
    zip_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample procedure costs
INSERT INTO public.procedure_costs (procedure_id, hospital_id, min_cost, max_cost, average_cost, insurance_coverage_percentage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code)
VALUES 
    -- Blood Test (procedure_id: 1)
    (1, 1, 100.00, 300.00, 200.00, 80, 40.00, 'Stable', 'Standard laboratory procedure with consistent pricing', '66160'),
    (1, 2, 150.00, 350.00, 250.00, 75, 62.50, 'Stable', 'Standard laboratory procedure with consistent pricing', '66160'),
    
    -- Chest X-Ray (procedure_id: 2)
    (2, 1, 250.00, 450.00, 350.00, 80, 70.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    (2, 2, 300.00, 500.00, 400.00, 75, 100.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    
    -- COVID-19 Test (procedure_id: 3)
    (3, 1, 80.00, 150.00, 100.00, 80, 20.00, 'Decreasing', 'Widespread availability has led to lower costs', '66160'),
    (3, 2, 100.00, 180.00, 120.00, 75, 30.00, 'Decreasing', 'Widespread availability has led to lower costs', '66160'),
    
    -- Physical Therapy (procedure_id: 4)
    (4, 1, 100.00, 150.00, 120.00, 80, 24.00, 'Rising', 'Increased demand for physical therapy services', '66160'),
    (4, 2, 120.00, 180.00, 150.00, 75, 37.50, 'Rising', 'Increased demand for physical therapy services', '66160'),
    
    -- Orthopedic Consultation (procedure_id: 5)
    (5, 1, 150.00, 300.00, 200.00, 80, 40.00, 'Stable', 'Standard consultation fee with consistent pricing', '66160'),
    (5, 2, 200.00, 350.00, 250.00, 75, 62.50, 'Stable', 'Standard consultation fee with consistent pricing', '66160'),
    
    -- MRI Scan (procedure_id: 6)
    (6, 1, 1000.00, 1500.00, 1200.00, 80, 240.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    (6, 2, 1200.00, 1800.00, 1500.00, 75, 375.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    
    -- Appendectomy (procedure_id: 7)
    (7, 1, 12000.00, 18000.00, 15000.00, 80, 3000.00, 'Rising', 'Complex surgical procedure requiring specialized equipment and staff', '66160'),
    (7, 2, 15000.00, 22000.00, 18000.00, 75, 4500.00, 'Rising', 'Complex surgical procedure requiring specialized equipment and staff', '66160'),
    
    -- Knee Arthroscopy (procedure_id: 8)
    (8, 1, 7000.00, 10000.00, 8500.00, 80, 1700.00, 'Stable', 'Common orthopedic procedure with established pricing', '66160'),
    (8, 2, 8000.00, 12000.00, 10000.00, 75, 2500.00, 'Stable', 'Common orthopedic procedure with established pricing', '66160'),
    
    -- Colonoscopy (procedure_id: 9)
    (9, 1, 2500.00, 4000.00, 3200.00, 80, 640.00, 'Stable', 'Standard endoscopic procedure with consistent pricing', '66160'),
    (9, 2, 3000.00, 4500.00, 3750.00, 75, 937.50, 'Stable', 'Standard endoscopic procedure with consistent pricing', '66160');

-- Create historical_procedure_costs table (depends on procedures)
CREATE TABLE public.historical_procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES public.procedures(id),
    date DATE NOT NULL,
    average_cost DECIMAL(10,2) NOT NULL,
    cost_trend VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample historical data for Blood Test (procedure_id: 1)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (1, '2024-01-31', 200.00, 'Stable', '66160'),
    (1, '2024-02-29', 205.00, 'Rising', '66160'),
    (1, '2024-03-31', 210.00, 'Rising', '66160'),
    (1, '2024-04-30', 215.00, 'Stable', '66160'),
    (1, '2024-05-31', 220.00, 'Rising', '66160'),
    (1, '2024-06-30', 225.00, 'Rising', '66160'),
    (1, '2024-07-31', 230.00, 'Stable', '66160'),
    (1, '2024-08-31', 235.00, 'Rising', '66160'),
    (1, '2024-09-30', 240.00, 'Rising', '66160'),
    (1, '2024-10-31', 245.00, 'Stable', '66160'),
    (1, '2024-11-30', 250.00, 'Rising', '66160'),
    (1, '2024-12-31', 255.00, 'Rising', '66160'),
    (1, '2025-01-31', 260.00, 'Stable', '66160'),
    (1, '2025-02-28', 265.00, 'Rising', '66160'),
    (1, '2025-03-31', 270.00, 'Rising', '66160');

-- Insert sample historical data for Physical Therapy (procedure_id: 4)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (4, '2024-01-31', 120.00, 'Rising', '66160'),
    (4, '2024-02-29', 125.00, 'Rising', '66160'),
    (4, '2024-03-31', 130.00, 'Rising', '66160'),
    (4, '2024-04-30', 135.00, 'Stable', '66160'),
    (4, '2024-05-31', 140.00, 'Rising', '66160'),
    (4, '2024-06-30', 145.00, 'Rising', '66160'),
    (4, '2024-07-31', 150.00, 'Stable', '66160'),
    (4, '2024-08-31', 155.00, 'Rising', '66160'),
    (4, '2024-09-30', 160.00, 'Rising', '66160'),
    (4, '2024-10-31', 165.00, 'Stable', '66160'),
    (4, '2024-11-30', 170.00, 'Rising', '66160'),
    (4, '2024-12-31', 175.00, 'Rising', '66160'),
    (4, '2025-01-31', 180.00, 'Stable', '66160'),
    (4, '2025-02-28', 185.00, 'Rising', '66160'),
    (4, '2025-03-31', 190.00, 'Rising', '66160'); 