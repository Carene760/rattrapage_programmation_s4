import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DecesService } from './deces.service';
import { Deces } from '../models/deces.model';
import { LotService } from '../lot/lot.service';
import { Lot } from '../models/lot.model';

@Component({
  selector: 'app-deces',
  imports: [FormsModule, DatePipe],
  templateUrl: './deces.html',
  styleUrl: './deces.css'
})
export class DecesComponent implements OnInit {
  decesList = signal<Deces[]>([]);
  lots = signal<Lot[]>([]);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);

  selectedLot = 0;
  dateDeces = '';
  nbrDeces: number | null = null;

  editSelectedLot = 0;
  editDateDeces = '';
  editNbrDeces: number | null = null;

  private decesService = inject(DecesService);
  private lotService = inject(LotService);

  ngOnInit(): void {
    this.loadLots();
    this.loadDeces();
  }

  loadLots(): void {
    this.lotService.getAll().subscribe({
      next: (data) => this.lots.set(data),
      error: () => this.error.set('Erreur lors du chargement des lots')
    });
  }

  loadDeces(): void {
    this.decesService.getAll().subscribe({
      next: (data) => this.decesList.set(data),
      error: () => this.error.set('Erreur lors du chargement des décès')
    });
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.selectedLot) { this.error.set('Veuillez choisir un lot'); return; }
    if (!this.dateDeces) { this.error.set('Veuillez saisir une date'); return; }
    if (this.nbrDeces === null || this.nbrDeces < 0) { this.error.set('Le nombre de décès doit être positif ou nul'); return; }

    this.decesService.create({
      id_lot: this.selectedLot,
      date_deces: this.dateDeces,
      nbr_deces: this.nbrDeces
    }).subscribe({
      next: () => {
        this.loadDeces();
        this.selectedLot = 0;
        this.dateDeces = '';
        this.nbrDeces = null;
      },
      error: () => this.error.set('Erreur lors de la création')
    });
  }

  onEdit(d: Deces): void {
    this.editingId.set(d.id_deces);
    this.editSelectedLot = d.id_lot ?? 0;
    this.editDateDeces = d.date_deces ? new Date(d.date_deces).toISOString().substring(0, 10) : '';
    this.editNbrDeces = d.nbr_deces;
  }

  onCancelEdit(): void {
    this.editingId.set(null);
  }

  onSaveEdit(id: number): void {
    this.error.set(null);
    this.decesService.update(id, {
      id_lot: this.editSelectedLot,
      date_deces: this.editDateDeces,
      nbr_deces: this.editNbrDeces
    }).subscribe({
      next: () => { this.editingId.set(null); this.loadDeces(); },
      error: () => this.error.set('Erreur lors de la modification')
    });
  }

  onDelete(id: number): void {
    this.error.set(null);
    this.decesService.delete(id).subscribe({
      next: () => this.loadDeces(),
      error: () => this.error.set('Erreur lors de la suppression')
    });
  }
}
