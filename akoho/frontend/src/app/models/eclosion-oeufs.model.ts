export interface EclosionOeufs {
  id_eclosion: number;
  date_eclosion: string;
  nbr_oeufs_eclos: number;
  id_couverture: number;
  id_lot_oeufs: number;
  nbr_oeufs_pourris: number;
  total_oeufs_couverture?: number;
  date_couverture?: string;
  nom_race?: string;
  id_race?: number;
}

export interface EclosionOeufsCreate {
  id_couverture: number;
  date_eclosion: string;
  nbr_oeufs_eclos: number;
}
