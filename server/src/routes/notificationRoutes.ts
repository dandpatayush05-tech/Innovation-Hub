import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.use(authGuard);

router.get('/', asyncWrapper(getNotifications));
router.post('/mark-all-read', asyncWrapper(markAllAsRead));
router.patch('/:id/read', asyncWrapper(markAsRead));

export default router;
