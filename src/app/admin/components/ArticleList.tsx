"use client";
import { useState, useEffect } from "react";
import type { Article } from "@/lib/types";
import EditArticleForm from "../../blog/components/EditArticleForm";

interface ArticleListProps {
  onRefresh: () => void;
}

export default function ArticleList({ onRefresh }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/articles");
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEditSuccess = () => {
    setSelectedSlug(null);
    fetchArticles();
    onRefresh();
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchArticles();
        onRefresh();
      } else {
        alert("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article");
    }
  };

  if (isLoading) {
    return <div>Loading articles...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mt-12 mb-4">Manage Articles ({articles.length})</h2>
      {articles.length === 0 ? (
        <p className="text-gray-500">No articles found.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.slug} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <button
                    className="text-lg font-semibold hover:underline text-left"
                    onClick={() => setSelectedSlug(selectedSlug === article.slug ? null : article.slug)}
                  >
                    {article.title}
                  </button>
                  <p className="text-sm text-gray-600">{article.date} • {article.tags}</p>
                </div>
                <button
                  onClick={() => handleDelete(article.slug)}
                  className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
              
              {selectedSlug === article.slug && (
                <EditArticleForm
                  article={article}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setSelectedSlug(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
