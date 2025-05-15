import axios from 'axios';
import { supabase } from './supabase';

const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const BASE_URL = '/api';

export interface ExternalGame {
  name: string;
}

export interface GameProduct {
  [key: string]: number;
}

export interface ServerList {
  code: string;
  message: string;
}

export interface GameListResponse {
  status: boolean;
  message: string;
  data: {
    game_lists: ExternalGame[];
  };
}

export interface GameProductsResponse {
  status: boolean;
  message: string;
  data: {
    game_products: GameProduct;
  };
}

export interface ServerListResponse {
  status: boolean;
  message: string;
  data: {
    data: ServerList;
  };
}

export interface CheckBalanceResponse {
  status: boolean;
  message: string;
  data: {
    balance: number;
  };
}

export const getAdminBalance = async (adminId: string): Promise<number> => {
  try {
    const response = await axios.post<CheckBalanceResponse>(`${BASE_URL}/check_balance`, {
      token: API_TOKEN
    });

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    const balance = response.data.data.balance;
    // automatically update TotalBalance in Supabase
    const { error: updateError } = await supabase
      .from('admins')
      .update({ TotalBalance: balance })
      .eq('id', adminId);
    if (updateError) throw updateError;
    return balance;
  } catch (error) {
    console.error('Error fetching admin balance:', error);
    throw error;
  }

}

export const getGameLists = async (): Promise<ExternalGame[]> => {
  try {
    const response = await axios.post<GameListResponse>(`${BASE_URL}/game_lists`, {
      token: API_TOKEN
    });
    
    if (!response.data.status) {
      throw new Error(response.data.message);
    }
    
    return response.data.data.game_lists;
  } catch (error) {
    console.error('Error fetching game lists:', error);
    throw error;
  }
};

export const getGameProducts = async (gameName: string): Promise<GameProduct> => {
  try {
    const response = await axios.post<GameProductsResponse>(`${BASE_URL}/game_products`, {
      token: API_TOKEN,
      game_name: gameName
    });
    
    if (!response.data.status) {
      throw new Error(response.data.message);
    }
    
    return response.data.data.game_products;
  } catch (error) {
    console.error('Error fetching game products:', error);
    throw error;
  }
};

export const getServerLists = async (gameName: string): Promise<ServerList> => {
  try {
    const response = await axios.post<ServerListResponse>(`${BASE_URL}/server_lists`, {
      token: API_TOKEN,
      game_name: gameName
    });
    
    if (!response.data.status) {
      throw new Error(response.data.message);
    }
    
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching server lists:', error);
    throw error;
  }
}; 
