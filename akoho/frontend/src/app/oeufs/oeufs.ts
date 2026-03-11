import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OeufsService } from './oeufs.service';
import { Oeufs } from '../models/oeufs.model';
import { LotService } from '../lot/lot.service';
import { Lot } from '../models/lot.model';

@Component({
  selector: 'app-oeufs',
  imports: [FormsModule, DatePipe],
  templateUrl: './oeufs.html',
  styleUrl: './oeufs.css'
})
export class OeufsComponent implements OnInit {
  oeufs = signal<Oeufs[]>([]);
  lots = signal<Lot[]>([]);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);

  // Create form
  selectedLot = 0;
  dateRecensement = '';
  nbrOeufs: number | null = null;

  // Edit fields
  editSelectedLot = 0;
  editDateRecensement = '';
  editNbrOeufs: number | null = null;

  private oeufsService = inject(OeufsService);
  private lotService = inject(LotService);

  ngOnInit(): void {
    this.loadLots();
    this.loadOeufs();
  }

  loadLots(): void {
    this.lotService.getAll().subscribe({
      next: (data) => this.lots.set(data),
      error: () => this.error.set('Erreur lors du chargement des lots')
    });
  }

  loadOeufs(): void {
    this.oeufsService.getAll().subscribe({
      next: (data) => this.oeufs.set(data),
      error: () => this.error.set('Erreur lors du chargement des oeufs')
    });
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.selectedLot) { this.error.set('Veuillez choisir un lot'); return; }
    if (!this.dateRecensement) { this.error.set('Veuillez saisir une date'); return; }
    if (this.nbrOeufs === null || this.nbrOeufs < 1) { this.error.set('Le nombre d\'oeufs doit être positif'); return; }

    this.oeufsService.create({
      id_lot: this.selectedLot,
      date_recensement: this.dateRecensement,
      nbr_oeufs: this.nbrOeufs
    }).subscribe({
      next: () => {
        this.loadOeufs();
        this.selectedLot = 0;
        this.dateRecensement = '';
        this.nbrOeufs = null;
      },
      error: () => this.error.set('Erreur lors de la création')
    });
  }

  onEdit(o: Oeufs): void {
    this.editingId.set(o.id_lot_oeufs);
    this.editSelectedLot = o.id_lot ?? 0;
    this.editDateRecensement = o.date_recensement ? new Date(o.date_recensement).toISOString().substring(0, 10) : '';
    this.editNbrOeufs = o.nbr_oeufs;
  }

  onCancelEdit(): void {
    this.editingId.set(null);
  }

  onSaveEdit(id: number): void {
    this.error.set(null);
    this.oeufsService.update(id, {
      id_lot: this.editSelectedLot,
      date_recensement: this.editDateRecensement,
      nbr_oeufs: this.editNbrOeufs
    }).subscribe({
      next: () => { this.editingId.set(null); this.loadOeufs(); },
      error: () => this.error.set('Erreur lors de la modification')
    });
  }

  onDelete(id: number): void {
    this.error.set(null);
    this.oeufsService.delete(id).subscribe({
      next: () => this.loadOeufs(),
      error: () => this.error.set('Erreur lors de la suppression')
    });
  }
}
