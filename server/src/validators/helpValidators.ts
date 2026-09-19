import { z } from 'zod';

export const articleSchema = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(['faq_item', 'policy_section', 'static_page']),
  question: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  content: z.string().max(50000), // Sane max length for policies
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true)
}).refine((data) => {
  if (data.type === 'faq_item') {
    return !!data.question;
  } else {
    return !!data.title;
  }
}, {
  message: "FAQ items require a question, policies/pages require a title",
  path: ["question"] // or title
});

export const reorderArticlesSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    displayOrder: z.number().int()
  }))
});
