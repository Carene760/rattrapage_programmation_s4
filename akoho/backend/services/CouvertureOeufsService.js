const CouvertureOeufs = require('../models/CouvertureOeufs');

class CouvertureOeufsService {
  constructor(pool) {
    this.pool = pool;
  }

  async getAll() {
    return CouvertureOeufs.findAll(this.pool);
  }

  async create({ id_lot_oeufs, date_couverture }) {
    // 1. Fetch the oeufs lot
    const oeufsLot = await CouvertureOeufs.findOeufsWithRace(this.pool, id_lot_oeufs);
    if (!oeufsLot) {
      const err = new Error("Lot d'oeufs non trouvé");
      err.status = 404;
      throw err;
    }

    // 2. Check not already covered
    const count = await CouvertureOeufs.countByLotOeufs(this.pool, id_lot_oeufs);
    if (count > 0) {
      const err = new Error("Ce lot d'oeufs est déjà en couverture");
      err.status = 400;
      throw err;
    }

    // 3. Validate date >= egg lot date
    if (new Date(date_couverture) < new Date(oeufsLot.date_recensement)) {
      const err = new Error(
        "La date de couverture ne peut pas être antérieure à la date du lot d'oeufs (" +
          new Date(oeufsLot.date_recensement).toISOString().substring(0, 10) +
          ')'
      );
      err.status = 400;
      throw err;
    }

    // 4. Insert couverture (nbr_oeufs = whole lot)
    return CouvertureOeufs.create(this.pool, {
      id_lot_oeufs,
      nbr_oeufs: oeufsLot.nbr_oeufs,
      date_couverture,
    });
  }
}

module.exports = CouvertureOeufsService;
