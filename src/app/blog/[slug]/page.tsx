import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles } from "../getAllArticles";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const articles = await getAllArticles();
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.tags,
    openGraph: {
      title: article.title,
      description: article.tags,
      images: article.image ? [article.image] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.tags,
      images: article.image ? [article.image] : [],
    },
  };
}





const ArticlePage = async ({ params }: { params: { slug: string } }) => {
  const articles = await getAllArticles();
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return notFound();

  // Render the article and the edit form (client component)
  return (
    <article className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 text-sm mb-4">{article.date}</p>
      {article.image && (
        <div className="mb-6">
          {article.image.startsWith("data:") || article.image.startsWith("http") ? (
            <img src={article.image} alt={article.title} className="rounded w-full max-h-96 object-cover" />
          ) : (
            <img src={article.image} alt={article.title} width={800} height={400} className="rounded w-full max-h-96 object-cover" />
          )}
        </div>
      )}
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
      {/* Edit form only available in admin, not in public view */}
    </article>
  );
};

export default ArticlePage;
