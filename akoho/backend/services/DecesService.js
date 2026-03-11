const Deces = require('../models/Deces');

class DecesService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return Deces.findAll(this.pool);
  }

  async getById(id) {
    const deces = await Deces.findById(this.pool, id);
    if (!deces) {
      const err = new Error('Décès non trouvé');
      err.status = 404;
      throw err;
    }
    return deces;
  }

  async create(data) {
    const { nbr_deces } = data;
    if (nbr_deces !== null && nbr_deces !== undefined && nbr_deces < 0) {
      const err = new Error('Le nombre de décès doit être positif ou nul');
      err.status = 400;
      throw err;
    }
    return Deces.create(this.pool, data);
  }

  async update(id, data) {
    const { nbr_deces } = data;
    if (nbr_deces !== null && nbr_deces !== undefined && nbr_deces < 0) {
      const err = new Error('Le nombre de décès doit être positif ou nul');
      err.status = 400;
      throw err;
    }
    const deces = await Deces.update(this.pool, id, data);
    if (!deces) {
      const err = new Error('Décès non trouvé');
      err.status = 404;
      throw err;
    }
    return deces;
  }

  async delete(id) {
    const deces = await Deces.delete(this.pool, id);
    if (!deces) {
      const err = new Error('Décès non trouvé');
      err.status = 404;
      throw err;
    }
    return { message: 'Décès supprimé' };
  }
}

module.exports = DecesService;
