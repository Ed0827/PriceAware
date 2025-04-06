-- Insert sample hospitals
INSERT INTO public.hospitals (name, address, city, state, zip_code, phone, website, type, rating, insurance)
VALUES
    ('Kansas City General Hospital', '1234 Hospital Blvd', 'Kansas City', 'MO', '64111', '816-555-1234', 'https://www.kcgeneral.com', 'General', 4.2, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth']),
    ('Saint Luke''s Medical Center', '4321 Health Parkway', 'Kansas City', 'MO', '64112', '816-555-5678', 'https://www.saintlukes.org', 'General', 4.5, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana']),
    ('Research Medical Center', '2316 E Meyer Blvd', 'Kansas City', 'MO', '64132', '816-555-9012', 'https://www.researchmedicalcenter.com', 'General', 4.0, ARRAY['Aetna', 'Blue Cross', 'Cigna']),
    ('Overland Park Regional Medical Center', '10500 Quivira Rd', 'Overland Park', 'KS', '66215', '913-555-3456', 'https://www.overlandparkregional.com', 'General', 4.3, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana']),
    ('North Kansas City Hospital', '2800 Clay Edwards Dr', 'North Kansas City', 'MO', '64116', '816-555-7890', 'https://www.nkch.org', 'General', 4.1, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth']),
    ('Menorah Medical Center', '5721 W 119th St', 'Overland Park', 'KS', '66209', '913-555-2345', 'https://www.menorahmedical.com', 'General', 4.4, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana']),
    ('Truman Medical Center', '2301 Holmes St', 'Kansas City', 'MO', '64108', '816-555-6789', 'https://www.trumanmedicalcenter.org', 'General', 3.9, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth']),
    ('Providence Medical Center', '8929 Parallel Pkwy', 'Kansas City', 'KS', '66112', '913-555-0123', 'https://www.providencemedicalcenter.com', 'General', 4.0, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth']),
    ('Lee''s Summit Medical Center', '2100 SE Blue Pkwy', 'Lee''s Summit', 'MO', '64063', '816-555-4567', 'https://www.leessummitmedicalcenter.com', 'General', 4.2, ARRAY['Aetna', 'Blue Cross', 'Cigna']),
    ('Shawnee Mission Medical Center', '9100 W 74th St', 'Shawnee Mission', 'KS', '66204', '913-555-8901', 'https://www.shawneemission.org', 'General', 4.3, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana']);

-- Insert sample procedures
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES
    ('Appendectomy', 'Surgical removal of the appendix', 'Surgery', '1-2 weeks', 99.5, ARRAY['Infection', 'Bleeding', 'Adverse reaction to anesthesia']),
    ('Colonoscopy', 'Examination of the colon using a flexible tube with a camera', 'Diagnostic', '1 day', 99.8, ARRAY['Perforation', 'Bleeding', 'Adverse reaction to sedation']),
    ('MRI Scan', 'Magnetic resonance imaging to create detailed images of internal organs', 'Diagnostic', 'None', 99.9, ARRAY['Claustrophobia', 'Contrast dye reaction']),
    ('X-Ray', 'Imaging test that uses radiation to create pictures of bones and internal organs', 'Diagnostic', 'None', 99.9, ARRAY['Minimal radiation exposure']),
    ('Ultrasound', 'Imaging test that uses sound waves to create pictures of internal organs', 'Diagnostic', 'None', 99.9, ARRAY['None']),
    ('CT Scan', 'Computed tomography scan that creates detailed cross-sectional images', 'Diagnostic', 'None', 99.9, ARRAY['Radiation exposure', 'Contrast dye reaction']),
    ('Flu Test', 'Test to detect influenza virus in respiratory specimens', 'Diagnostic', 'None', 99.0, ARRAY['None']),
    ('Knee Replacement', 'Surgical procedure to replace a damaged knee joint with an artificial one', 'Surgery', '6-12 weeks', 98.0, ARRAY['Infection', 'Blood clots', 'Nerve damage', 'Stiffness']),
    ('Hip Replacement', 'Surgical procedure to replace a damaged hip joint with an artificial one', 'Surgery', '6-12 weeks', 98.5, ARRAY['Infection', 'Blood clots', 'Nerve damage', 'Leg length discrepancy']),
    ('Cataract Surgery', 'Surgical procedure to remove a cloudy lens and replace it with an artificial one', 'Surgery', '1-2 weeks', 99.0, ARRAY['Infection', 'Bleeding', 'Retinal detachment']);

-- Insert sample historical procedure costs
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, min_cost, max_cost)
SELECT 
    p.id,
    date_series.date,
    base_cost + (random() * 1000)::DECIMAL(10,2),
    base_cost + (random() * 500)::DECIMAL(10,2),
    base_cost + (random() * 2000)::DECIMAL(10,2)
FROM 
    public.procedures p
CROSS JOIN 
    (SELECT generate_series('2023-01-01'::DATE, '2024-03-31'::DATE, '1 month'::INTERVAL) AS date) date_series
CROSS JOIN 
    (VALUES 
        ('Appendectomy', 15000),
        ('Colonoscopy', 3000),
        ('MRI Scan', 2500),
        ('X-Ray', 500),
        ('Ultrasound', 800),
        ('CT Scan', 1200),
        ('Flu Test', 150),
        ('Knee Replacement', 35000),
        ('Hip Replacement', 40000),
        ('Cataract Surgery', 5000)
    ) AS cost_data(name, base_cost)
WHERE 
    p.name = cost_data.name;

-- Insert sample procedure costs for hospitals
INSERT INTO public.procedure_costs (procedure_id, hospital_id, average_cost, min_cost, max_cost, out_of_pocket_cost, cost_trend, cost_explanation)
SELECT 
    p.id,
    h.id,
    base_cost + (random() * 1000)::DECIMAL(10,2),
    base_cost + (random() * 500)::DECIMAL(10,2),
    base_cost + (random() * 2000)::DECIMAL(10,2),
    (base_cost * (0.1 + random() * 0.3))::DECIMAL(10,2),
    (ARRAY['Stable', 'Increasing', 'Decreasing'])[1 + (random() * 2)::INTEGER],
    'Cost based on hospital location, facilities, and patient volume.'
FROM 
    public.procedures p
CROSS JOIN 
    public.hospitals h
CROSS JOIN 
    (VALUES 
        ('Appendectomy', 15000),
        ('Colonoscopy', 3000),
        ('MRI Scan', 2500),
        ('X-Ray', 500),
        ('Ultrasound', 800),
        ('CT Scan', 1200),
        ('Flu Test', 150),
        ('Knee Replacement', 35000),
        ('Hip Replacement', 40000),
        ('Cataract Surgery', 5000)
    ) AS cost_data(name, base_cost)
WHERE 
    p.name = cost_data.name;

-- Insert sample insurance plans
INSERT INTO public.insurance_plans (name, provider, type, annual_premium, deductible, copay_percentage, coverage_details)
VALUES
    ('Basic Health', 'Aetna', 'HMO', 4800.00, 5000.00, 20.00, 'Basic coverage with higher out-of-pocket costs'),
    ('Standard Health', 'Aetna', 'PPO', 7200.00, 3000.00, 15.00, 'Standard coverage with moderate out-of-pocket costs'),
    ('Premium Health', 'Aetna', 'PPO', 9600.00, 1500.00, 10.00, 'Comprehensive coverage with lower out-of-pocket costs'),
    ('Basic Blue', 'Blue Cross', 'HMO', 4500.00, 4500.00, 20.00, 'Basic coverage with higher out-of-pocket costs'),
    ('Standard Blue', 'Blue Cross', 'PPO', 6900.00, 2500.00, 15.00, 'Standard coverage with moderate out-of-pocket costs'),
    ('Premium Blue', 'Blue Cross', 'PPO', 9300.00, 1000.00, 10.00, 'Comprehensive coverage with lower out-of-pocket costs'),
    ('Basic Care', 'Cigna', 'HMO', 4200.00, 4000.00, 20.00, 'Basic coverage with higher out-of-pocket costs'),
    ('Standard Care', 'Cigna', 'PPO', 6600.00, 2000.00, 15.00, 'Standard coverage with moderate out-of-pocket costs'),
    ('Premium Care', 'Cigna', 'PPO', 9000.00, 500.00, 10.00, 'Comprehensive coverage with lower out-of-pocket costs'),
    ('Basic United', 'UnitedHealth', 'HMO', 5100.00, 5500.00, 20.00, 'Basic coverage with higher out-of-pocket costs'),
    ('Standard United', 'UnitedHealth', 'PPO', 7500.00, 3500.00, 15.00, 'Standard coverage with moderate out-of-pocket costs'),
    ('Premium United', 'UnitedHealth', 'PPO', 9900.00, 2000.00, 10.00, 'Comprehensive coverage with lower out-of-pocket costs'),
    ('Basic Humana', 'Humana', 'HMO', 3900.00, 3500.00, 20.00, 'Basic coverage with higher out-of-pocket costs'),
    ('Standard Humana', 'Humana', 'PPO', 6300.00, 1500.00, 15.00, 'Standard coverage with moderate out-of-pocket costs'),
    ('Premium Humana', 'Humana', 'PPO', 8700.00, 0.00, 10.00, 'Comprehensive coverage with lower out-of-pocket costs');

-- Insert sample procedure coverage
INSERT INTO public.procedure_coverage (insurance_plan_id, procedure_id, coverage_percentage, prior_authorization_required)
SELECT 
    ip.id,
    p.id,
    CASE 
        WHEN ip.type = 'HMO' THEN 70.00 + (random() * 10)::DECIMAL(5,2)
        WHEN ip.type = 'PPO' AND ip.name LIKE 'Basic%' THEN 80.00 + (random() * 10)::DECIMAL(5,2)
        WHEN ip.type = 'PPO' AND ip.name LIKE 'Standard%' THEN 85.00 + (random() * 10)::DECIMAL(5,2)
        ELSE 90.00 + (random() * 10)::DECIMAL(5,2)
    END,
    CASE 
        WHEN p.category = 'Surgery' THEN true
        WHEN p.name IN ('MRI Scan', 'CT Scan') THEN true
        ELSE false
    END
FROM 
    public.insurance_plans ip
CROSS JOIN 
    public.procedures p; 