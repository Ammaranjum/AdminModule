/*
  # Admin Module Schema

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `balance` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `customer_id` (text, unique)
      - `balance` (numeric)
      - `secret_token` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `games`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `game_servers`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references games.id)
      - `name` (text)
      - `region` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `internal_order_id` (text, unique)
      - `supplier_order_id` (text)
      - `game_id` (uuid, references games.id)
      - `server_id` (uuid, references game_servers.id)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `activity_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references admins.id)
      - `admin_name` (text)
      - `activity_type` (text)
      - `description` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    
  3. Functions
    - top_up_user_balance: Function to handle top-up transactions
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  customer_id text UNIQUE NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  secret_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_servers table
CREATE TABLE IF NOT EXISTS game_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  name text NOT NULL,
  region text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  internal_order_id text UNIQUE NOT NULL,
  supplier_order_id text,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  server_id uuid REFERENCES game_servers(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure status is one of the allowed values
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'failed', 'refunded'))
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  admin_name text NOT NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure activity_type is one of the allowed values
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('top-up', 'refund', 'order-status-change', 'login'))
);

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
-- Admins can view their own profile
CREATE POLICY "Admins can view own data" 
  ON admins
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON users
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can view all games
CREATE POLICY "Admins can view all games" 
  ON games
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can view all game servers
CREATE POLICY "Admins can view all game servers" 
  ON game_servers
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" 
  ON orders
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can update order status
CREATE POLICY "Admins can update order status" 
  ON orders
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" 
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins can insert activity logs
CREATE POLICY "Admins can insert activity logs" 
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Create function for top up user balance
CREATE OR REPLACE FUNCTION top_up_user_balance(
  p_admin_id uuid,
  p_user_id uuid,
  p_amount numeric
) RETURNS void AS $$
BEGIN
  -- Check if admin has sufficient balance
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = p_admin_id AND balance >= p_amount
  ) THEN
    RAISE EXCEPTION 'Insufficient admin balance';
  END IF;
  
  -- Update admin balance
  UPDATE admins
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = p_admin_id;
  
  -- Update user balance
  UPDATE users
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Return success
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
-- Sample admin
INSERT INTO admins (email, name, balance)
VALUES ('admin@example.com', 'Admin User', 10000.00);

-- Sample users
INSERT INTO users (email, name, phone, customer_id, balance, secret_token)
VALUES 
  ('user1@example.com', 'John Doe', '+1234567890', 'CUST001', 500.00, 'secret-token-1'),
  ('user2@example.com', 'Jane Smith', '+0987654321', 'CUST002', 750.00, 'secret-token-2'),
  ('user3@example.com', 'Robert Johnson', '+1122334455', 'CUST003', 250.00, 'secret-token-3');

-- Sample games
INSERT INTO games (name, description, image_url, is_active)
VALUES 
  ('Mobile Legends', 'Popular MOBA game for mobile devices', 'https://via.placeholder.com/100', true),
  ('PUBG Mobile', 'Battle royale game for mobile devices', 'https://via.placeholder.com/100', true),
  ('Free Fire', 'Battle royale game optimized for low-end devices', 'https://via.placeholder.com/100', true);

-- Sample game servers
INSERT INTO game_servers (game_id, name, region, is_active)
VALUES 
  ((SELECT id FROM games WHERE name = 'Mobile Legends'), 'Asia Server', 'Asia', true),
  ((SELECT id FROM games WHERE name = 'Mobile Legends'), 'Europe Server', 'Europe', true),
  ((SELECT id FROM games WHERE name = 'PUBG Mobile'), 'North America Server', 'North America', true),
  ((SELECT id FROM games WHERE name = 'PUBG Mobile'), 'Asia Server', 'Asia', true),
  ((SELECT id FROM games WHERE name = 'Free Fire'), 'Global Server', 'Global', true);

-- Sample orders
INSERT INTO orders (user_id, internal_order_id, supplier_order_id, game_id, server_id, amount, status)
VALUES 
  ((SELECT id FROM users WHERE customer_id = 'CUST001'), 'ORD-001', 'SUP-001', 
   (SELECT id FROM games WHERE name = 'Mobile Legends'), 
   (SELECT id FROM game_servers WHERE name = 'Asia Server' AND game_id = (SELECT id FROM games WHERE name = 'Mobile Legends')), 
   50.00, 'approved'),
  ((SELECT id FROM users WHERE customer_id = 'CUST001'), 'ORD-002', 'SUP-002', 
   (SELECT id FROM games WHERE name = 'PUBG Mobile'), 
   (SELECT id FROM game_servers WHERE name = 'Asia Server' AND game_id = (SELECT id FROM games WHERE name = 'PUBG Mobile')), 
   100.00, 'approved'),
  ((SELECT id FROM users WHERE customer_id = 'CUST002'), 'ORD-003', 'SUP-003', 
   (SELECT id FROM games WHERE name = 'Free Fire'), 
   (SELECT id FROM game_servers WHERE name = 'Global Server'), 
   25.00, 'pending'),
  ((SELECT id FROM users WHERE customer_id = 'CUST003'), 'ORD-004', 'SUP-004', 
   (SELECT id FROM games WHERE name = 'Mobile Legends'), 
   (SELECT id FROM game_servers WHERE name = 'Europe Server' AND game_id = (SELECT id FROM games WHERE name = 'Mobile Legends')), 
   75.00, 'failed');

-- Sample activity logs
INSERT INTO activity_logs (admin_id, admin_name, activity_type, description, metadata)
VALUES 
  ((SELECT id FROM admins LIMIT 1), 'Admin User', 'login', 'Admin logged in', '{"ip": "192.168.1.1"}'::jsonb),
  ((SELECT id FROM admins LIMIT 1), 'Admin User', 'top-up', 'Topped up user CUST001 balance by $100', 
   '{"userId": "' || (SELECT id FROM users WHERE customer_id = 'CUST001') || '", "amount": 100}'::jsonb),
  ((SELECT id FROM admins LIMIT 1), 'Admin User', 'order-status-change', 'Updated order ORD-004 status to failed', 
   '{"orderId": "' || (SELECT id FROM orders WHERE internal_order_id = 'ORD-004') || '", "newStatus": "failed"}'::jsonb);