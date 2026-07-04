export type { User, Article, Tag, Comment, Role, ArticleStatus, TagCategory } from "@prisma/client";

export interface ArticleWithAuthor {
  id: string;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  pricePt: number;
  viewCount: number;
  likeCount: number;
  publishedAt: Date | null;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      category: string;
    };
  }>;
  _count?: {
    purchases: number;
  };
}

export interface ArticleDetail extends ArticleWithAuthor {
  body: string;
  previewPosition: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
