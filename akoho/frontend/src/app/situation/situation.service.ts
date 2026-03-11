import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Situation {
  id_lot: number;
  date_consultation: string;
  nbr_poulet_a_date_t: number;
  nbr_deces: number;
  nbr_oeufs: number;
  poids_moyen: number;
  estimation_poulet: number;
  estimation_oeufs: number;
  prix_achat_akoho: number;
  prix_sakafo: number;
}

@Injectable({ providedIn: 'root' })
export class SituationService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/situation`;

  getSituation(lotId: number, date: string): Observable<Situation> {
    return this.http.get<Situation>(this.apiUrl, {
      params: {
        lotId: lotId.toString(),
        date: date
      }
    });
  }
}
