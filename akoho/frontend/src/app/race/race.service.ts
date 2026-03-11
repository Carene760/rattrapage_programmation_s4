import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Race } from '../models/race.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/race`;

  getAll(): Observable<Race[]> {
    return this.http.get<Race[]>(this.apiUrl);
  }

  getById(id: number): Observable<Race> {
    return this.http.get<Race>(`${this.apiUrl}/${id}`);
  }

  create(race: Partial<Race>): Observable<Race> {
    return this.http.post<Race>(this.apiUrl, race);
  }

  update(id: number, race: Partial<Race>): Observable<Race> {
    return this.http.put<Race>(`${this.apiUrl}/${id}`, race);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
