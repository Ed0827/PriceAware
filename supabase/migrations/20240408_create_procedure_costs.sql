-- Drop existing procedure_costs table if it exists
DROP TABLE IF EXISTS public.procedure_costs;

-- Create procedure_costs table
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

-- Insert sample procedure costs (only for existing procedures and hospitals)
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