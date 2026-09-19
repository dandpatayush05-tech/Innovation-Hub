import { Router } from 'express';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController';
import { createContactRequest, getContactRequests, updateContactStatus } from '../controllers/contactController';
import { getFaqs, createFaq, updateFaq, deleteFaq, getRules, createRule, updateRule, deleteRule } from '../controllers/tripController';
import { getNotifications, markAsRead, markAllAsRead, streamNotifications } from '../controllers/notificationController';
import { validate } from '../middleware/validate';
import { createReviewSchema, updateReviewSchema, createContactSchema } from '../validators/tripValidator';
import { authGuard } from '../middleware/authGuard';
import { requireRole } from '../middleware/requireRole';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Reviews
router.get('/reviews', asyncWrapper(getReviews));
router.post('/reviews', authGuard, validate(createReviewSchema), asyncWrapper(createReview));
router.patch('/reviews/:id', authGuard, validate(updateReviewSchema), asyncWrapper(updateReview));
router.delete('/reviews/:id', authGuard, asyncWrapper(deleteReview));

// Contact
router.post('/contact', validate(createContactSchema), asyncWrapper(createContactRequest));
router.get('/contact', authGuard, requireRole('admin'), asyncWrapper(getContactRequests));
router.patch('/contact/:id/status', authGuard, requireRole('admin'), asyncWrapper(updateContactStatus));

// Notifications
router.get('/notifications', authGuard, asyncWrapper(getNotifications));
router.get('/notifications/stream', authGuard, streamNotifications);
router.post('/notifications/mark-all-read', authGuard, asyncWrapper(markAllAsRead));
router.patch('/notifications/:id/read', authGuard, asyncWrapper(markAsRead));

// FAQs
router.get('/faqs', asyncWrapper(getFaqs));
router.post('/faqs', authGuard, requireRole('admin'), asyncWrapper(createFaq));
router.patch('/faqs/:id', authGuard, requireRole('admin'), asyncWrapper(updateFaq));
router.delete('/faqs/:id', authGuard, requireRole('admin'), asyncWrapper(deleteFaq));

// Rules
router.get('/rules', asyncWrapper(getRules));
router.post('/rules', authGuard, requireRole('admin'), asyncWrapper(createRule));
router.patch('/rules/:id', authGuard, requireRole('admin'), asyncWrapper(updateRule));
router.delete('/rules/:id', authGuard, requireRole('admin'), asyncWrapper(deleteRule));

export default router;
