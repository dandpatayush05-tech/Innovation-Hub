import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, streamNotifications } from '../controllers/notificationController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.get('/', authGuard, asyncWrapper(getNotifications));
router.get('/stream', authGuard, streamNotifications);
router.post('/mark-all-read', authGuard, asyncWrapper(markAllAsRead));
router.patch('/:id/read', authGuard, asyncWrapper(markAsRead));

export default router;
