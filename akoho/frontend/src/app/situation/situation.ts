import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SituationService, Situation } from './situation.service';
import { LotService } from '../lot/lot.service';
import { Lot } from '../models/lot.model';

@Component({
  selector: 'app-situation',
  imports: [FormsModule],
  templateUrl: './situation.html',
  styleUrl: './situation.css'
})
export class SituationComponent implements OnInit {
  lots = signal<Lot[]>([]);
  situation = signal<Situation | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  warning = signal<string | null>(null);

  selectedLotId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedLot: Lot | null = null;

  private situationService = inject(SituationService);
  private lotService = inject(LotService);

  ngOnInit(): void {
    this.loadLots();
  }

  loadLots(): void {
    this.lotService.getAll().subscribe({
      next: (data) => this.lots.set(data),
      error: () => this.error.set('Erreur lors du chargement des lots')
    });
  }

  onLotSelected(): void {
    if (this.selectedLotId) {
      this.selectedLot = this.lots().find(lot => lot.id_lot === this.selectedLotId) || null;
      this.warning.set(null);
    }
  }

  onSearch(): void {
    this.error.set(null);
    this.warning.set(null);
    this.situation.set(null);

    if (!this.selectedLotId) {
      this.error.set('Veuillez sélectionner un lot');
      return;
    }

    if (!this.selectedDate) {
      this.error.set('Veuillez sélectionner une date');
      return;
    }

    // Vérifier si la date est antérieure à la date de création du lot
    if (this.selectedLot && this.selectedLot.date_creation) {
      const creationDate = new Date(this.selectedLot.date_creation);
      const selectedDate = new Date(this.selectedDate);
      
      if (selectedDate < creationDate) {
        this.warning.set(`La date sélectionnée (${this.selectedDate}) est antérieure à la création du lot (${this.selectedLot.date_creation}). Les valeurs affichées seront 0.`);
      }
    }

    this.loading.set(true);
    this.situationService.getSituation(this.selectedLotId, this.selectedDate).subscribe({
      next: (data) => {
        this.situation.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du calcul de la situation');
        this.loading.set(false);
      }
    });
  }
}
