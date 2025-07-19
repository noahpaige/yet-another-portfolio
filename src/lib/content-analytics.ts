// Basic content analytics for portfolio insights
import {
  getAllProjectMDXContent,
  type MDXContent,
} from "@/generated/project-mdx-index";

export interface ContentAnalytics {
  totalProjects: number;
  totalReadTime: number;
  averageReadTime: number;
  categories: Array<{
    name: string;
    count: number;
    totalReadTime: number;
    averageReadTime: number;
  }>;
  difficulties: Array<{
    level: string;
    count: number;
    totalReadTime: number;
    averageReadTime: number;
  }>;
  technologies: Array<{
    name: string;
    count: number;
    projects: string[];
  }>;
  tags: Array<{
    name: string;
    count: number;
    projects: string[];
  }>;
  topProjects: Array<{
    id: string;
    title: string;
    readTime: number;
    category: string;
    difficulty: string;
  }>;
  contentDistribution: {
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byTechnology: Record<string, number>;
  };
}

/**
 * Generate comprehensive content analytics
 */
export function generateContentAnalytics(): ContentAnalytics {
  const allProjects = getAllProjectMDXContent();

  // Basic counts
  const totalProjects = allProjects.length;
  const totalReadTime = allProjects.reduce(
    (sum, { content }) => sum + (content.metadata.readTime || 0),
    0
  );
  const averageReadTime =
    totalProjects > 0 ? Math.round(totalReadTime / totalProjects) : 0;

  // Category analytics
  const categoryMap = new Map<
    string,
    { count: number; readTime: number; projects: string[] }
  >();
  allProjects.forEach(({ id, content }) => {
    const category = content.metadata.category || "Uncategorized";
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, readTime: 0, projects: [] });
    }
    const cat = categoryMap.get(category)!;
    cat.count++;
    cat.readTime += content.metadata.readTime || 0;
    cat.projects.push(id);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalReadTime: data.readTime,
      averageReadTime: Math.round(data.readTime / data.count),
    }))
    .sort((a, b) => b.count - a.count);

  // Difficulty analytics
  const difficultyMap = new Map<
    string,
    { count: number; readTime: number; projects: string[] }
  >();
  allProjects.forEach(({ id, content }) => {
    const difficulty = content.metadata.difficulty || "Unknown";
    if (!difficultyMap.has(difficulty)) {
      difficultyMap.set(difficulty, { count: 0, readTime: 0, projects: [] });
    }
    const diff = difficultyMap.get(difficulty)!;
    diff.count++;
    diff.readTime += content.metadata.readTime || 0;
    diff.projects.push(id);
  });

  const difficulties = Array.from(difficultyMap.entries())
    .map(([level, data]) => ({
      level,
      count: data.count,
      totalReadTime: data.readTime,
      averageReadTime: Math.round(data.readTime / data.count),
    }))
    .sort((a, b) => b.count - a.count);

  // Technology analytics
  const technologyMap = new Map<
    string,
    { count: number; projects: string[] }
  >();
  allProjects.forEach(({ id, content }) => {
    const technologies = content.metadata.technologies || [];
    technologies.forEach((tech) => {
      if (!technologyMap.has(tech)) {
        technologyMap.set(tech, { count: 0, projects: [] });
      }
      const techData = technologyMap.get(tech)!;
      techData.count++;
      if (!techData.projects.includes(id)) {
        techData.projects.push(id);
      }
    });
  });

  const technologies = Array.from(technologyMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      projects: data.projects,
    }))
    .sort((a, b) => b.count - a.count);

  // Tag analytics
  const tagMap = new Map<string, { count: number; projects: string[] }>();
  allProjects.forEach(({ id, content }) => {
    const tags = content.metadata.tags || [];
    tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { count: 0, projects: [] });
      }
      const tagData = tagMap.get(tag)!;
      tagData.count++;
      if (!tagData.projects.includes(id)) {
        tagData.projects.push(id);
      }
    });
  });

  const tags = Array.from(tagMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      projects: data.projects,
    }))
    .sort((a, b) => b.count - a.count);

  // Top projects by read time
  const topProjects = allProjects
    .map(({ id, content }) => ({
      id,
      title: content.metadata.title || "Untitled",
      readTime: content.metadata.readTime || 0,
      category: content.metadata.category || "Uncategorized",
      difficulty: content.metadata.difficulty || "Unknown",
    }))
    .sort((a, b) => b.readTime - a.readTime)
    .slice(0, 5);

  // Content distribution
  const contentDistribution = {
    byCategory: Object.fromEntries(
      Array.from(categoryMap.entries()).map(([name, data]) => [
        name,
        data.count,
      ])
    ),
    byDifficulty: Object.fromEntries(
      Array.from(difficultyMap.entries()).map(([name, data]) => [
        name,
        data.count,
      ])
    ),
    byTechnology: Object.fromEntries(
      Array.from(technologyMap.entries()).map(([name, data]) => [
        name,
        data.count,
      ])
    ),
  };

  return {
    totalProjects,
    totalReadTime,
    averageReadTime,
    categories,
    difficulties,
    technologies,
    tags,
    topProjects,
    contentDistribution,
  };
}

