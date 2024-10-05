import { PaginationOptions, PaginatedResponse } from 'src/types';

export const paginateResults = <T>(
  data: T[],
  options: PaginationOptions
): PaginatedResponse<T> => {
  const { page, limit } = options;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = data.slice(startIndex, endIndex);
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: results,
    total,
    page,
    limit,
    totalPages,
  };
};
