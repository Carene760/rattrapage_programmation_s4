export interface Oeufs {
  id_lot_oeufs: number;
  id_lot: number | null;
  date_recensement: string | null;
  nbr_oeufs: number | null;
  id_race?: number;
  nom_race?: string;
  nbr_poulet?: number;
  couvert?: number;
}
