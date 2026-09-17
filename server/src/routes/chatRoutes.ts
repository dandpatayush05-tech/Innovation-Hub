import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController';
import { authGuard } from '../middleware/authGuard';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../validators/chatValidator';

const router = Router();

router.use(authGuard);

router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', validate(sendMessageSchema), sendMessage);

export default router;
