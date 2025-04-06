-- Drop existing historical_procedure_costs table if it exists
DROP TABLE IF EXISTS public.historical_procedure_costs;

-- Create historical_procedure_costs table
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