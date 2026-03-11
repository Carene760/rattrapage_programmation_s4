const Lot = require('../models/Lot');

class LotService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return Lot.findAll(this.pool);
  }

  async getById(id) {
    const lot = await Lot.findById(this.pool, id);
    if (!lot) {
      const err = new Error('Lot non trouvé');
      err.status = 404;
      throw err;
    }
    return lot;
  }

  async create(data) {
    const { age } = data;
    if (age !== null && age !== undefined && (age < 0 || age > 12)) {
      const err = new Error("L'âge doit être entre 0 et 12");
      err.status = 400;
      throw err;
    }
    return Lot.create(this.pool, data);
  }

  async update(id, data) {
    const { age } = data;
    if (age !== null && age !== undefined && (age < 0 || age > 12)) {
      const err = new Error("L'âge doit être entre 0 et 12");
      err.status = 400;
      throw err;
    }
    const lot = await Lot.update(this.pool, id, data);
    if (!lot) {
      const err = new Error('Lot non trouvé');
      err.status = 404;
      throw err;
    }
    return lot;
  }

  async delete(id) {
    const lot = await Lot.delete(this.pool, id);
    if (!lot) {
      const err = new Error('Lot non trouvé');
      err.status = 404;
      throw err;
    }
    return { message: 'Lot supprimé' };
  }
}

module.exports = LotService;
