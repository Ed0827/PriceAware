-- First, ensure we have these procedures in the procedures table
INSERT INTO public.procedures (name, description, category, recovery_time, success_rate, risks)
VALUES 
    ('Appendectomy', 'Surgical removal of the appendix', 'Surgery', '2-4 weeks', '98%', 'Infection, bleeding, damage to nearby organs'),
    ('Colonoscopy', 'Examination of the colon and rectum', 'Endoscopy', '1-2 days', '99%', 'Low risk: rare complications may include bleeding or perforation'),
    ('MRI Scan', 'Magnetic resonance imaging scan', 'Imaging', 'Immediate', '99%', 'Low risk: may cause anxiety in claustrophobic patients'),
    ('X-Ray', 'Radiographic imaging', 'Imaging', 'Immediate', '99%', 'Low radiation exposure'),
    ('Ultrasound', 'Sound wave imaging', 'Imaging', 'Immediate', '99%', 'No known risks'),
    ('CT Scan', 'Computerized tomography scan', 'Imaging', 'Immediate', '99%', 'Low radiation exposure')
ON CONFLICT (name) DO NOTHING;

-- Add historical cost data for Appendectomy (procedure_id: 10)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (10, '2023-01-31', 15000.00, 'Stable', '66160'),
    (10, '2023-02-28', 15200.00, 'Rising', '66160'),
    (10, '2023-03-31', 15400.00, 'Rising', '66160'),
    (10, '2023-04-30', 15600.00, 'Rising', '66160'),
    (10, '2023-05-31', 15800.00, 'Rising', '66160'),
    (10, '2023-06-30', 16000.00, 'Stable', '66160'),
    (10, '2023-07-31', 16200.00, 'Rising', '66160'),
    (10, '2023-08-31', 16400.00, 'Rising', '66160'),
    (10, '2023-09-30', 16600.00, 'Rising', '66160'),
    (10, '2023-10-31', 16800.00, 'Stable', '66160'),
    (10, '2023-11-30', 17000.00, 'Rising', '66160'),
    (10, '2023-12-31', 17200.00, 'Rising', '66160'),
    (10, '2024-01-31', 17400.00, 'Rising', '66160'),
    (10, '2024-02-29', 17600.00, 'Rising', '66160'),
    (10, '2024-03-31', 17800.00, 'Rising', '66160');

-- Add historical cost data for Colonoscopy (procedure_id: 11)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (11, '2023-01-31', 3200.00, 'Stable', '66160'),
    (11, '2023-02-28', 3250.00, 'Rising', '66160'),
    (11, '2023-03-31', 3300.00, 'Rising', '66160'),
    (11, '2023-04-30', 3350.00, 'Rising', '66160'),
    (11, '2023-05-31', 3400.00, 'Rising', '66160'),
    (11, '2023-06-30', 3450.00, 'Stable', '66160'),
    (11, '2023-07-31', 3500.00, 'Rising', '66160'),
    (11, '2023-08-31', 3550.00, 'Rising', '66160'),
    (11, '2023-09-30', 3600.00, 'Rising', '66160'),
    (11, '2023-10-31', 3650.00, 'Stable', '66160'),
    (11, '2023-11-30', 3700.00, 'Rising', '66160'),
    (11, '2023-12-31', 3750.00, 'Rising', '66160'),
    (11, '2024-01-31', 3800.00, 'Rising', '66160'),
    (11, '2024-02-29', 3850.00, 'Rising', '66160'),
    (11, '2024-03-31', 3900.00, 'Rising', '66160');

-- Add historical cost data for MRI Scan (procedure_id: 12)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (12, '2023-01-31', 1200.00, 'Stable', '66160'),
    (12, '2023-02-28', 1220.00, 'Rising', '66160'),
    (12, '2023-03-31', 1240.00, 'Rising', '66160'),
    (12, '2023-04-30', 1260.00, 'Rising', '66160'),
    (12, '2023-05-31', 1280.00, 'Rising', '66160'),
    (12, '2023-06-30', 1300.00, 'Stable', '66160'),
    (12, '2023-07-31', 1320.00, 'Rising', '66160'),
    (12, '2023-08-31', 1340.00, 'Rising', '66160'),
    (12, '2023-09-30', 1360.00, 'Rising', '66160'),
    (12, '2023-10-31', 1380.00, 'Stable', '66160'),
    (12, '2023-11-30', 1400.00, 'Rising', '66160'),
    (12, '2023-12-31', 1420.00, 'Rising', '66160'),
    (12, '2024-01-31', 1440.00, 'Rising', '66160'),
    (12, '2024-02-29', 1460.00, 'Rising', '66160'),
    (12, '2024-03-31', 1480.00, 'Rising', '66160');

