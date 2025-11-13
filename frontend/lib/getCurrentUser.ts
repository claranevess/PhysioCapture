/**
 * Utilitário para obter o usuário atual de forma consistente
 * 
 * 🚧 DESENVOLVIMENTO: Busca o usuário da API se não houver no localStorage
 * Em produção, deve sempre usar o localStorage (após login)
 */

import { api } from './api';

export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  user_type_display: string;
  clinica?: any;
  crefito?: string;
  especialidade?: string;
  [key: string]: any;
}

/**
 * Obtém o usuário atual do localStorage ou da API
 * Em modo desenvolvimento, sempre sincroniza com a API
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    // 🚧 DESENVOLVIMENTO: Sempre buscar da API para garantir consistência
    console.log('📡 Sincronizando usuário com a API (modo desenvolvimento)');
    const response = await api.get('/api/auth/me/');
    const user = response.data;
    
    // Salvar no localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    
    // Fallback: tentar localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return null;
  }
}

/**
 * Sincroniza o usuário do localStorage com a API
 */
export async function syncCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await api.get('/api/auth/me/');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    return null;
  }
}

/**
 * Obtém o usuário do localStorage (síncrono)
 * Retorna null se não houver usuário
 */
export function getCurrentUserSync(): CurrentUser | null {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler usuário do localStorage:', error);
    return null;
  }
}

