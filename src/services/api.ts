/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, AppError } from '../types';

const API_BASE_URL = 'https://fakestoreapi.com';

/**
 * Custom function to fetch products with comprehensive error handling.
 */
export async function fetchProducts(): Promise<Product[]> {
  // Check browser online status before even attempting fetch
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw {
      type: 'network',
      message: 'No tienes conexión a Internet. Por favor, verifica tu red e intenta de nuevo.',
    } as AppError;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      const status = response.status;
      if (status >= 500) {
        throw {
          type: 'server',
          message: `Error del servidor (${status}). El servicio de FakeStore está temporalmente fuera de servicio.`,
          status,
        } as AppError;
      } else {
        throw {
          type: 'client',
          message: `Error al obtener los productos (${status}). Por favor, intenta más tarde.`,
          status,
        } as AppError;
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // If it's already a structured AppError, rethrow it
    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }

    // Otherwise, categorize standard fetch errors (most likely network dropouts during active req)
    const isNetworkError = 
      error instanceof TypeError || 
      error.message?.toLowerCase().includes('failed to fetch') || 
      error.name === 'TypeError';

    if (isNetworkError) {
      throw {
        type: 'network',
        message: 'No se pudo conectar al servidor. Revisa tu red o desactiva bloqueadores de anuncios.',
      } as AppError;
    }

    throw {
      type: 'unknown',
      message: error.message || 'Ha ocurrido un error inesperado al cargar el catálogo.',
    } as AppError;
  }
}

/**
 * Optional: Fetch categories to enable dynamic filtering
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    // Fallback standard categories in case API is flaky
    return ['electronics', 'jewelery', "men's clothing", "women's clothing"];
  }
}
