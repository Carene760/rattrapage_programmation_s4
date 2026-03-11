import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LotService } from './lot.service';
import { Lot } from '../models/lot.model';
import { RaceService } from '../race/race.service';
import { Race } from '../models/race.model';

@Component({
  selector: 'app-lot',
  imports: [FormsModule, DatePipe],
  templateUrl: './lot.html',
  styleUrl: './lot.css'
})
export class LotComponent implements OnInit {
  lots = signal<Lot[]>([]);
  races = signal<Race[]>([]);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);

  // Form fields
  selectedRace = 0;
  selectedAge = 0;
  dateCreation = '';
  nbrPoulet: number | null = null;
  poidsInitial: number | null = null;

  // Edit fields
  editSelectedRace = 0;
  editSelectedAge = 0;
  editDateCreation = '';
  editNbrPoulet: number | null = null;
  editPoidsInitial: number | null = null;

  ages = Array.from({ length: 13 }, (_, i) => i);

  private lotService = inject(LotService);
  private raceService = inject(RaceService);

  ngOnInit(): void {
    this.loadRaces();
    this.loadLots();
  }

  loadRaces(): void {
    this.raceService.getAll().subscribe({
      next: (data) => this.races.set(data),
      error: () => this.error.set('Erreur lors du chargement des races')
    });
  }

  loadLots(): void {
    this.lotService.getAll().subscribe({
      next: (data) => this.lots.set(data),
      error: () => this.error.set('Erreur lors du chargement des lots')
    });
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.selectedRace) { this.error.set('Veuillez choisir une race'); return; }
    if (this.selectedAge < 0 || this.selectedAge > 12) { this.error.set('L\'âge doit être entre 0 et 12'); return; }
    if (!this.dateCreation) { this.error.set('Veuillez saisir une date'); return; }
    if (!this.nbrPoulet || this.nbrPoulet < 1) { this.error.set('Le nombre de poulets doit être positif'); return; }

    this.lotService.create({
      id_race: this.selectedRace,
      age: this.selectedAge,
      date_creation: this.dateCreation,
      nbr_poulet: this.nbrPoulet,
      poids_initial: this.poidsInitial ?? 0
    }).subscribe({
      next: () => {
        this.loadLots();
        this.selectedRace = 0;
        this.selectedAge = 0;
        this.dateCreation = '';
        this.nbrPoulet = null;
        this.poidsInitial = null;
      },
      error: () => this.error.set('Erreur lors de la création du lot')
    });
  }

  onEdit(lot: Lot): void {
    this.editingId.set(lot.id_lot);
    this.editSelectedRace = lot.id_race ?? 0;
    this.editSelectedAge = lot.age ?? 0;
    this.editDateCreation = lot.date_creation ? new Date(lot.date_creation).toISOString().substring(0, 10) : '';
    this.editNbrPoulet = lot.nbr_poulet;
    this.editPoidsInitial = lot.poids_initial;
  }

  onCancelEdit(): void {
    this.editingId.set(null);
  }

  onSaveEdit(id: number): void {
    this.error.set(null);
    this.lotService.update(id, {
      id_race: this.editSelectedRace,
      age: this.editSelectedAge,
      date_creation: this.editDateCreation,
      nbr_poulet: this.editNbrPoulet,
      poids_initial: this.editPoidsInitial ?? 0
    }).subscribe({
      next: () => { this.editingId.set(null); this.loadLots(); },
      error: () => this.error.set('Erreur lors de la modification')
    });
  }

  onDelete(id: number): void {
    this.error.set(null);
    this.lotService.delete(id).subscribe({
      next: () => this.loadLots(),
      error: () => this.error.set('Erreur lors de la suppression')
    });
  }
}
