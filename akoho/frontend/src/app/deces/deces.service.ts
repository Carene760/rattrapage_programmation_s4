import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Deces } from '../models/deces.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class DecesService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/deces`;

  getAll(): Observable<Deces[]> {
    return this.http.get<Deces[]>(this.apiUrl);
  }

  getById(id: number): Observable<Deces> {
    return this.http.get<Deces>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Deces>): Observable<Deces> {
    return this.http.post<Deces>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Deces>): Observable<Deces> {
    return this.http.put<Deces>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
