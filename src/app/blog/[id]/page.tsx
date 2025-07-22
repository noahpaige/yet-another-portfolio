import Link from "next/link";
import { getArticleById } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
import MDXRenderer from "@/components/mdx/mdx-renderer";
import { notFound } from "next/navigation";

interface BlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;
  const article = getArticleById(id);
  const mdxContent = getArticleMDXContent(id);

  if (!article || !mdxContent || article.type !== "blog") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {article.title}
            </h1>
            <p className="text-gray-300 text-lg mb-4">{article.description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>📅 {article.date}</span>
              <span>⏱️ {article.readTime} min read</span>
              {article.tags && article.tags.length > 0 && (
                <span>🏷️ {article.tags.join(", ")}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="glass-layer p-8 rounded-xl">
            <MDXRenderer content={mdxContent} />
          </div>

          {/* Back to blogs */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 text-white rounded-lg transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