/**
 * Get analytics for a specific category
 */
export function getCategoryAnalytics(category: string) {
  const allProjects = getAllProjectMDXContent();
  const categoryProjects = allProjects.filter(
    ({ content }) => content.metadata.category === category
  );

  if (categoryProjects.length === 0) {
    return null;
  }

  const totalReadTime = categoryProjects.reduce(
    (sum, { content }) => sum + (content.metadata.readTime || 0),
    0
  );
  const averageReadTime = Math.round(totalReadTime / categoryProjects.length);

  const difficulties = new Map<string, number>();
  const technologies = new Map<string, number>();
  const tags = new Map<string, number>();

  categoryProjects.forEach(({ content }) => {
    // Count difficulties
    const difficulty = content.metadata.difficulty || "Unknown";
    difficulties.set(difficulty, (difficulties.get(difficulty) || 0) + 1);

    // Count technologies
    const techs = content.metadata.technologies || [];
    techs.forEach((tech) => {
      technologies.set(tech, (technologies.get(tech) || 0) + 1);
    });

    // Count tags
    const projectTags = content.metadata.tags || [];
    projectTags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });

  return {
    category,
    projectCount: categoryProjects.length,
    totalReadTime,
    averageReadTime,
    difficulties: Array.from(difficulties.entries()).map(([level, count]) => ({
      level,
      count,
    })),
    technologies: Array.from(technologies.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count })),
    projects: categoryProjects.map(({ id, content }) => ({
      id,
      title: content.metadata.title || "Untitled",
      readTime: content.metadata.readTime || 0,
      difficulty: content.metadata.difficulty || "Unknown",
    })),
  };
}

/**
 * Get content performance insights
 */
export function getContentInsights() {
  const analytics = generateContentAnalytics();

  const insights = {
    totalContent: analytics.totalProjects,
    totalReadTime: analytics.totalReadTime,
    averageReadTime: analytics.averageReadTime,
    mostPopularCategory: analytics.categories[0]?.name || "None",
    mostPopularTag: analytics.tags[0]?.name || "None",
    mostUsedTechnology: analytics.technologies[0]?.name || "None",
    longestRead: analytics.topProjects[0]?.title || "None",
    contentDiversity: {
      categories: analytics.categories.length,
      tags: analytics.tags.length,
      technologies: analytics.technologies.length,
      difficulties: analytics.difficulties.length,
    },
  };

  return insights;
}

/**
 * Get content recommendations based on a project
 */
export function getContentRecommendations(projectId: string) {
  const allProjects = getAllProjectMDXContent();
  const targetProject = allProjects.find(({ id }) => id === projectId);

  if (!targetProject) {
    return [];
  }

  const { content: targetContent } = targetProject;
  const recommendations: Array<{
    id: string;
    content: MDXContent;
    score: number;
    reason: string;
  }> = [];

  allProjects.forEach(({ id, content }) => {
    if (id === projectId) return; // Skip the target project

    let score = 0;
    const reasons: string[] = [];

    // Score by category
    if (content.metadata.category === targetContent.metadata.category) {
      score += 3;
      reasons.push("Same category");
    }

    // Score by tags
    const targetTags = targetContent.metadata.tags || [];
    const projectTags = content.metadata.tags || [];
    const commonTags = targetTags.filter((tag) => projectTags.includes(tag));
    if (commonTags.length > 0) {
      score += commonTags.length * 2;
      reasons.push(`Shared tags: ${commonTags.join(", ")}`);
    }

    // Score by difficulty
    if (content.metadata.difficulty === targetContent.metadata.difficulty) {
      score += 1;
      reasons.push("Same difficulty");
    }

    // Score by technologies
    const targetTechs = targetContent.metadata.technologies || [];
    const projectTechs = content.metadata.technologies || [];
    const commonTechs = targetTechs.filter((tech) =>
      projectTechs.some(
        (projectTech) =>
          projectTech.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(projectTech.toLowerCase())
      )
    );
    if (commonTechs.length > 0) {
      score += commonTechs.length;
      reasons.push(`Shared technologies: ${commonTechs.join(", ")}`);
    }

    if (score > 0) {
      recommendations.push({
        id,
        content,
        score,
        reason: reasons.join("; "),
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}
