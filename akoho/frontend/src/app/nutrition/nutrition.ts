import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NutritionService } from './nutrition.service';
import { NutritionDetail } from '../models/nutrition.model';
import { RaceService } from '../race/race.service';
import { Race } from '../models/race.model';

@Component({
  selector: 'app-nutrition',
  imports: [FormsModule],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.css'
})
export class NutritionComponent implements OnInit {
  details = signal<NutritionDetail[]>([]);
  races = signal<Race[]>([]);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);

  selectedRace = 0;
  selectedSemaine = 0;
  variationPoids: number | null = null;
  nourriture: number | null = null;

  editSelectedRace = 0;
  editSelectedSemaine = 0;
  editVariationPoids: number | null = null;
  editNourriture: number | null = null;

  semaines = Array.from({ length: 13 }, (_, i) => i);

  private nutritionService = inject(NutritionService);
  private raceService = inject(RaceService);

  ngOnInit(): void {
    this.loadRaces();
    this.loadDetails();
  }

  loadRaces(): void {
    this.raceService.getAll().subscribe({
      next: (data) => this.races.set(data),
      error: () => this.error.set('Erreur lors du chargement des races')
    });
  }

  loadDetails(): void {
    this.nutritionService.getAll().subscribe({
      next: (data) => this.details.set(data),
      error: () => this.error.set('Erreur lors du chargement des données nutrition')
    });
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.selectedRace) { this.error.set('Veuillez choisir une race'); return; }
    if (this.selectedSemaine < 0 || this.selectedSemaine > 12) { this.error.set('La semaine doit être entre 0 et 12'); return; }
    if (this.variationPoids === null) { this.error.set('Veuillez saisir la variation de poids'); return; }
    if (this.nourriture === null || this.nourriture < 0) { this.error.set('La quantité de nourriture doit être positive'); return; }

    this.nutritionService.create({
      id_race: this.selectedRace,
      semaine: this.selectedSemaine,
      variation_poids: this.variationPoids,
      nourriture: this.nourriture
    }).subscribe({
      next: () => {
        this.loadDetails();
        this.selectedRace = 0;
        this.selectedSemaine = 0;
        this.variationPoids = null;
        this.nourriture = null;
      },
      error: () => this.error.set('Erreur lors de la création')
    });
  }

  onEdit(d: NutritionDetail): void {
    this.editingId.set(d.id_nutrition_fille);
    this.editSelectedRace = d.id_race ?? 0;
    this.editSelectedSemaine = d.semaine ?? 0;
    this.editVariationPoids = d.variation_poids;
    this.editNourriture = d.nourriture;
  }

  onCancelEdit(): void {
    this.editingId.set(null);
  }

  onSaveEdit(id: number): void {
    this.error.set(null);
    this.nutritionService.update(id, {
      id_race: this.editSelectedRace,
      semaine: this.editSelectedSemaine,
      variation_poids: this.editVariationPoids,
      nourriture: this.editNourriture
    }).subscribe({
      next: () => { this.editingId.set(null); this.loadDetails(); },
      error: () => this.error.set('Erreur lors de la modification')
    });
  }

  onDelete(id: number): void {
    this.error.set(null);
    this.nutritionService.delete(id).subscribe({
      next: () => this.loadDetails(),
      error: () => this.error.set('Erreur lors de la suppression')
    });
  }
}
