-- Add flu test procedure
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Flu Test', 'Test to detect influenza virus', 'Diagnostic', 'Immediate', '95%', 'Minimal risk: slight discomfort from nasal swab')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    recovery_time = EXCLUDED.recovery_time,
    success_rate = EXCLUDED.success_rate,
    risks = EXCLUDED.risks;

-- Get the ID of the flu test procedure
WITH flu_test AS (
    SELECT id, name 
    FROM public.procedures 
    WHERE name = 'Flu Test'
)
-- Add historical cost data for the flu test
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
SELECT 
    p.id,
    date_series.date,
    150.00 + (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) * 2.00) as average_cost,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY date_series.date) % 2 = 0 THEN 'Stable'
        ELSE 'Rising'
    END as cost_trend,
    '66160' as zip_code
FROM flu_test p
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

-- Add current procedure costs for the flu test
INSERT INTO public.procedure_costs (
    procedure_id, hospital_id, min_cost, max_cost, average_cost, 
    insurance_coverage_percentage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code
)
SELECT 
    p.id as procedure_id,
    h.id as hospital_id,
    CASE 
        WHEN h.id = 1 THEN 120.00
        WHEN h.id = 2 THEN 150.00
    END as min_cost,
    CASE 
        WHEN h.id = 1 THEN 180.00
        WHEN h.id = 2 THEN 200.00
    END as max_cost,
    CASE 
        WHEN h.id = 1 THEN 150.00
        WHEN h.id = 2 THEN 175.00
    END as average_cost,
    CASE WHEN h.id = 1 THEN 80 ELSE 75 END as insurance_coverage_percentage,
    CASE 
        WHEN h.id = 1 THEN 30.00
        WHEN h.id = 2 THEN 43.75
    END as out_of_pocket_cost,
    'Stable' as cost_trend,
    'Standard diagnostic test with consistent pricing across providers' as cost_explanation,
    '66160' as zip_code
FROM flu_test p
CROSS JOIN public.hospitals h
ON CONFLICT (procedure_id, hospital_id) DO UPDATE SET
    min_cost = EXCLUDED.min_cost,
    max_cost = EXCLUDED.max_cost,
    average_cost = EXCLUDED.average_cost,
    insurance_coverage_percentage = EXCLUDED.insurance_coverage_percentage,
    out_of_pocket_cost = EXCLUDED.out_of_pocket_cost,
    cost_trend = EXCLUDED.cost_trend,
    cost_explanation = EXCLUDED.cost_explanation; 