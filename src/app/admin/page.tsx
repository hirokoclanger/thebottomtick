"use client";
import { useState } from "react";
import AdminAuth from "./components/AdminAuth";
import NewArticleForm from "../blog/components/NewArticleForm";
import ArticleList from "./components/ArticleList";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Create New Article</h2>
        <NewArticleForm onSuccess={handleRefresh} />
      </div>

      <ArticleList key={refreshKey} onRefresh={handleRefresh} />
    </div>
  );
}
