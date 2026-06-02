/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductCatalog from './components/ProductCatalog';

// Instantiate the Query Client for React Query caching and management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid excessive refetch attempts to preserve API rate limits
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen">
        <ProductCatalog />
      </div>
    </QueryClientProvider>
  );
}
