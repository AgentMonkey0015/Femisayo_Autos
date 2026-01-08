/*
  # Femisayo Autos - Initial Database Schema Part 1
  
  Create types and core tables
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'mechanic', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('received', 'diagnosis', 'in_progress', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role user_role DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  license_plate text UNIQUE NOT NULL,
  vin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS job_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_mechanic_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status job_status DEFAULT 'received',
  description text NOT NULL,
  diagnosis text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id uuid NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  labor_cost numeric(10, 2),
  parts_cost numeric(10, 2),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  quantity integer DEFAULT 0,
  unit_price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS job_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id uuid NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
  part_id uuid NOT NULL REFERENCES parts(id),
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_parts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS rental_cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  license_plate text UNIQUE NOT NULL,
  car_type text NOT NULL,
  daily_rate numeric(10, 2) NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_cars ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS rental_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES rental_cars(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status booking_status DEFAULT 'pending',
  total_amount numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS rental_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_type text NOT NULL UNIQUE,
  daily_rate numeric(10, 2) NOT NULL,
  weekly_rate numeric(10, 2),
  monthly_rate numeric(10, 2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rental_pricing ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid,
  booking_id uuid,
  amount numeric(10, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method text,
  reference_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_order_id uuid REFERENCES job_orders(id),
  booking_id uuid REFERENCES rental_bookings(id),
  amount numeric(10, 2) NOT NULL,
  tax_amount numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
