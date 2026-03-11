const Nutrition = require('../models/Nutrition');

class NutritionService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return Nutrition.findAllDetails(this.pool);
  }

  async getById(id) {
    const detail = await Nutrition.findDetailById(this.pool, id);
    if (!detail) {
      const err = new Error('Détail nutrition non trouvé');
      err.status = 404;
      throw err;
    }
    return detail;
  }

  async create({ id_race, semaine, variation_poids, nourriture }) {
    if (semaine !== null && semaine !== undefined && (semaine < 0 || semaine > 12)) {
      const err = new Error('La semaine doit être entre 0 et 12');
      err.status = 400;
      throw err;
    }
    if (nourriture !== null && nourriture !== undefined && nourriture < 0) {
      const err = new Error('La quantité de nourriture doit être positive');
      err.status = 400;
      throw err;
    }

    let nutrition = await Nutrition.findNutritionByRace(this.pool, id_race);
    let id_nutrition;
    if (!nutrition) {
      const created = await Nutrition.createNutritionHeader(this.pool, id_race);
      id_nutrition = created.id_nutrition;
    } else {
      id_nutrition = nutrition.id_nutrition;
    }

    return Nutrition.createDetail(this.pool, { id_nutrition, semaine, variation_poids, nourriture });
  }

  async update(id, { semaine, variation_poids, nourriture }) {
    if (semaine !== null && semaine !== undefined && (semaine < 0 || semaine > 12)) {
      const err = new Error('La semaine doit être entre 0 et 12');
      err.status = 400;
      throw err;
    }
    if (nourriture !== null && nourriture !== undefined && nourriture < 0) {
      const err = new Error('La quantité de nourriture doit être positive');
      err.status = 400;
      throw err;
    }

    const detail = await Nutrition.updateDetail(this.pool, id, { semaine, variation_poids, nourriture });
    if (!detail) {
      const err = new Error('Détail nutrition non trouvé');
      err.status = 404;
      throw err;
    }
    return detail;
  }

  async delete(id) {
    const detail = await Nutrition.deleteDetail(this.pool, id);
    if (!detail) {
      const err = new Error('Détail nutrition non trouvé');
      err.status = 404;
      throw err;
    }
    return { message: 'Détail nutrition supprimé' };
  }
}

module.exports = NutritionService;
