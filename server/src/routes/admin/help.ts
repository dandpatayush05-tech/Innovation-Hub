import { Router } from 'express';
import { getCategories, getArticles, createArticle, updateArticle, deleteArticle, reorderArticles } from '../../controllers/admin/helpAdminController';
import { validate } from '../../middleware/validate';
import { articleSchema, reorderArticlesSchema } from '../../validators/helpValidators';
import { asyncWrapper } from '../../utils/asyncWrapper';

const router = Router();

router.get('/categories', asyncWrapper(getCategories));
router.get('/articles', asyncWrapper(getArticles));
router.post('/articles', validate(articleSchema), asyncWrapper(createArticle));
router.put('/articles/:id', validate(articleSchema), asyncWrapper(updateArticle));
router.delete('/articles/:id', asyncWrapper(deleteArticle));
router.patch('/articles/reorder', validate(reorderArticlesSchema), asyncWrapper(reorderArticles));

export default router;
