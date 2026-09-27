import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize = 12,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const nextPage = () => {
    if (safePage < totalPages) setCurrentPage(safePage + 1);
  };

  const prevPage = () => {
    if (safePage > 1) setCurrentPage(safePage - 1);
  };

  const setPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return {
    currentPage: safePage,
    totalPages,
    pageSize,
    nextPage,
    prevPage,
    setPage,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}
