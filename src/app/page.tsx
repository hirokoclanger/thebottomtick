import { getAllArticles, getArticlesByTag } from "@/lib/articles";
import ArticleCard from "./blog/components/ArticleCard";
import SearchModalWrapper from "./SearchModalWrapper";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const tag = typeof params.q === 'string' ? params.q : undefined;
  
  const articles = tag 
    ? await getArticlesByTag(tag)
    : await getAllArticles();

  return (
    <div className="w-[80vw] max-w-4xl mx-auto py-12">
      <SearchModalWrapper />
      <h1 className="text-3xl font-bold mb-8">
        Blog
        {tag && (
          <span className="text-xl font-normal text-gray-600 ml-2">
            - Filtered by: {tag}
          </span>
        )}
      </h1>
      {articles.length === 0 ? (
        <p className="text-gray-600">No articles found{tag ? ` with tag "${tag}"` : ''}.</p>
      ) : (
        <ul className="space-y-8">
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}