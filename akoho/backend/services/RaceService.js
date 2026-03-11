const Race = require('../models/Race');

class RaceService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return Race.findAll(this.pool);
  }

  async getById(id) {
    const race = await Race.findById(this.pool, id);
    if (!race) {
      const err = new Error('Race non trouvée');
      err.status = 404;
      throw err;
    }
    return race;
  }

  async create(data) {
    return Race.create(this.pool, data);
  }

  async update(id, data) {
    const race = await Race.update(this.pool, id, data);
    if (!race) {
      const err = new Error('Race non trouvée');
      err.status = 404;
      throw err;
    }
    return race;
  }

  async delete(id) {
    const race = await Race.delete(this.pool, id);
    if (!race) {
      const err = new Error('Race non trouvée');
      err.status = 404;
      throw err;
    }
    return { message: 'Race supprimée' };
  }
}

module.exports = RaceService;
