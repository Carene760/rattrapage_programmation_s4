import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EclosionOeufs, EclosionOeufsCreate } from '../models/eclosion-oeufs.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class EclosionOeufsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/eclosion-oeufs`;

  getAll(): Observable<EclosionOeufs[]> {
    return this.http.get<EclosionOeufs[]>(this.apiUrl);
  }

  create(data: EclosionOeufsCreate): Observable<{ eclosion: EclosionOeufs; lot: any }> {
    return this.http.post<{ eclosion: EclosionOeufs; lot: any }>(this.apiUrl, data);
  }
}
