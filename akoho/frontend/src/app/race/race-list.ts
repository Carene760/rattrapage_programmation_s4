import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RaceService } from './race.service';
import { Race } from '../models/race.model';

@Component({
  selector: 'app-race-list',
  imports: [FormsModule],
  templateUrl: './race-list.html',
  styleUrl: './race-list.css'
})
export class RaceListComponent implements OnInit {
  races = signal<Race[]>([]);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);

  nomRace = '';
  prixAchat: number | null = null;
  prixVente: number | null = null;
  prixOeuf: number | null = null;
  prixNourriture: number | null = null;

  editNomRace = '';
  editPrixAchat: number | null = null;
  editPrixVente: number | null = null;
  editPrixOeuf: number | null = null;
  editPrixNourriture: number | null = null;

  private raceService = inject(RaceService);

  ngOnInit(): void {
    this.loadRaces();
  }

  loadRaces(): void {
    this.raceService.getAll().subscribe({
      next: (data) => this.races.set(data),
      error: () => this.error.set('Erreur lors du chargement des races')
    });
  }

  onCreate(): void {
    this.error.set(null);
    if (!this.nomRace) { this.error.set('Veuillez saisir un nom'); return; }
    this.raceService.create({ nom_race: this.nomRace, prix_achat: this.prixAchat, prix_vente: this.prixVente, prix_oeuf: this.prixOeuf, prix_nourriture: this.prixNourriture }).subscribe({
      next: () => { this.loadRaces(); this.nomRace = ''; this.prixAchat = null; this.prixVente = null; this.prixOeuf = null; this.prixNourriture = null; },
      error: () => this.error.set('Erreur lors de la création')
    });
  }

  onEdit(race: Race): void {
    this.editingId.set(race.id_race);
    this.editNomRace = race.nom_race ?? '';
    this.editPrixAchat = race.prix_achat;
    this.editPrixVente = race.prix_vente;
    this.editPrixOeuf = race.prix_oeuf;
    this.editPrixNourriture = race.prix_nourriture;
  }

  onCancelEdit(): void {
    this.editingId.set(null);
  }

  onSaveEdit(id: number): void {
    this.error.set(null);
    this.raceService.update(id, { nom_race: this.editNomRace, prix_achat: this.editPrixAchat, prix_vente: this.editPrixVente, prix_oeuf: this.editPrixOeuf, prix_nourriture: this.editPrixNourriture }).subscribe({
      next: () => { this.editingId.set(null); this.loadRaces(); },
      error: () => this.error.set('Erreur lors de la modification')
    });
  }

  onDelete(id: number): void {
    this.error.set(null);
    this.raceService.delete(id).subscribe({
      next: () => this.loadRaces(),
      error: () => this.error.set('Erreur lors de la suppression')
    });
  }
}
