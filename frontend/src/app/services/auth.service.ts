import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/auth';
  private currentUserSignal = signal<{ username: string; rol: string; email: string } | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Restaurar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.currentUserSignal.set({
          username: response.username,
          rol: response.rol,
          email: response.email
        });
      })
    );
  }

  register(usuario: Usuario): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, usuario).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.currentUserSignal.set({
          username: response.username,
          rol: response.rol,
          email: response.email
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUserSignal.asReadonly();
  }

  isAdmin(): boolean {
    const user = this.currentUserSignal();
    return user?.rol === 'ADMIN';
  }

  isLector(): boolean {
    const user = this.currentUserSignal();
    return user?.rol === 'LECTOR';
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify({
      username: user.username,
      rol: user.rol,
      email: user.email
    }));
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
      } catch (e) {
        console.error('Error parsing user from storage', e);
      }
    }
  }
}
