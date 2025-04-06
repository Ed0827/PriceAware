-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.procedure_costs;
DROP TABLE IF EXISTS public.procedures;

-- Create procedures table with updated structure
CREATE TABLE IF NOT EXISTS public.procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    recovery_time VARCHAR(100),
    success_rate VARCHAR(50),
    risks TEXT
);

-- Create procedure_costs table with updated structure
CREATE TABLE IF NOT EXISTS public.procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES public.procedures(id),
    average_cost DECIMAL(10,2),
    min_cost DECIMAL(10,2),
    max_cost DECIMAL(10,2),
    insurance_coverage DECIMAL(10,2),
    out_of_pocket_cost DECIMAL(10,2),
    cost_trend VARCHAR(50),
    cost_explanation TEXT,
    zip_code VARCHAR(20)
);

-- Insert sample procedures
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Blood Test', 'Common diagnostic procedure to analyze blood components and detect various conditions', 'Laboratory', 'Immediate', '99%', 'Minimal risk: slight pain or bruising at needle site'),
    ('Chest X-Ray', 'Imaging test to examine the chest, lungs, heart, and blood vessels', 'Imaging', 'Immediate', '99%', 'Low radiation exposure'),
    ('COVID-19 Test', 'Test to detect the presence of SARS-CoV-2 virus', 'Laboratory', 'Immediate', '95%', 'Minimal risk: slight discomfort during sample collection'),
    ('Flu Test', 'Test to detect influenza virus infection', 'Laboratory', 'Immediate', '95%', 'Minimal risk: slight discomfort during sample collection'),
    ('Strep Throat Test', 'Test to detect streptococcal bacteria in the throat', 'Laboratory', 'Immediate', '98%', 'Minimal risk: slight discomfort during sample collection'),
    ('Physical Therapy', 'Treatment to improve mobility, function, and manage pain', 'Therapy', 'Varies', '85%', 'Minimal risk: temporary muscle soreness'),
    ('Orthopedic Consultation', 'Medical evaluation of musculoskeletal conditions', 'Consultation', 'Immediate', 'N/A', 'Minimal risk: none'),
    ('MRI Scan', 'Detailed imaging of internal organs and structures', 'Imaging', 'Immediate', '99%', 'Low risk: may cause anxiety in claustrophobic patients'),
    ('Ultrasound', 'Imaging using sound waves to create pictures of internal structures', 'Imaging', 'Immediate', '99%', 'No known risks'),
    ('EKG', 'Test to measure electrical activity of the heart', 'Cardiac', 'Immediate', '99%', 'No known risks'),
    ('Colonoscopy', 'Examination of the colon using a flexible tube with a camera', 'Endoscopy', '1-2 days', '99%', 'Low risk: rare complications may include bleeding or perforation');

-- Insert sample procedure costs
INSERT INTO public.procedure_costs (procedure_id, average_cost, min_cost, max_cost, insurance_coverage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code)
VALUES 
    (1, 150.00, 100.00, 200.00, 120.00, 30.00, 'Stable', 'Standard laboratory procedure with consistent pricing', '66160'),
    (2, 350.00, 250.00, 450.00, 280.00, 70.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    (3, 100.00, 80.00, 150.00, 80.00, 20.00, 'Decreasing', 'Widespread availability has led to lower costs', '66160'),
    (4, 80.00, 60.00, 120.00, 64.00, 16.00, 'Stable', 'Standard diagnostic test with consistent pricing', '66160'),
    (5, 90.00, 70.00, 130.00, 72.00, 18.00, 'Stable', 'Common diagnostic test with established pricing', '66160'),
    (6, 120.00, 100.00, 150.00, 96.00, 24.00, 'Rising', 'Increased demand for physical therapy services', '66160'),
    (7, 200.00, 150.00, 300.00, 160.00, 40.00, 'Stable', 'Standard consultation fee with consistent pricing', '66160'),
    (8, 1200.00, 1000.00, 1500.00, 960.00, 240.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    (9, 300.00, 250.00, 400.00, 240.00, 60.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    (10, 250.00, 200.00, 350.00, 200.00, 50.00, 'Stable', 'Standard cardiac test with consistent pricing', '66160'),
    (11, 2500.00, 2000.00, 3000.00, 2000.00, 500.00, 'Rising', 'Complex procedure requiring specialized equipment and staff', '66160'); 