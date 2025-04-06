-- Drop existing procedures table if it exists
DROP TABLE IF EXISTS public.procedures;

-- Create procedures table
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