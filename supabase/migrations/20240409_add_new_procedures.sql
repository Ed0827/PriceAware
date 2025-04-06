-- Add new procedures without dropping existing ones
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Appendectomy', 'Surgical removal of the appendix', 'Surgery', '2-4 weeks', '98%', 'Infection, bleeding, damage to nearby organs'),
    ('Colonoscopy', 'Examination of the colon and rectum', 'Endoscopy', '1-2 days', '99%', 'Low risk: rare complications may include bleeding or perforation'),
    ('MRI Scan', 'Magnetic resonance imaging scan', 'Imaging', 'Immediate', '99%', 'Low risk: may cause anxiety in claustrophobic patients'),
    ('X-Ray', 'Radiographic imaging', 'Imaging', 'Immediate', '99%', 'Low radiation exposure'),
    ('Ultrasound', 'Sound wave imaging', 'Imaging', 'Immediate', '99%', 'No known risks'),
    ('CT Scan', 'Computerized tomography scan', 'Imaging', 'Immediate', '99%', 'Low radiation exposure')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    recovery_time = EXCLUDED.recovery_time,
    success_rate = EXCLUDED.success_rate,
    risks = EXCLUDED.risks;

-- Get the IDs of the newly added/updated procedures
WITH new_procedures AS (
    SELECT id, name 
    FROM public.procedures 
    WHERE name IN ('Appendectomy', 'Colonoscopy', 'MRI Scan', 'X-Ray', 'Ultrasound', 'CT Scan')
)
-- Add historical cost data for each procedure
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    date_series.date,
    CASE 
        WHEN p.name = 'Appendectomy' THEN 15000.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 200.00)
        WHEN p.name = 'Colonoscopy' THEN 3200.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 50.00)
        WHEN p.name = 'MRI Scan' THEN 1200.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 20.00)
        WHEN p.name = 'X-Ray' THEN 350.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 5.00)
        WHEN p.name = 'Ultrasound' THEN 450.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 5.00)
        WHEN p.name = 'CT Scan' THEN 800.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 5.00)
    END as average_cost,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) % 3 = 0 THEN 'Stable'
        ELSE 'Rising'
    END as cost_trend,
    '66160' as zip_code
FROM new_procedures p
CROSS JOIN (
    SELECT generate_series(
        '2023-01-31'::date,
        '2024-03-31'::date,
        '1 month'::interval
    )::date as date
) date_series
ON CONFLICT (procedure_id, date) DO UPDATE SET
    average_cost = EXCLUDED.average_cost,
    cost_trend = EXCLUDED.cost_trend;

