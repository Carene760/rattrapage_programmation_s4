const express = require('express');

function createDecesRoutes(controller) {
  const router = express.Router();

  router.get('/', (req, res, next) => controller.getAll(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.post('/', (req, res, next) => controller.create(req, res, next));
  router.put('/:id', (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

  return router;
}

module.exports = createDecesRoutes;
