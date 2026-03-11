const Database = require('../config/database');
const sql = Database.sql;

class SituationService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Calcule le nombre de décès cumulés pour un lot jusqu'à une date donnée
   */
  async calculateTotalDeaths(lotId, targetDate) {
    const result = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .input('target_date', sql.Date, targetDate)
      .query('SELECT COALESCE(SUM(nbr_deces), 0) as total FROM deces WHERE id_lot = @id_lot AND date_deces <= @target_date');
    return result.recordset[0].total || 0;
  }

  /**
   * Calcule le nombre de poulets à une date donnée
   */
  async calculateChickenCount(lotId, targetDate) {
    const lot = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .query('SELECT nbr_poulet, id_couverture FROM lot WHERE id_lot = @id_lot');
    
    if (!lot.recordset[0]) {
      throw new Error('Lot non trouvé');
    }

    const initialCount = lot.recordset[0].nbr_poulet;
    const deaths = await this.calculateTotalDeaths(lotId, targetDate);
    return Math.max(0, initialCount - deaths);
  }

  /**
   * Calcule le nombre d'œufs cumulés du lot jusqu'à une date donnée (non destinés à la couveuse)
   */
  async calculateEggCount(lotId, targetDate) {
    // Œufs du lot filtrés par date, en excluant ceux envoyés en couveuse
    // SAUF si la date de couverture est postérieure à la date de situation
    const result = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .input('target_date', sql.Date, targetDate)
      .query(`
        SELECT COALESCE(SUM(o.nbr_oeufs), 0) as total
        FROM oeufs o
        WHERE o.id_lot = @id_lot
        AND o.date_recensement <= @target_date
        AND o.id_lot_oeufs NOT IN (
          SELECT DISTINCT id_lot_oeufs FROM couverture_oeufs
          WHERE date_couverture <= @target_date
        )
      `);
    return result.recordset[0].total || 0;
  }

  /**
   * Calcule le poids moyen à une date donnée
   * Formule: 
   * - S1 (jours 0-6): P0 + P1/7 * (jour+1)
   * - S2 (jours 7-13): P0 + P1 + P2/7 * (jour-6)
   * - Etc.
   */
  async calculateAverageWeight(lotId, targetDate) {
    const lotData = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .query(`
        SELECT l.date_creation, l.id_race, l.poids_initial, l.age FROM lot l WHERE l.id_lot = @id_lot
      `);

    if (!lotData.recordset[0]) {
      throw new Error('Lot non trouvé');
    }

    const { date_creation, id_race, poids_initial, age } = lotData.recordset[0];
    
    // Calculer l'âge en jours (le jour de création = jour 0)
    const creationDate = new Date(date_creation);
    const target = new Date(targetDate);
    //Difference de 2 dates donne millisecondes, on convertit en jours
    const ageDays = Math.floor((target - creationDate) / (1000 * 60 * 60 * 24));
    
    if (ageDays < 0) {
      return 0;
    }

    // Récupérer les données de nutrition
    const nutritionData = await this.pool
      .request()
      .input('id_race', sql.Int, id_race)
      .query(`
        SELECT nd.semaine, nd.variation_poids
        FROM nutrition n
        JOIN nutrition_detail nd ON n.id_nutrition = nd.id_nutrition
        WHERE n.id_race = @id_race
        ORDER BY nd.semaine ASC
      `);

    // P0 = poids_initial du lot (0 si issu d'éclosion)

    let weight = 0 ;
    if (poids_initial != 0) {
        weight = poids_initial;
    } else {
        weight = nutritionData.recordset.length > 0 ? nutritionData.recordset[0].variation_poids : 0;
    }

    // Calculer le nombre de semaines complètes
    const weeksComplete = Math.floor(ageDays / 7);
    const daysInCurrentWeek = ageDays % 7;

    // Ajouter les variations de poids des semaines complètes
    for (const row of nutritionData.recordset) {
      if (row.semaine > age && row.semaine <= weeksComplete+age) {
        weight += row.variation_poids;
      }
    }

    // Ajouter la portion de la semaine courante
    const currentSemaine = weeksComplete+age + 1;
    const currentWeekData = nutritionData.recordset.find(d => d.semaine === currentSemaine);
    if (currentWeekData) {
      const dailyVariation = currentWeekData.variation_poids / 7;
      // Si on est dans les jours 0-6 (première semaine): ajouter (jour+1)
      // Sinon (à partir du jour 7): ajouter les jours restants uniquement s'il y en a
      if (weeksComplete === 0) {
        weight += dailyVariation * (ageDays);
      } else if (daysInCurrentWeek > 0) {
        weight += dailyVariation * daysInCurrentWeek;
      }
    }

    return Math.max(0, weight);
  }

  /**
   * Calcule la nourriture totale consommée par le lot à une date donnée
   * Boucle par semaine de nutrition, prend en compte les décès par semaine
   */
  async calculateFoodConsumption(lotId, targetDate) {
    const lotData = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .query(`
        SELECT l.date_creation, l.id_race, l.age, l.nbr_poulet FROM lot l WHERE l.id_lot = @id_lot
      `);

    if (!lotData.recordset[0]) {
      throw new Error('Lot non trouvé');
    }

    const { date_creation, id_race, age, nbr_poulet } = lotData.recordset[0];
    
    const creationDate = new Date(date_creation);
    const target = new Date(targetDate);
    const ageDays = Math.floor((target - creationDate) / (1000 * 60 * 60 * 24));
    
    if (ageDays < 0) {
      return 0;
    }

    const msPerDay = 1000 * 60 * 60 * 24;

    // Récupérer tous les décès du lot jusqu'à la date cible, groupés par date
    const decesData = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .input('target_date', sql.Date, targetDate)
      .query(`
        SELECT date_deces, SUM(nbr_deces) as total_deces
        FROM deces
        WHERE id_lot = @id_lot AND date_deces <= @target_date
        GROUP BY date_deces
        ORDER BY date_deces ASC
      `);

    // Récupérer les données de nutrition de la race
    const nutritionData = await this.pool
      .request()
      .input('id_race', sql.Int, id_race)
      .query(`
        SELECT nd.semaine, nd.nourriture
        FROM nutrition n
        JOIN nutrition_detail nd ON n.id_nutrition = nd.id_nutrition
        WHERE n.id_race = @id_race
        ORDER BY nd.semaine ASC
      `);

    const weeksComplete = Math.floor(ageDays / 7);
    const daysInCurrentWeek = ageDays % 7;
    let currentNumbers = nbr_poulet;
    let totalFood = 0;

    // Déterminer currentWeeklyFood à partir de la dernière ligne de nutrition
    const lastNutritionRow = nutritionData.recordset.length > 0
      ? nutritionData.recordset[nutritionData.recordset.length - 1]
      : null;
    let currentWeeklyFood = lastNutritionRow ? lastNutritionRow.nourriture : 0;
    const lastDataSemaine = lastNutritionRow ? lastNutritionRow.semaine : age;

    // Boucler les semaines de nutrition complètes (couvertes par les données)
    for (const row of nutritionData.recordset) {
      if (row.semaine > age && row.semaine <= weeksComplete + age) {
        const dateDebutSemaine = new Date(creationDate.getTime() + (row.semaine - age - 1) * 7 * msPerDay);
        const dateFinSemaine = new Date(dateDebutSemaine.getTime() + 7 * msPerDay);

        let hasDeathThisWeek = false;

        for (const deces of decesData.recordset) {
          const dateDeces = new Date(deces.date_deces);

          if (dateDeces >= dateDebutSemaine && dateDeces < dateFinSemaine) {
            hasDeathThisWeek = true;

            const oldNumbers = currentNumbers;
            currentNumbers -= deces.total_deces;

            const dayRankOfWeek = Math.floor((dateDeces - dateDebutSemaine) / msPerDay);

            const totalConsumptionBeforeDeath = oldNumbers * (row.nourriture / 7) * (dayRankOfWeek - 1);
            const totalConsumptionSinceDeath = currentNumbers * (row.nourriture / 7) * (7 - dayRankOfWeek + 1);

            totalFood += totalConsumptionBeforeDeath + totalConsumptionSinceDeath;
          }
        }

        if (!hasDeathThisWeek) {
          totalFood += currentNumbers * row.nourriture;
        }
      }
    }

    // Semaines au-delà des données de nutrition : utiliser currentWeeklyFood
    for (let semaine = Math.max(lastDataSemaine + 1, age + 1); semaine <= weeksComplete + age; semaine++) {
      const dateDebutSemaine = new Date(creationDate.getTime() + (semaine - age - 1) * 7 * msPerDay);
      const dateFinSemaine = new Date(dateDebutSemaine.getTime() + 7 * msPerDay);

      let hasDeathThisWeek = false;

      for (const deces of decesData.recordset) {
        const dateDeces = new Date(deces.date_deces);

        if (dateDeces >= dateDebutSemaine && dateDeces < dateFinSemaine) {
          hasDeathThisWeek = true;

          const oldNumbers = currentNumbers;
          currentNumbers -= deces.total_deces;

          const dayRankOfWeek = Math.floor((dateDeces - dateDebutSemaine) / msPerDay);

          const totalConsumptionBeforeDeath = oldNumbers * (currentWeeklyFood / 7) * (dayRankOfWeek - 1);
          const totalConsumptionSinceDeath = currentNumbers * (currentWeeklyFood / 7) * (7 - dayRankOfWeek + 1);

          totalFood += totalConsumptionBeforeDeath + totalConsumptionSinceDeath;
        }
      }

      if (!hasDeathThisWeek) {
        totalFood += currentNumbers * currentWeeklyFood;
      }
    }

    // Considérer la date de la situation pour la semaine en cours (incomplète)
    if (daysInCurrentWeek > 0) {
      const currentSemaine = weeksComplete + age + 1;
      const currentWeekData = nutritionData.recordset.find(d => d.semaine === currentSemaine);
      // Si pas de données pour cette semaine, utiliser currentWeeklyFood
      const weeklyFood = currentWeekData ? currentWeekData.nourriture : currentWeeklyFood;

      if (weeklyFood > 0) {
        const dateDebutSemaine = new Date(creationDate.getTime() + (currentSemaine - age - 1) * 7 * msPerDay);

        let hasDeathThisWeek = false;

        for (const deces of decesData.recordset) {
          const dateDeces = new Date(deces.date_deces);

          if (dateDeces >= dateDebutSemaine && dateDeces <= target) {
            hasDeathThisWeek = true;

            const oldNumbers = currentNumbers;
            currentNumbers -= deces.total_deces;

            const dayRankOfWeek = Math.floor((dateDeces - dateDebutSemaine) / msPerDay);

            const totalConsumptionBeforeDeath = oldNumbers * (weeklyFood / 7) * (dayRankOfWeek - 1);
            const totalConsumptionSinceDeath = currentNumbers * (weeklyFood / 7) * (daysInCurrentWeek - dayRankOfWeek + 1);

            totalFood += totalConsumptionBeforeDeath + totalConsumptionSinceDeath;
          }
        }

        if (!hasDeathThisWeek) {
          totalFood += currentNumbers * (weeklyFood / 7) * daysInCurrentWeek;
        }
      }
    }

    return totalFood;
  }

  /**
   * Calcule la situation complète pour un lot à une date donnée
   */
  async calculateSituation(lotId, targetDate) {
    // Récupérer les données de base du lot et de la race
    const lotData = await this.pool
      .request()
      .input('id_lot', sql.Int, lotId)
      .query(`
        SELECT l.nbr_poulet, l.id_couverture, l.date_creation, r.prix_achat, r.prix_vente, r.prix_oeuf, r.prix_nourriture, l.poids_initial
        FROM lot l
        JOIN race r ON l.id_race = r.id_race
        WHERE l.id_lot = @id_lot
      `);

    if (!lotData.recordset[0]) {
      throw new Error('Lot non trouvé');
    }

    const { nbr_poulet: initialChickenCount, id_couverture, prix_achat, prix_vente, prix_oeuf, prix_nourriture, date_creation, poids_initial } = lotData.recordset[0];

    // Vérifier si la date de consultation est antérieure à la date de création du lot
    const creationDate = new Date(date_creation);
    const consultationDate = new Date(targetDate);
    
    if (consultationDate < creationDate) {
      // Si la date est antérieure, retourner une situation avec tous les champs à 0
      return {
        id_lot: lotId,
        date_consultation: targetDate,
        nbr_poulet_a_date_t: 0,
        nbr_deces: 0,
        nbr_oeufs: 0,
        poids_moyen: 0,
        estimation_poulet: 0,
        estimation_oeufs: 0,
        prix_achat_akoho: 0,
        prix_sakafo: 0
      };
    }

    // Calcul des différentes métriques
    const nbr_deces = await this.calculateTotalDeaths(lotId, targetDate);
    const nbr_poulet = await this.calculateChickenCount(lotId, targetDate);
    const nbr_oeufs = await this.calculateEggCount(lotId, targetDate);
    const poids_moyen = await this.calculateAverageWeight(lotId, targetDate);
    const nourriture_total = await this.calculateFoodConsumption(lotId, targetDate);

    // Calcul des estimations selon les règles métier
    // 5. estimation poulet = poids_moyen * prix_vente/g * nbr_poulet
    const estimation_poulet = poids_moyen * prix_vente * nbr_poulet;

    // 6. Prix estimation_oeufs = nbr_oeufs * prix_oeufs
    const estimation_oeufs = nbr_oeufs * prix_oeuf;

    // 7. Prix achat akoho = if (id_couverture == null) { prix_achat * (nbr_deces+nbr_poulet) * poids_moyen } else { 0 }
    const prix_achat_akoho = id_couverture === null 
      ? prix_achat * (nbr_deces + nbr_poulet) * poids_initial 
      : 0;

    // 8. Prix sakafo = nourriture_total * prix_nourriture
    const prix_sakafo = nourriture_total * prix_nourriture;

    return {
      id_lot: lotId,
      date_consultation: targetDate,
      nbr_poulet_a_date_t: nbr_poulet,
      nbr_deces: nbr_deces,
      nbr_oeufs: nbr_oeufs,
      poids_moyen: Math.round(poids_moyen * 100) / 100,
      estimation_poulet: Math.round(estimation_poulet * 100) / 100,
      estimation_oeufs: Math.round(estimation_oeufs * 100) / 100,
      prix_achat_akoho: Math.round(prix_achat_akoho * 100) / 100,
      prix_sakafo: Math.round(prix_sakafo * 100) / 100
    };
  }
}

module.exports = SituationService;