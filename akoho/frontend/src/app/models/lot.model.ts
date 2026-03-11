export interface Lot {
  id_lot: number;
  id_race: number | null;
  nom_race?: string | null;
  age: number | null;
  date_creation: string | null;
  nbr_poulet: number | null;
  id_couverture: number | null;
  poids_initial: number | null;
}
