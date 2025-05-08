import { createClient } from '@supabase/supabase-js';
import { 
  User, Order, Game, GameServer, ActivityLog, 
  DashboardStats, Admin, TopUpData, OrderStatus 
} from '../types';

// In a real application, these would be environment variables
const supabaseUrl = 'https://djcwtdzvvtksmwnicgwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqY3d0ZHp2dnRrc213bmljZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTIwMDgsImV4cCI6MjA2MTU4ODAwOH0.6kPKIvbD8RC7Ek-8R7GvR7QP3Y5V97ikrw3lZji2U2A';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth services
export const loginAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAdmin = async (): Promise<Admin | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  // Fetch admin details
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('id', data.user.id) // Ensure this matches the logged-in user's ID
    .single();

  if (adminError) throw adminError;
  return adminData as Admin;
};

// User services
export const getUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, customer_id, name, email, phone, balance, total_balance, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  // Map snake_case to camelCase
  return data.map((user) => ({
    id: user.id,
    customerId: user.customer_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    totalBalance: user.total_balance,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));
};

export const getUserById = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as User;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("id, customer_id, name, email, phone, balance, totalbalance, created_at, updated_at")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,customer_id.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data.map((user) => ({
    id: user.id,
    customerId: user.customer_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    totalBalance: user.totalbalance,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));
};

// Order services
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:userId(id, name, email, customerId),
      game:gameId(id, name),
      server:serverId(id, name, region)
    `)
    .order('createdAt', { ascending: false });
    
  if (error) throw error;
  return data as Order[];
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:userId(id, name, email, customerId),
      game:gameId(id, name),
      server:serverId(id, name, region)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as Order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Log the activity
  await logActivity({
    adminId: (await getCurrentAdmin())?.id || '',
    adminName: (await getCurrentAdmin())?.name || '',
    activityType: status === 'refunded' ? 'refund' : 'order-status-change',
    description: `Updated order ${id} status to ${status}`,
    metadata: { orderId: id, newStatus: status }
  });
  
  return data as Order;
};

// Game services
export const getGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data as Game[];
};

export const getGameServers = async (): Promise<GameServer[]> => {
  const { data, error } = await supabase
    .from('game_servers')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data as GameServer[];
};

// Activity log services
export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('createdAt', { ascending: false });
    
  if (error) throw error;
  return data as ActivityLog[];
};

export const logActivity = async (activity: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<void> => {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      ...activity,
      createdAt: new Date().toISOString()
    });
    
  if (error) throw error;
};

// Top-up service
export const topUpUserBalance = async ({
  id,
  userId,
  amount,
  remarks,
  adminName,
  adminOldRecharge,
  adminNewRecharge,
  createdAt,
}: TopUpData): Promise<void> => {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Admin not authenticated');
  
  if (admin.Recharge < amount) {
    throw new Error('Insufficient admin balance');
  }
  
  // Start a transaction
  const { error: txnError } = await supabase.rpc('top_up_user_balance', {
    p_admin_id: admin.id,
    p_user_id: userId,
    p_amount: amount
  });
  
  if (txnError) throw txnError;

  // Insert top-up record into top_ups table
  const { error: insertError } = await supabase
    .from('top_ups')
    .insert({
      id: id,
      created_at: createdAt,
      admin_id: admin.id,
      admin_name: adminName,
      admin_old_recharge: adminOldRecharge,
      admin_new_recharge: adminNewRecharge,
      user_id: userId,
      amount: amount,
      remarks: remarks,
    });
  if (insertError) throw insertError;

  // Log the activity
  await logActivity({
    adminId: admin.id,
    adminName: admin.name,
    activityType: 'top-up',
    description: `Topped up user ${userId} balance by ${amount}`,
    metadata: { userId, amount, remarks }
  });
};

// Function to perform top-up operation
export const topUpUserBalanceBackend = async (adminId: string, userId: string, amount: number): Promise<void> => {
  // Fetch admin and user data
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, Recharge, name')
    .eq('id', adminId)
    .single();

  if (adminError || !adminData) {
    throw new Error('Admin not found or error fetching admin data');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, balance, name')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found or error fetching user data');
  }

  // Check if admin has sufficient balance
  if (adminData.Recharge < amount) {
    throw new Error('Insufficient admin balance');
  }

  // Update balances
  const { error: adminUpdateError } = await supabase
    .from('admins')
    .update({ Recharge: adminData.Recharge - amount })
    .eq('id', adminId);

  if (adminUpdateError) {
    throw new Error('Error updating admin balance');
  }

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ balance: userData.balance + amount })
    .eq('id', userId);

  if (userUpdateError) {
    throw new Error('Error updating user balance');
  }

  // Insert top-up record into top_ups table
  const { error: insertError } = await supabase
    .from('top_ups')
    .insert({
      admin_id: adminId,
      admin_name: adminData.name,
      user_id: userId,
      user_name: userData.name,
      amount: amount,
      adminOldRecharge: adminData.Recharge,
      adminNewRecharge: adminData.Recharge - amount,
      remarks: '' // Add any remarks if needed
    });

  if (insertError) {
    console.error('Error logging top-up:', insertError.message, insertError.details);
    throw new Error('Failed to log top-up action');
  }

  console.log(`Successfully topped up user ${userId}'s balance by $${amount}`);
};

export const getTotalTopUps = async (): Promise<{ count: number; totalAmount: number }> => {
  // Fetch only the amount column and get exact count
  const { data, count, error } = await supabase
    .from('top_ups')
    .select('amount', { count: 'exact' });
  if (error) throw error;
  const totalAmount = data?.reduce((sum, row) => sum + (row.amount as number), 0) ?? 0;
  return { count: count ?? 0, totalAmount };
};
  
export const getTotalUsers = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('users')
    .select('*', { head: true, count: 'exact' });
  if (error) throw error;
  return count ?? 0;
};

// Dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // In a real application, this would be a single RPC call to the database
  // For demo purposes, we'll simulate it with multiple calls
  
  const [users, orders, activityLogs, topUps] = await Promise.all([
    getUsers(),
    getOrders(),
    getActivityLogs(),
    getTopUps()
  ]);
  
  const totalSales = orders.reduce((sum, order) => 
    order.status === 'approved' ? sum + order.amount : sum, 0);
    
  const failedOrders = orders.filter(order => order.status === 'failed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  const totalTopUps = topUps.reduce((sum, topUp) => sum + topUp.amount, 0);
  
  return {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalSales,
    failedOrders,
    pendingOrders,
    totalTopUps,
    recentActivity: activityLogs.slice(0, 10)
  };
};

export const getTopUps = async (): Promise<TopUpData[]> => {
  const { data, error } = await supabase.from('top_ups').select('*');
  console.log('Supabase getTopUps raw data:', data, 'error:', error);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    adminName: row.admin_name,
    adminOldRecharge: row.adminOldRecharge,
    adminNewRecharge: row.adminNewRecharge,
    userId: row.user_id,
    userName: row.user_name,
    amount: row.amount,
    remarks: row.remarks,
  }));
};