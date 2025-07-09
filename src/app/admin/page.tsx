"use client";
import { useState } from "react";
import AdminAuth from "./AdminAuth";
import NewArticleForm from "../blog/new/page";
import { getAllArticles } from "../blog/getAllArticles";
import EditArticleForm from "../blog/[slug]/EditArticleForm";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  async function loadArticles() {
    const res = await fetch("/api/admin-articles");
    setArticles(await res.json());
  }

  if (!authed) return <AdminAuth onAuth={() => { setAuthed(true); loadArticles(); }} />;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <NewArticleForm onPost={loadArticles} />
      <h2 className="text-xl font-bold mt-12 mb-4">Edit Articles</h2>
      <ul className="space-y-4">
        {articles.map((a) => (
          <li key={a.slug} className="border-b pb-2">
            <button className="text-lg font-semibold hover:underline" onClick={() => setSelected(a.slug)}>{a.title}</button>
            {selected === a.slug && (
              <EditArticleForm article={a} onSave={() => { setSelected(null); loadArticles(); }} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
