const express = require('express');

function createSituationRoutes(situationController) {
  const router = express.Router();

  router.get('/', (req, res, next) => situationController.getSituation(req, res, next));

  return router;
}

module.exports = createSituationRoutes;
