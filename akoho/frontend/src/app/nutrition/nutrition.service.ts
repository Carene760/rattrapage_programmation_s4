import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NutritionDetail } from '../models/nutrition.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/nutrition`;

  getAll(): Observable<NutritionDetail[]> {
    return this.http.get<NutritionDetail[]>(this.apiUrl);
  }

  getById(id: number): Observable<NutritionDetail> {
    return this.http.get<NutritionDetail>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<NutritionDetail> & { id_race?: number }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: Partial<NutritionDetail>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
