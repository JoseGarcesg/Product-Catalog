/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '../services/api';
import { Product, AppError } from '../types';

export function useProducts() {
  const productsQuery = useQuery<Product[], AppError>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    // Add realistic retry and refetch configurations
    retry: (failureCount, error) => {
      // Don't retry client errors (like 404), but retry server (5xx) or network drops
      if (error.type === 'client') return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes cache validity
  });

  const categoriesQuery = useQuery<string[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes cache validity
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    isFetchingProducts: productsQuery.isFetching,
    productsError: productsQuery.error,
    isProductsError: productsQuery.isError,
    refetchProducts: productsQuery.refetch,

    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
  };
}
