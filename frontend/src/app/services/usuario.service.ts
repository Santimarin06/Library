import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8082/api/usuario';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/obtener-todos`);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(usuario: Usuario): Observable<string> {
    return this.http.post<string>(this.apiUrl, usuario, { responseType: 'text' as 'json' });
  }

  update(usuario: Usuario): Observable<string> {
    return this.http.put<string>(this.apiUrl, usuario, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>('http://localhost:8082/api/auth/me');
  }
}
