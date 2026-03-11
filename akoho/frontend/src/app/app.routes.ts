import { Routes } from '@angular/router';
import { RaceListComponent } from './race/race-list';
import { LotComponent } from './lot/lot';
import { NutritionComponent } from './nutrition/nutrition';
import { DecesComponent } from './deces/deces';
import { OeufsComponent } from './oeufs/oeufs';
import { CouvertureOeufsComponent } from './couverture-oeufs/couverture-oeufs';
import { EclosionOeufsComponent } from './eclosion-oeufs/eclosion-oeufs';
import { SituationComponent } from './situation/situation';

export const routes: Routes = [
  { path: '', redirectTo: 'race', pathMatch: 'full' },
  { path: 'race', component: RaceListComponent },
  { path: 'lot', component: LotComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'deces', component: DecesComponent },
  { path: 'oeufs', component: OeufsComponent },
  { path: 'couverture-oeufs', component: CouvertureOeufsComponent },
  { path: 'eclosion-oeufs', component: EclosionOeufsComponent },
  { path: 'situation', component: SituationComponent }
];
