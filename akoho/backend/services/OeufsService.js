const Oeufs = require('../models/Oeufs');

class OeufsService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return Oeufs.findAll(this.pool);
  }

  async getById(id) {
    const oeufs = await Oeufs.findById(this.pool, id);
    if (!oeufs) {
      const err = new Error("Lot d'oeufs non trouvé");
      err.status = 404;
      throw err;
    }
    return oeufs;
  }

  async create(data) {
    const { nbr_oeufs } = data;
    if (nbr_oeufs !== null && nbr_oeufs !== undefined && nbr_oeufs < 0) {
      const err = new Error("Le nombre d'oeufs doit être positif");
      err.status = 400;
      throw err;
    }
    return Oeufs.create(this.pool, data);
  }

  async update(id, data) {
    const { nbr_oeufs } = data;
    if (nbr_oeufs !== null && nbr_oeufs !== undefined && nbr_oeufs < 0) {
      const err = new Error("Le nombre d'oeufs doit être positif");
      err.status = 400;
      throw err;
    }
    const oeufs = await Oeufs.update(this.pool, id, data);
    if (!oeufs) {
      const err = new Error("Lot d'oeufs non trouvé");
      err.status = 404;
      throw err;
    }
    return oeufs;
  }

  async delete(id) {
    const oeufs = await Oeufs.delete(this.pool, id);
    if (!oeufs) {
      const err = new Error("Lot d'oeufs non trouvé");
      err.status = 404;
      throw err;
    }
    return { message: "Lot d'oeufs supprimé" };
  }
}

module.exports = OeufsService;
