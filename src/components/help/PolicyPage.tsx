import React from 'react';
import ReactMarkdown from 'react-markdown';

interface PolicyArticle {
  id: string;
  title?: string;
  content: string;
}

export const PolicyPage = ({ articles }: { articles: PolicyArticle[] }) => {
  return (
    <div className="space-y-12">
      {articles.map((article) => (
        <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          {article.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              {article.title}
            </h2>
          )}
          <div className="prose prose-blue max-w-none text-gray-600 prose-headings:text-gray-800 prose-a:text-blue-600">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};
