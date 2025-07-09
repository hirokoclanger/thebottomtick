import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllArticles } from "./getAllArticles";

const TagSearchOverlay = dynamic(() => import("./TagSearchOverlay"), { ssr: false });

export default function BlogIndexWrapper() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  // Fetch articles on mount
  useEffect(() => {
    (async () => {
      const articles = await getAllArticles();
      setAllArticles(articles);
      setFiltered(articles);
    })();
  }, []);

  // Filter articles when searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(allArticles);
    } else {
      setFiltered(
        allArticles.filter(article =>
          (article.tags || "")
            .toLowerCase()
            .split(/[, ]+/)
            .some((tag: string) => tag && tag.toLowerCase() === searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allArticles]);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <TagSearchOverlay onSearch={setSearchTerm} />
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-12">
        {filtered.map((article, i) => (
          <li key={article.slug} className="border-b pb-8">
            <div className={`flex flex-col sm:flex-row ${article.image ? (i % 2 === 1 ? 'sm:flex-row-reverse' : '') : ''} items-stretch gap-0 bg-white rounded shadow overflow-hidden`}>
              {article.image && article.image !== 'sdf' && article.image !== 'pdf' && article.image !== 'D' ? (
                <div className="flex-shrink-0 w-full sm:w-56 h-[120px] sm:h-auto sm:min-h-[120px] max-h-[180px] overflow-hidden flex items-center justify-center">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : null}
              <div className="flex-1 w-full p-4 flex flex-col justify-center">
                <Link href={`/blog/${article.slug}`}
                  className="text-lg sm:text-xl font-bold text-[#222] hover:underline">
                  {article.title}
                </Link>
                <p className="text-gray-500 text-xs mt-1 mb-1">{article.date}</p>
                <p className="text-gray-700 text-sm mb-2">
                  {article.content.replace(/<[^>]+>/g, "").slice(0, 150)}{article.content.replace(/<[^>]+>/g, "").length > 150 ? "..." : ""}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
