import { useMemo } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  maxVisiblePages?: number;
}

export interface PaginationRange {
  type: 'page' | 'ellipsis' | 'start' | 'end';
  value?: number;
}

/**
 * Smart dynamic pagination hook
 * Handles pagination logic with intelligent page range calculation
 */
export const usePagination = ({ totalItems, itemsPerPage, currentPage, maxVisiblePages = 5 }: UsePaginationOptions) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationRange = useMemo(() => {
    const range: PaginationRange[] = [];

    // Handle edge case: no data
    if (totalPages === 0) {
      return range; // Return empty array
    }

    // Handle edge cases
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        range.push({ type: 'page', value: i });
      }
      return range;
    }

    // Always show first page
    range.push({ type: 'page', value: 1 });

    // Calculate start and end range
    const leftSiblings = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const rightSiblings = Math.min(totalPages, currentPage + Math.floor(maxVisiblePages / 2));

    // Add left ellipsis if needed
    if (leftSiblings > 2) {
      range.push({ type: 'ellipsis' });
    }

    // Add page range around current page
    for (let i = Math.max(2, leftSiblings); i <= Math.min(totalPages - 1, rightSiblings); i++) {
      range.push({ type: 'page', value: i });
    }

    // Add right ellipsis if needed
    if (rightSiblings < totalPages - 1) {
      range.push({ type: 'ellipsis' });
    }

    // Always show last page
    if (totalPages > 1) {
      range.push({ type: 'page', value: totalPages });
    }

    return range;
  }, [totalPages, currentPage, maxVisiblePages]);

  return {
    totalPages,
    currentPage,
    paginationRange,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems)
  };
};
