-- Drop existing hospitals table if it exists
DROP TABLE IF EXISTS public.hospitals;

-- Create hospitals table
CREATE TABLE public.hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    website TEXT,
    insurance TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample hospitals
INSERT INTO public.hospitals (name, address, city, state, zip_code, phone, website, insurance)
VALUES 
    ('University of Kansas Hospital', '4000 Cambridge St', 'Kansas City', 'KS', '66160', '913-588-5000', 'www.kuhospital.org', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Cigna']),
    ('AdventHealth Shawnee Mission', '9100 W 74th St', 'Overland Park', 'KS', '66204', '913-676-2000', 'www.adventhealth.com', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid']),
    ('Saint Luke''s Hospital', '4401 Wornall Rd', 'Kansas City', 'MO', '64111', '816-932-2000', 'www.saintlukeskc.org', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Cigna']),
    ('Menorah Medical Center', '5721 W 119th St', 'Overland Park', 'KS', '66209', '913-498-6000', 'www.menorahmedicalcenter.com', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid']),
    ('Research Medical Center', '2316 E Meyer Blvd', 'Kansas City', 'MO', '64132', '816-276-4000', 'www.researchmedicalcenter.com', ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Cigna']); 