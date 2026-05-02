export const parsePagination = (query: Record<string, unknown>) => {
  const page  = Math.max(1, Number(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export const buildMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
