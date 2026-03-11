import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Oeufs } from '../models/oeufs.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class OeufsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/oeufs`;

  getAll(): Observable<Oeufs[]> {
    return this.http.get<Oeufs[]>(this.apiUrl);
  }

  getById(id: number): Observable<Oeufs> {
    return this.http.get<Oeufs>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Oeufs>): Observable<Oeufs> {
    return this.http.post<Oeufs>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Oeufs>): Observable<Oeufs> {
    return this.http.put<Oeufs>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
