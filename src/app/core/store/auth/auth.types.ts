export interface User {
  id: number;
  username: string;
  email: string;
  status: string;
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