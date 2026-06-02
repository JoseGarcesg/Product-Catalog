/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface AppError {
  type: 'network' | 'server' | 'client' | 'unknown';
  message: string;
  status?: number;
}
