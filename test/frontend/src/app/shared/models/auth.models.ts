export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  confirmationRequired?: boolean;
  user: {
    id: string;
    email: string;
  };
}