-- Add historical cost data for X-Ray (procedure_id: 13)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (13, '2023-01-31', 350.00, 'Stable', '66160'),
    (13, '2023-02-28', 355.00, 'Rising', '66160'),
    (13, '2023-03-31', 360.00, 'Rising', '66160'),
    (13, '2023-04-30', 365.00, 'Rising', '66160'),
    (13, '2023-05-31', 370.00, 'Rising', '66160'),
    (13, '2023-06-30', 375.00, 'Stable', '66160'),
    (13, '2023-07-31', 380.00, 'Rising', '66160'),
    (13, '2023-08-31', 385.00, 'Rising', '66160'),
    (13, '2023-09-30', 390.00, 'Rising', '66160'),
    (13, '2023-10-31', 395.00, 'Stable', '66160'),
    (13, '2023-11-30', 400.00, 'Rising', '66160'),
    (13, '2023-12-31', 405.00, 'Rising', '66160'),
    (13, '2024-01-31', 410.00, 'Rising', '66160'),
    (13, '2024-02-29', 415.00, 'Rising', '66160'),
    (13, '2024-03-31', 420.00, 'Rising', '66160');

-- Add historical cost data for Ultrasound (procedure_id: 14)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (14, '2023-01-31', 450.00, 'Stable', '66160'),
    (14, '2023-02-28', 455.00, 'Rising', '66160'),
    (14, '2023-03-31', 460.00, 'Rising', '66160'),
    (14, '2023-04-30', 465.00, 'Rising', '66160'),
    (14, '2023-05-31', 470.00, 'Rising', '66160'),
    (14, '2023-06-30', 475.00, 'Stable', '66160'),
    (14, '2023-07-31', 480.00, 'Rising', '66160'),
    (14, '2023-08-31', 485.00, 'Rising', '66160'),
    (14, '2023-09-30', 490.00, 'Rising', '66160'),
    (14, '2023-10-31', 495.00, 'Stable', '66160'),
    (14, '2023-11-30', 500.00, 'Rising', '66160'),
    (14, '2023-12-31', 505.00, 'Rising', '66160'),
    (14, '2024-01-31', 510.00, 'Rising', '66160'),
    (14, '2024-02-29', 515.00, 'Rising', '66160'),
    (14, '2024-03-31', 520.00, 'Rising', '66160');

-- Add historical cost data for CT Scan (procedure_id: 15)
INSERT INTO public.historical_procedure_costs (procedure_id, date, average_cost, cost_trend, zip_code)
VALUES 
    (15, '2023-01-31', 800.00, 'Stable', '66160'),
    (15, '2023-02-28', 805.00, 'Rising', '66160'),
    (15, '2023-03-31', 810.00, 'Rising', '66160'),
    (15, '2023-04-30', 815.00, 'Rising', '66160'),
    (15, '2023-05-31', 820.00, 'Rising', '66160'),
    (15, '2023-06-30', 825.00, 'Stable', '66160'),
    (15, '2023-07-31', 830.00, 'Rising', '66160'),
    (15, '2023-08-31', 835.00, 'Rising', '66160'),
    (15, '2023-09-30', 840.00, 'Rising', '66160'),
    (15, '2023-10-31', 845.00, 'Stable', '66160'),
    (15, '2023-11-30', 850.00, 'Rising', '66160'),
    (15, '2023-12-31', 855.00, 'Rising', '66160'),
    (15, '2024-01-31', 860.00, 'Rising', '66160'),
    (15, '2024-02-29', 865.00, 'Rising', '66160'),
    (15, '2024-03-31', 870.00, 'Rising', '66160');

-- Add current procedure costs for these procedures
INSERT INTO public.procedure_costs (procedure_id, hospital_id, min_cost, max_cost, average_cost, insurance_coverage_percentage, out_of_pocket_cost, cost_trend, cost_explanation, zip_code)
VALUES 
    -- Appendectomy
    (10, 1, 15000.00, 20000.00, 17500.00, 80, 3500.00, 'Rising', 'Complex surgical procedure requiring specialized equipment and staff', '66160'),
    (10, 2, 18000.00, 25000.00, 21500.00, 75, 5375.00, 'Rising', 'Complex surgical procedure requiring specialized equipment and staff', '66160'),
    
    -- Colonoscopy
    (11, 1, 3000.00, 4000.00, 3500.00, 80, 700.00, 'Stable', 'Standard endoscopic procedure with consistent pricing', '66160'),
    (11, 2, 3500.00, 4500.00, 4000.00, 75, 1000.00, 'Stable', 'Standard endoscopic procedure with consistent pricing', '66160'),
    
    -- MRI Scan
    (12, 1, 1000.00, 1500.00, 1250.00, 80, 250.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    (12, 2, 1200.00, 1800.00, 1500.00, 75, 375.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    
    -- X-Ray
    (13, 1, 300.00, 400.00, 350.00, 80, 70.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    (13, 2, 350.00, 450.00, 400.00, 75, 100.00, 'Stable', 'Common imaging procedure with established pricing', '66160'),
    
    -- Ultrasound
    (14, 1, 400.00, 500.00, 450.00, 80, 90.00, 'Stable', 'Standard diagnostic imaging with consistent pricing', '66160'),
    (14, 2, 450.00, 550.00, 500.00, 75, 125.00, 'Stable', 'Standard diagnostic imaging with consistent pricing', '66160'),
    
    -- CT Scan
    (15, 1, 700.00, 900.00, 800.00, 80, 160.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'),
    (15, 2, 800.00, 1000.00, 900.00, 75, 225.00, 'Rising', 'Advanced imaging technology leads to higher costs', '66160'); 