import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouvertureOeufs } from '../models/couverture-oeufs.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class CouvertureOeufsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/couverture-oeufs`;

  getAll(): Observable<CouvertureOeufs[]> {
    return this.http.get<CouvertureOeufs[]>(this.apiUrl);
  }

  create(data: { id_lot_oeufs: number; date_couverture: string }): Observable<CouvertureOeufs> {
    return this.http.post<CouvertureOeufs>(this.apiUrl, data);
  }
}
