import { getArticleById } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
import type { Metadata } from "next";

interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
}

interface UseSEOMetadataOptions {
  id: string;
  baseUrl?: string;
  defaultImage?: string;
}

export function useSEOMetadata({
  id,
  baseUrl = "https://yourdomain.com",
  defaultImage = "/default-social-image.png",
}: UseSEOMetadataOptions): Metadata | null {
  const article = getArticleById(id);
  const mdxContent = getArticleMDXContent(id);

  if (!article || !mdxContent) {
    return null;
  }

  // Get SEO metadata from frontmatter if available
  const seo = mdxContent.metadata.seo as SEOMetadata | undefined;

  // Use SEO metadata if available, otherwise fall back to article metadata
  const title = seo?.title || article.title;
  const description = seo?.description || article.description;
  const keywords = seo?.keywords || article.tags;
  const image = seo?.image || article.image || defaultImage;

  // Generate canonical URL based on article type
  const canonical =
    seo?.canonical ||
    `${baseUrl}/${article.type === "blog" ? "blog" : "projects"}/${id}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: image
        ? [
            {
              url: image,
              alt: article.imageAltText || title,
              width: 1200,
              height: 630,
            },
          ]
        : [],
      type: "article",
      url: canonical,
      siteName: "Noah Paige Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
      creator: "@noahpaige", // Update with your actual Twitter handle
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Helper function for generating metadata in page components (doesn't use hooks)
export async function generateArticleMetadata(
  id: string,
  baseUrl: string = "https://yourdomain.com",
  defaultImage: string = "/default-social-image.png"
): Promise<Metadata> {
  const article = getArticleById(id);
  const mdxContent = getArticleMDXContent(id);

  if (!article || !mdxContent) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  // Get SEO metadata from frontmatter if available
  const seo = mdxContent.metadata.seo as SEOMetadata | undefined;

  // Use SEO metadata if available, otherwise fall back to article metadata
  const title = seo?.title || article.title;
  const description = seo?.description || article.description;
  const keywords = seo?.keywords || article.tags;
  const image = seo?.image || article.image || defaultImage;

  // Generate canonical URL based on article type
  const canonical =
    seo?.canonical ||
    `${baseUrl}/${article.type === "blog" ? "blog" : "projects"}/${id}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: image
        ? [
            {
              url: image,
              alt: article.imageAltText || title,
              width: 1200,
              height: 630,
            },
          ]
        : [],
      type: "article",
      url: canonical,
      siteName: "Noah Paige Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
      creator: "@noahpaige", // Update with your actual Twitter handle
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
