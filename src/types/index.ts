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
  totalBalance: number;
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
}