import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EclosionOeufsService } from './eclosion-oeufs.service';
import { EclosionOeufs } from '../models/eclosion-oeufs.model';
import { CouvertureOeufsService } from '../couverture-oeufs/couverture-oeufs.service';
import { CouvertureOeufs } from '../models/couverture-oeufs.model';

@Component({
  selector: 'app-eclosion-oeufs',
  imports: [FormsModule, DatePipe],
  templateUrl: './eclosion-oeufs.html',
  styleUrl: './eclosion-oeufs.css'
})
export class EclosionOeufsComponent implements OnInit {
  couvertures = signal<CouvertureOeufs[]>([]);
  eclosions = signal<EclosionOeufs[]>([]);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  selectedCouverture = 0;
  dateEclosion = '';
  nbrOeufsEclos: number | null = null;

  private service = inject(EclosionOeufsService);
  private couvertureService = inject(CouvertureOeufsService);

  ngOnInit(): void {
    this.loadCouvertures();
    this.loadEclosions();
  }

  loadCouvertures(): void {
    this.couvertureService.getAll().subscribe({
      next: (data) => this.couvertures.set(data),
      error: () => this.error.set('Erreur lors du chargement des couvertures')
    });
  }

  loadEclosions(): void {
    this.service.getAll().subscribe({
      next: (data) => this.eclosions.set(data),
      error: () => this.error.set('Erreur lors du chargement des éclosions')
    });
  }

  /** Only couvertures without an existing eclosion */
  availableCouvertures(): CouvertureOeufs[] {
    const eclosionCouvertureIds = new Set(this.eclosions().map(e => e.id_couverture));
    return this.couvertures().filter(c => !eclosionCouvertureIds.has(c.id_couverture));
  }

  getSelectedCouverture(): CouvertureOeufs | undefined {
    return this.couvertures().find(c => c.id_couverture == this.selectedCouverture);
  }

  getMaxOeufs(): number {
    const c = this.getSelectedCouverture();
    return c ? c.nbr_oeufs : 0;
  }

  onSubmit(): void {
    this.error.set(null);
    this.success.set(null);

    if (!this.selectedCouverture) { this.error.set('Veuillez choisir une couverture'); return; }
    if (!this.dateEclosion) { this.error.set('Veuillez saisir une date d\'éclosion'); return; }
    if (this.nbrOeufsEclos === null || this.nbrOeufsEclos < 0) { this.error.set('Le nombre d\'oeufs éclos doit être >= 0'); return; }

    const maxOeufs = this.getMaxOeufs();
    if (this.nbrOeufsEclos > maxOeufs) {
      this.error.set('Le nombre d\'oeufs éclos ne peut pas dépasser ' + maxOeufs);
      return;
    }

    // Client-side date validation
    const couv = this.getSelectedCouverture();
    if (couv && couv.date_couverture) {
      const couvDate = new Date(couv.date_couverture);
      const inputDate = new Date(this.dateEclosion);
      if (inputDate < couvDate) {
        this.error.set('La date d\'éclosion ne peut pas être antérieure à la date de couverture (' + couvDate.toISOString().substring(0, 10) + ')');
        return;
      }
    }

    this.service.create({
      id_couverture: this.selectedCouverture,
      date_eclosion: this.dateEclosion,
      nbr_oeufs_eclos: this.nbrOeufsEclos
    }).subscribe({
      next: (result) => {
        const pourris = maxOeufs - (this.nbrOeufsEclos ?? 0);
        let msg = 'Éclosion enregistrée.';
        if (result.lot) {
          msg += ' Nouveau lot de ' + result.lot.nbr_poulet + ' poulets créé (Lot #' + result.lot.id_lot + ').';
        }
        if (pourris > 0) {
          msg += ' Oeufs pourris : ' + pourris + '.';
        }
        this.success.set(msg);
        this.loadCouvertures();
        this.loadEclosions();
        this.selectedCouverture = 0;
        this.dateEclosion = '';
        this.nbrOeufsEclos = null;
      },
      error: (err) => this.error.set(err.error?.error || 'Erreur lors de la création')
    });
  }
}
