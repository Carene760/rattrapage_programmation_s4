const express = require('express');

function createEclosionOeufsRoutes(controller) {
  const router = express.Router();

  router.get('/', (req, res, next) => controller.getAll(req, res, next));
  router.post('/', (req, res, next) => controller.create(req, res, next));

  return router;
}

module.exports = createEclosionOeufsRoutes;
