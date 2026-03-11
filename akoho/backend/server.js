const express = require('express');
const cors = require('cors');

const Database = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Services
const RaceService = require('./services/RaceService');
const LotService = require('./services/LotService');
const NutritionService = require('./services/NutritionService');
const DecesService = require('./services/DecesService');
const OeufsService = require('./services/OeufsService');
const CouvertureOeufsService = require('./services/CouvertureOeufsService');
const EclosionOeufsService = require('./services/EclosionOeufsService');
const SituationService = require('./services/SituationService');

// Controllers
const RaceController = require('./controllers/RaceController');
const LotController = require('./controllers/LotController');
const NutritionController = require('./controllers/NutritionController');
const DecesController = require('./controllers/DecesController');
const OeufsController = require('./controllers/OeufsController');
const CouvertureOeufsController = require('./controllers/CouvertureOeufsController');
const EclosionOeufsController = require('./controllers/EclosionOeufsController');
const SituationController = require('./controllers/SituationController');

// Routes
const createRaceRoutes = require('./routes/raceRoutes');
const createLotRoutes = require('./routes/lotRoutes');
const createNutritionRoutes = require('./routes/nutritionRoutes');
const createDecesRoutes = require('./routes/decesRoutes');
const createOeufsRoutes = require('./routes/oeufsRoutes');
const createCouvertureOeufsRoutes = require('./routes/couvertureOeufsRoutes');
const createEclosionOeufsRoutes = require('./routes/eclosionOeufsRoutes');
const createSituationRoutes = require('./routes/situationRoutes');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

async function start() {
  const pool = await Database.getPool();

  // Instantiate services
  const raceService = new RaceService(pool);
  const lotService = new LotService(pool);
  const nutritionService = new NutritionService(pool);
  const decesService = new DecesService(pool);
  const oeufsService = new OeufsService(pool);
  const couvertureOeufsService = new CouvertureOeufsService(pool);
  const eclosionOeufsService = new EclosionOeufsService(pool);
  const situationService = new SituationService(pool);

  // Instantiate controllers
  const raceController = new RaceController(raceService);
  const lotController = new LotController(lotService);
  const nutritionController = new NutritionController(nutritionService);
  const decesController = new DecesController(decesService);
  const oeufsController = new OeufsController(oeufsService);
  const situationController = new SituationController(situationService);
  const couvertureOeufsController = new CouvertureOeufsController(couvertureOeufsService);
  const eclosionOeufsController = new EclosionOeufsController(eclosionOeufsService);

  // Mount routes
  app.use('/api/race', createRaceRoutes(raceController));
  app.use('/api/lot', createLotRoutes(lotController));
  app.use('/api/nutrition', createNutritionRoutes(nutritionController));
  app.use('/api/deces', createDecesRoutes(decesController));
  app.use('/api/situation', createSituationRoutes(situationController));
  app.use('/api/oeufs', createOeufsRoutes(oeufsController));
  app.use('/api/couverture-oeufs', createCouvertureOeufsRoutes(couvertureOeufsController));
  app.use('/api/eclosion-oeufs', createEclosionOeufsRoutes(eclosionOeufsController));

  // Error handling middleware (must be after routes)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
