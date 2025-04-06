-- First, ensure the procedures table exists and has the required data
CREATE TABLE IF NOT EXISTS procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    recovery_time VARCHAR(100),
    success_rate DECIMAL(5, 2),
    risks TEXT[]
);

-- Insert procedures if they don't exist
INSERT INTO procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Appendectomy', 'Surgical removal of the appendix', 'Surgery', '1-2 weeks', 98.5, ARRAY['Infection', 'Bleeding', 'Adverse reaction to anesthesia']),
    ('Colonoscopy', 'Examination of the colon using a flexible tube with a camera', 'Diagnostic', '1 day', 99.0, ARRAY['Bleeding', 'Perforation', 'Adverse reaction to sedation']),
    ('MRI Scan', 'Magnetic resonance imaging scan of the body', 'Diagnostic', 'None', 100.0, ARRAY['Claustrophobia', 'Contrast reaction']),
    ('X-Ray', 'Radiographic imaging of the body', 'Diagnostic', 'None', 100.0, ARRAY['Radiation exposure']),
    ('Ultrasound', 'Imaging using sound waves', 'Diagnostic', 'None', 100.0, ARRAY[]::TEXT[]),
    ('CT Scan', 'Computed tomography scan of the body', 'Diagnostic', 'None', 100.0, ARRAY['Radiation exposure', 'Contrast reaction'])
ON CONFLICT (name) DO NOTHING;

-- Drop existing table and indexes if they exist
DROP TABLE IF EXISTS historical_procedure_costs CASCADE;

-- Create historical_procedure_costs table
CREATE TABLE historical_procedure_costs (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES procedures(id),
    date DATE NOT NULL,
    average_cost DECIMAL(10, 2) NOT NULL,
    cost_trend DECIMAL(10, 2),
    zip_code VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_historical_costs_procedure_date ON historical_procedure_costs(procedure_id, date);
CREATE INDEX idx_historical_costs_zip ON historical_procedure_costs(zip_code);

-- Insert sample historical data for procedures
-- Appendectomy (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 15000 + (n * 200) + (random() * 1000 - 500)
        ELSE 17400 + ((n-12) * 250) + (random() * 1200 - 600)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 200
        ELSE 250
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'Appendectomy';

-- Colonoscopy (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 3000 + (n * 50) + (random() * 200 - 100)
        ELSE 3600 + ((n-12) * 75) + (random() * 300 - 150)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 50
        ELSE 75
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'Colonoscopy';

-- MRI Scan (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 2500 + (n * 100) + (random() * 400 - 200)
        ELSE 3700 + ((n-12) * 150) + (random() * 600 - 300)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 100
        ELSE 150
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'MRI Scan';

-- X-Ray (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 500 + (n * 20) + (random() * 100 - 50)
        ELSE 740 + ((n-12) * 25) + (random() * 150 - 75)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 20
        ELSE 25
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'X-Ray';

-- Ultrasound (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 800 + (n * 30) + (random() * 150 - 75)
        ELSE 1160 + ((n-12) * 40) + (random() * 200 - 100)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 30
        ELSE 40
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'Ultrasound';

-- CT Scan (24 months of data)
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE,
    CASE 
        WHEN n <= 12 THEN 1200 + (n * 60) + (random() * 300 - 150)
        ELSE 1920 + ((n-12) * 80) + (random() * 400 - 200)
    END as average_cost,
    CASE 
        WHEN n <= 12 THEN 60
        ELSE 80
    END as cost_trend,
    '10001'
FROM procedures p
CROSS JOIN generate_series(0, 23) n
WHERE p.name = 'CT Scan';

-- Add data for additional ZIP codes (10002, 10003) with slight variations
INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    procedure_id,
    date,
    average_cost * (1 + (random() * 0.2 - 0.1)), -- ±10% variation
    cost_trend,
    '10002'
FROM historical_procedure_costs
WHERE zip_code = '10001';

INSERT INTO historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    procedure_id,
    date,
    average_cost * (1 + (random() * 0.2 - 0.1)), -- ±10% variation
    cost_trend,
    '10003'
FROM historical_procedure_costs
WHERE zip_code = '10001'; 