-- Add current procedure costs for these procedures
INSERT INTO public.procedure_costs (
    procedure_id, hospital_id, min_cost, max_cost, average_cost, 
    insurance_coverage_percentage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code
)
SELECT 
    p.id as procedure_id,
    h.id as hospital_id,
    CASE 
        WHEN p.name = 'Appendectomy' AND h.id = 1 THEN 15000.00
        WHEN p.name = 'Appendectomy' AND h.id = 2 THEN 18000.00
        WHEN p.name = 'Colonoscopy' AND h.id = 1 THEN 3000.00
        WHEN p.name = 'Colonoscopy' AND h.id = 2 THEN 3500.00
        WHEN p.name = 'MRI Scan' AND h.id = 1 THEN 1000.00
        WHEN p.name = 'MRI Scan' AND h.id = 2 THEN 1200.00
        WHEN p.name = 'X-Ray' AND h.id = 1 THEN 300.00
        WHEN p.name = 'X-Ray' AND h.id = 2 THEN 350.00
        WHEN p.name = 'Ultrasound' AND h.id = 1 THEN 400.00
        WHEN p.name = 'Ultrasound' AND h.id = 2 THEN 450.00
        WHEN p.name = 'CT Scan' AND h.id = 1 THEN 700.00
        WHEN p.name = 'CT Scan' AND h.id = 2 THEN 800.00
    END as min_cost,
    CASE 
        WHEN p.name = 'Appendectomy' AND h.id = 1 THEN 20000.00
        WHEN p.name = 'Appendectomy' AND h.id = 2 THEN 25000.00
        WHEN p.name = 'Colonoscopy' AND h.id = 1 THEN 4000.00
        WHEN p.name = 'Colonoscopy' AND h.id = 2 THEN 4500.00
        WHEN p.name = 'MRI Scan' AND h.id = 1 THEN 1500.00
        WHEN p.name = 'MRI Scan' AND h.id = 2 THEN 1800.00
        WHEN p.name = 'X-Ray' AND h.id = 1 THEN 400.00
        WHEN p.name = 'X-Ray' AND h.id = 2 THEN 450.00
        WHEN p.name = 'Ultrasound' AND h.id = 1 THEN 500.00
        WHEN p.name = 'Ultrasound' AND h.id = 2 THEN 550.00
        WHEN p.name = 'CT Scan' AND h.id = 1 THEN 900.00
        WHEN p.name = 'CT Scan' AND h.id = 2 THEN 1000.00
    END as max_cost,
    CASE 
        WHEN p.name = 'Appendectomy' AND h.id = 1 THEN 17500.00
        WHEN p.name = 'Appendectomy' AND h.id = 2 THEN 21500.00
        WHEN p.name = 'Colonoscopy' AND h.id = 1 THEN 3500.00
        WHEN p.name = 'Colonoscopy' AND h.id = 2 THEN 4000.00
        WHEN p.name = 'MRI Scan' AND h.id = 1 THEN 1250.00
        WHEN p.name = 'MRI Scan' AND h.id = 2 THEN 1500.00
        WHEN p.name = 'X-Ray' AND h.id = 1 THEN 350.00
        WHEN p.name = 'X-Ray' AND h.id = 2 THEN 400.00
        WHEN p.name = 'Ultrasound' AND h.id = 1 THEN 450.00
        WHEN p.name = 'Ultrasound' AND h.id = 2 THEN 500.00
        WHEN p.name = 'CT Scan' AND h.id = 1 THEN 800.00
        WHEN p.name = 'CT Scan' AND h.id = 2 THEN 900.00
    END as average_cost,
    CASE WHEN h.id = 1 THEN 80 ELSE 75 END as insurance_coverage_percentage,
    CASE 
        WHEN p.name = 'Appendectomy' AND h.id = 1 THEN 3500.00
        WHEN p.name = 'Appendectomy' AND h.id = 2 THEN 5375.00
        WHEN p.name = 'Colonoscopy' AND h.id = 1 THEN 700.00
        WHEN p.name = 'Colonoscopy' AND h.id = 2 THEN 1000.00
        WHEN p.name = 'MRI Scan' AND h.id = 1 THEN 250.00
        WHEN p.name = 'MRI Scan' AND h.id = 2 THEN 375.00
        WHEN p.name = 'X-Ray' AND h.id = 1 THEN 70.00
        WHEN p.name = 'X-Ray' AND h.id = 2 THEN 100.00
        WHEN p.name = 'Ultrasound' AND h.id = 1 THEN 90.00
        WHEN p.name = 'Ultrasound' AND h.id = 2 THEN 125.00
        WHEN p.name = 'CT Scan' AND h.id = 1 THEN 160.00
        WHEN p.name = 'CT Scan' AND h.id = 2 THEN 225.00
    END as out_of_pocket_cost,
    CASE 
        WHEN p.name IN ('Appendectomy', 'MRI Scan', 'CT Scan') THEN 'Rising'
        ELSE 'Stable'
    END as cost_trend,
    CASE 
        WHEN p.name = 'Appendectomy' THEN 'Complex surgical procedure requiring specialized equipment and staff'
        WHEN p.name = 'Colonoscopy' THEN 'Standard endoscopic procedure with consistent pricing'
        WHEN p.name = 'MRI Scan' THEN 'Advanced imaging technology leads to higher costs'
        WHEN p.name = 'X-Ray' THEN 'Common imaging procedure with established pricing'
        WHEN p.name = 'Ultrasound' THEN 'Standard diagnostic imaging with consistent pricing'
        WHEN p.name = 'CT Scan' THEN 'Advanced imaging technology leads to higher costs'
    END as cost_explanation,
    '66160' as zip_code
FROM new_procedures p
CROSS JOIN public.hospitals h
ON CONFLICT (procedure_id, hospital_id) DO UPDATE SET
    min_cost = EXCLUDED.min_cost,
    max_cost = EXCLUDED.max_cost,
    average_cost = EXCLUDED.average_cost,
    insurance_coverage_percentage = EXCLUDED.insurance_coverage_percentage,
    out_of_pocket_cost = EXCLUDED.out_of_pocket_cost,
    cost_trend = EXCLUDED.cost_trend,
    cost_explanation = EXCLUDED.cost_explanation; 