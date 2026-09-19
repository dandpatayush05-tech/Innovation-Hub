import { Router } from 'express';
import { searchTransport } from '../controllers/transportController';
import { validate } from '../middleware/validate';
import { searchTransportSchema } from '../validators/transportValidator';

const router = Router();

// unified transport search across flights, buses, autos
router.post('/transport/search', validate(searchTransportSchema), searchTransport);

export default router;
