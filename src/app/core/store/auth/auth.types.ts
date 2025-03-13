export interface User {
  id: number;
  nombre: string;
  email: string;
  estado: string;
  type: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
} 