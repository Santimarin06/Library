export interface Usuario {
  usuarioId?: number;
  nombre: string;
  username: string;
  email: string;
  passwordHash?: string;
  rol: 'ADMIN' | 'LECTOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  rol: string;
  email: string;
}

