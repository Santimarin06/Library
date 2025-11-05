import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Autor } from '../models/autor.model';

@Injectable({
  providedIn: 'root',
})
export class AutorService {
  private apiUrl = 'http://localhost:8082/api/autor';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${this.apiUrl}/obtener-todos`);
  }

  getById(id: number): Observable<Autor> {
    return this.http.get<Autor>(`${this.apiUrl}/${id}`);
  }

  getByName(nombre: string): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${this.apiUrl}/nombre/${nombre}`);
  }

  create(autor: Autor): Observable<string> {
    return this.http.post<string>(this.apiUrl, autor, { responseType: 'text' as 'json' });
  }

  update(autor: Autor): Observable<string> {
    return this.http.put<string>(this.apiUrl, autor, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }
}
