"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/articles");
      const data = await res.json();
      setArticles(data);
    })();
  }, []);

  // Filter articles by tag if q is present
  const filteredArticles = q
    ? articles.filter(article =>
        (article.tags || "")
          .split(',')
          .map((tag: string) => tag.trim().toLowerCase())
          .includes(q.trim().toLowerCase())
      )
    : articles;

  return (
    <div className="w-[80vw] max-w-4xl mx-auto py-12">
      <SearchModal articles={articles} />
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-8">
        {filteredArticles.map((article, i) => (
          <li key={article.slug} className={`border-b pb-6 flex items-start gap-4 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            {article.image && (article.image.startsWith('http') || article.image.startsWith('data:image')) && (
              <img
                src={article.image}
                alt={article.title}
                className={`w-20 h-14 object-cover rounded shadow-sm flex-shrink-0 mt-1 ${i % 2 === 1 ? 'ml-4' : 'mr-4'}`}
                width={80}
                height={56}
                loading="lazy"
              />
            )}
            <div className="flex-1">
              <Link href={`/blog/${article.slug}`}
                className="text-2xl font-semibold hover:underline">
                {article.title}
              </Link>
              <p className="text-gray-600 text-sm mt-1">{article.date}</p>
              <p className="mt-2 text-gray-800">{article.tags}</p>
              {article.content && (
                <p className="mt-2 text-gray-700 text-sm">
                  {article.content.replace(/<[^>]+>/g, "").slice(0, 150)}
                  {article.content.replace(/<[^>]+>/g, "").length > 150 ? "..." : ""}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}