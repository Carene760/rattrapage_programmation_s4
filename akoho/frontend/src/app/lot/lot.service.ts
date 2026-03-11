import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lot } from '../models/lot.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class LotService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/lot`;

  getAll(): Observable<Lot[]> {
    return this.http.get<Lot[]>(this.apiUrl);
  }

  getById(id: number): Observable<Lot> {
    return this.http.get<Lot>(`${this.apiUrl}/${id}`);
  }

  create(lot: Partial<Lot>): Observable<Lot> {
    return this.http.post<Lot>(this.apiUrl, lot);
  }

  update(id: number, lot: Partial<Lot>): Observable<Lot> {
    return this.http.put<Lot>(`${this.apiUrl}/${id}`, lot);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
