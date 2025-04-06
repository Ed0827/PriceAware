-- First, drop the existing tables in the correct order (reverse of dependencies)
DROP TABLE IF EXISTS public.historical_procedure_costs;
DROP TABLE IF EXISTS public.procedure_costs;
DROP TABLE IF EXISTS public.procedures;
DROP TABLE IF EXISTS public.hospitals;

-- Now run the create_all_tables.sql script to recreate the tables with the new data
-- This will be done in a separate step after this file is executed 