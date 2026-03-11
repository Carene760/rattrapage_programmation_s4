import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CouvertureOeufsService } from './couverture-oeufs.service';
import { CouvertureOeufs } from '../models/couverture-oeufs.model';
import { OeufsService } from '../oeufs/oeufs.service';
import { Oeufs } from '../models/oeufs.model';

@Component({
  selector: 'app-couverture-oeufs',
  imports: [FormsModule, DatePipe],
  templateUrl: './couverture-oeufs.html',
  styleUrl: './couverture-oeufs.css'
})
export class CouvertureOeufsComponent implements OnInit {
  oeufs = signal<Oeufs[]>([]);
  couvertures = signal<CouvertureOeufs[]>([]);
  error = signal<string | null>(null);

  selectedLotOeufs = 0;
  dateCouverture = '';
  couvrir = false;

  private service = inject(CouvertureOeufsService);
  private oeufsService = inject(OeufsService);

  ngOnInit(): void {
    this.loadOeufs();
    this.loadCouvertures();
  }

  loadOeufs(): void {
    this.oeufsService.getAll().subscribe({
      next: (data) => this.oeufs.set(data),
      error: () => this.error.set('Erreur lors du chargement des lots d\'oeufs')
    });
  }

  loadCouvertures(): void {
    this.service.getAll().subscribe({
      next: (data) => this.couvertures.set(data),
      error: () => this.error.set('Erreur lors du chargement des couvertures')
    });
  }

  /** Only show egg lots that are not already covered */
  availableOeufs(): Oeufs[] {
    return this.oeufs().filter(o => !o.couvert);
  }

  getSelectedOeufs(): Oeufs | undefined {
    return this.oeufs().find(o => o.id_lot_oeufs == this.selectedLotOeufs);
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.selectedLotOeufs) { this.error.set('Veuillez choisir un lot d\'oeufs'); return; }
    if (!this.dateCouverture) { this.error.set('Veuillez saisir une date'); return; }

    if (!this.couvrir) {
      this.error.set('Vous n\'avez pas coché "Couvrir". Aucune insertion.');
      return;
    }

    // Client-side date validation
    const selected = this.getSelectedOeufs();
    if (selected && selected.date_recensement) {
      const lotDate = new Date(selected.date_recensement);
      const inputDate = new Date(this.dateCouverture);
      if (inputDate < lotDate) {
        this.error.set('La date ne peut pas être antérieure à la date du lot d\'oeufs (' + lotDate.toISOString().substring(0, 10) + ')');
        return;
      }
    }

    this.service.create({
      id_lot_oeufs: this.selectedLotOeufs,
      date_couverture: this.dateCouverture
    }).subscribe({
      next: () => {
        this.loadOeufs();
        this.loadCouvertures();
        this.selectedLotOeufs = 0;
        this.dateCouverture = '';
        this.couvrir = false;
      },
      error: (err) => this.error.set(err.error?.error || 'Erreur lors de la création')
    });
  }
}
