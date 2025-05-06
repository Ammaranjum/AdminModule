import { supabase } from '../services/supabase'; // Adjust the path as necessary
import { Column } from 'react-table'; // Replace with the actual import

export interface User {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalBalance: number;
  createdAt: string;
  updatedAt: string;
}


export interface Admin {
  id: string;
  email: string;
  name: string;
  Recharge: number;
  TotalBalance: number;
}

export type OrderStatus = 'pending' | 'approved' | 'failed' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  user?: User;
  internalOrderId: string;
  supplierOrderId: string;
  gameId: string;
  game?: Game;
  serverId: string;
  server?: GameServer;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface GameServer {
  id: string;
  gameId: string;
  name: string;
  region: string;
  isActive: boolean;
}

export type ActivityType = 'top-up' | 'refund' | 'order-status-change' | 'login';

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  activityType: ActivityType;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  failedOrders: number;
  pendingOrders: number;
  totalTopUps: number;
  recentActivity: ActivityLog[];
}

export interface TopUpData {
  userId: string;
  amount: number;
  remark: string;
  adminName: string;
  adminOldRecharge: number;
  adminNewRecharge: number;
  createdAt: string;
  id: string;
  [key: string]: unknown;
}

export const getCurrentAdmin = async (): Promise<Admin | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  // Fetch admin details
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, email, name, Recharge, TotalBalance') // Ensure these fields match your database schema
    .eq('id', data.user.id)
    .single();

  if (adminError) throw adminError;
  return adminData as Admin;
};

export const topUpUserBalanceBackend = async (adminId: string, userId: string, amount: number): Promise<void> => {
  // Fetch admin and user data
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, Recharge')
    .eq('id', adminId)
    .single();

  if (adminError || !adminData) {
    console.error('Admin fetch error:', adminError);
    throw new Error('Admin not found or error fetching admin data');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, balance')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error('User fetch error:', userError);
    throw new Error('User not found or error fetching user data');
  }

  // Check if admin has sufficient balance
  if (adminData.Recharge < amount) {
    console.error('Insufficient admin balance');
    throw new Error('Insufficient admin balance');
  }

  // Update balances
  const { error: adminUpdateError } = await supabase
    .from('admins')
    .update({ Recharge: adminData.Recharge - amount })
    .eq('id', adminId);

  if (adminUpdateError) {
    console.error('Error updating admin balance:', adminUpdateError);
    throw new Error('Error updating admin balance');
  }

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ balance: userData.balance + amount })
    .eq('id', userId);

  if (userUpdateError) {
    console.error('Error updating user balance:', userUpdateError);
    throw new Error('Error updating user balance');
  }

  console.log(`Successfully topped up user ${userId}'s balance by $${amount}`);
};

export { supabase };