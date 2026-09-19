import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  title: string;
}

interface Article {
  id: string;
  category_id: string;
  type: 'faq_item' | 'policy_section' | 'static_page';
  question?: string;
  title?: string;
  content: string;
  display_order: number;
  is_published: boolean;
}

export const HelpManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, artsRes] = await Promise.all([
        api.get('/api/admin/help/categories'),
        api.get('/api/admin/help/articles')
      ]);
      setCategories(catsRes.data);
      setArticles(artsRes.data);
      if (catsRes.data.length > 0 && !selectedCategory) {
        setSelectedCategory(catsRes.data[0].id);
      }
    } catch (err) {
      error('Failed to load help content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingArticle) return;
    try {
      if (editingArticle.id) {
        await api.put(`/api/admin/help/articles/${editingArticle.id}`, {
          categoryId: editingArticle.category_id,
          type: editingArticle.type,
          question: editingArticle.question,
          title: editingArticle.title,
          content: editingArticle.content,
          displayOrder: editingArticle.display_order,
          isPublished: editingArticle.is_published
        });
        success('Article updated');
      } else {
        await api.post('/api/admin/help/articles', {
          categoryId: editingArticle.category_id,
          type: editingArticle.type,
          question: editingArticle.question,
          title: editingArticle.title,
          content: editingArticle.content || '',
          displayOrder: editingArticle.display_order || 0,
          isPublished: editingArticle.is_published ?? true
        });
        success('Article created');
      }
      setEditingArticle(null);
      fetchData();
    } catch (err) {
      error('Failed to save article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await api.delete(`/api/admin/help/articles/${id}`);
      success('Article deleted');
      fetchData();
    } catch (err) {
      error('Failed to delete article');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

  const currentArticles = articles.filter(a => a.category_id === selectedCategory && a.is_published !== false); // hide soft deleted in simple view

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-64 space-y-2 border-r pr-4">
          <h3 className="font-semibold text-gray-700 mb-4">Categories</h3>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {editingArticle ? (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h3 className="font-semibold">{editingArticle.id ? 'Edit Article' : 'New Article'}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={editingArticle.type}
                  onChange={e => setEditingArticle({...editingArticle, type: e.target.value as any})}
                >
                  <option value="faq_item">FAQ Item (Q&A)</option>
                  <option value="policy_section">Policy Section</option>
                  <option value="static_page">Static Page</option>
                </select>
              </div>

              {editingArticle.type === 'faq_item' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={editingArticle.question || ''} onChange={e => setEditingArticle({...editingArticle, question: e.target.value})} />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                <textarea 
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  rows={8}
                  value={editingArticle.content || ''} 
                  onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setEditingArticle(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Articles</h3>
                <button 
                  onClick={() => setEditingArticle({ category_id: selectedCategory!, type: 'faq_item', is_published: true, display_order: currentArticles.length * 10 })}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" /> Add Article
                </button>
              </div>

              <div className="space-y-2">
                {currentArticles.map(article => (
                  <div key={article.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border">
                    <div>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded mb-1 inline-block">{article.type}</span>
                      <p className="font-medium text-gray-800">{article.type === 'faq_item' ? article.question : article.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingArticle(article)} className="p-2 text-gray-500 hover:text-blue-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                {currentArticles.length === 0 && <p className="text-gray-500 text-sm py-4">No articles in this category.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
