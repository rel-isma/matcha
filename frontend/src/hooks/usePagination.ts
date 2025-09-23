// usePagination hook
'use client';

import { useState, useMemo } from 'react';

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const usePagination = <T>(
  items: T[],
  itemsPerPage: number = 10
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage
  };
};
