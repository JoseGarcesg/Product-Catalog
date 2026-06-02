/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  Heart,
  ShoppingBag,
  X,
  RotateCcw,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Product, SortOption } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductCatalog() {
  const {
    products,
    isLoadingProducts,
    isFetchingProducts,
    productsError,
    isProductsError,
    refetchProducts,
    categories,
  } = useProducts();

  // Search, filtration and sorting state values
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Slide-over Shopper Cart & Favorites client states
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState<'shopping' | 'success'>('shopping');

  // Load favorites & cart from localStorage on mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('catalog_favs');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const storedCart = localStorage.getItem('catalog_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.warn('LocalStorage access is blocked or unavailable', e);
    }
  }, []);

  // Save favorites to localStorage when state changes
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      try {
        localStorage.setItem('catalog_favs', JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  // Add items to client shopping cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      let nextCart: CartItem[] = [];
      if (existingIdx > -1) {
        nextCart = prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        nextCart = [...prev, { product, quantity: 1 }];
      }
      try {
        localStorage.setItem('catalog_cart', JSON.stringify(nextCart));
      } catch (e) { }
      return nextCart;
    });

    // Automatically trigger cart drawer slider
    setIsCartOpen(true);
    setCheckoutStage('shopping');
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const nextCart = prev
        .map((item) => {
          if (item.product.id === id) {
            const nextQuantity = item.quantity + delta;
            return { ...item, quantity: nextQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      try {
        localStorage.setItem('catalog_cart', JSON.stringify(nextCart));
      } catch (e) { }
      return nextCart;
    });
  };

  const removeCartItem = (id: number) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.product.id !== id);
      try {
        localStorage.setItem('catalog_cart', JSON.stringify(nextCart));
      } catch (e) { }
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('catalog_cart');
    } catch (e) { }
  };

  const handleCheckout = () => {
    setCheckoutStage('success');
    setCart([]);
    try {
      localStorage.removeItem('catalog_cart');
    } catch (e) { }
  };

  // Compute stats
  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalCartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Comprehensive sorting & filtering logic mapped with useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query match
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter matching
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Favorites filter only
    if (favoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    // Sorting evaluation
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy, favoritesOnly, favorites]);

  // Clean filters helper method
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('default');
    setFavoritesOnly(false);
  };

  // Safe categorization count calculation
  const categoryCount = (categoryName: string) => {
    if (categoryName === 'all') return products.length;
    return products.filter((p) => p.category.toLowerCase() === categoryName.toLowerCase()).length;
  };

  return (
    <div id="catalog-app-layout" className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* Sleek LEFT SIDEBAR - Responsive Collapsible */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${favoritesOnly ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">StoreSync</span>
          </div>
          {/* Close trigger on mobile */}
          <button
            onClick={() => setFavoritesOnly(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            id="sidebar-mobile-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sidebar links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Modos de Vista</div>

          <button
            onClick={() => {
              setFavoritesOnly(false);
              setSelectedCategory('all');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${!favoritesOnly && selectedCategory === 'all'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <ShoppingBag className="w-4 h-4 text-current" />
            <span>Catálogo Completo</span>
          </button>

          <button
            onClick={() => setFavoritesOnly(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${favoritesOnly
              ? 'bg-rose-50 text-rose-700'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-rose-500' : ''}`} />
              <span>Mis Favoritos</span>
            </div>
            {favorites.length > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                {favorites.length}
              </span>
            )}
          </button>

          <div className="pt-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Categorías Rápidas</div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setFavoritesOnly(false);
                  }}
                  className={`w-full text-left capitalize truncate px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === cat && !favoritesOnly
                    ? 'bg-slate-100 text-slate-900 border-l-4 border-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Right Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">

        {/* Dynamic header matching look and style */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs shrink-0 select-none">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Inventario de Catálogo
              <span className="hidden sm:inline text-xs font-normal text-slate-400 font-mono italic">
                Hook: useProducts()
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Visualización unificada del catálogo virtual</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status dynamic indicator representing API Query state */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isLoadingProducts
              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              : isProductsError
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-green-50 text-green-700 border-green-200'
              }`}>
              <span className={`w-2 h-2 rounded-full ${isLoadingProducts
                ? 'bg-amber-500'
                : isProductsError
                  ? 'bg-rose-500'
                  : 'bg-green-500'
                }`} />
              <span className="hidden xs:inline">
                API Status: {isLoadingProducts ? 'Loading' : isProductsError ? 'Error' : '200 OK'}
              </span>
            </div>

            {/* Shopping Cart Mini widget */}
            <button
              onClick={() => {
                setCheckoutStage('shopping');
                setIsCartOpen(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg cursor-pointer shadow-xs relative"
              id="header-cart-trigger"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mi Bolsa</span>
              {totalCartItemsCount > 0 && (
                <span className="bg-blue-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {totalCartItemsCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600 select-none">
              JS
            </div>
          </div>
        </header>

        {/* Multi-Column Bento Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT / CENTER COLUMN - Search Filters and product listing cards */}
            <div className="lg:col-span-10">

              {/* Internal filters wrapper block */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3.5">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">

                  {/* Custom Search bar container */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por artículo o categoría..."
                      className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs placeholder:text-slate-400 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                      id="search-input"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown filters sort selectors */}
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">Ordenar:</label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-3xs"
                    >
                      <option value="default">Recomendados</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="rating-desc">Calificación: Destacados</option>
                    </select>
                  </div>
                </div>

                {/* Categorization chips slider line */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none select-none">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setFavoritesOnly(false);
                    }}
                    className={`flex-shrink-0 cursor-pointer py-1 px-3 rounded-full text-xs font-bold transition-all border ${selectedCategory === 'all' && !favoritesOnly
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    id="category-chip-all"
                  >
                    Todos ({categoryCount('all')})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setFavoritesOnly(false);
                      }}
                      className={`flex-shrink-0 capitalize cursor-pointer py-1 px-3 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat && !favoritesOnly
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      id={`category-chip-${cat.replace(/\s+/g, '-')}`}
                    >
                      {cat} ({categoryCount(cat)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Loader view or Error condition container */}
              {isProductsError ? (
                <ErrorState error={productsError} onRetry={refetchProducts} />
              ) : isLoadingProducts ? (
                <LoadingState />
              ) : (
                <>
                  {filteredProducts.length === 0 ? (
                    <div id="empty-state-card" className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 bg-white">
                      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Sin Resultados</h3>
                      <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                        No hemos encontrado ningún producto que coincida con los criterios o filtros de búsqueda seleccionados.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl mx-auto cursor-pointer transition-colors shadow-xs"
                        id="btn-clear-filters"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Limpiar todos los filtros</span>
                      </button>
                    </div>
                  ) : (
                    /* Elegant responsive products listing catalog */
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      id="products-listings-grid"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                          >
                            <ProductCard
                              product={product}
                              isFavorite={favorites.includes(product.id)}
                              onToggleFavorite={toggleFavorite}
                              onAddToCart={addToCart}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cart Drawer Overlay Slider Sheet */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
              id="cart-backdrop"
            />

            {/* Slider Sheet Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-full"
              id="cart-drawer-sheet"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-900" />
                  <h3 className="font-bold text-gray-900">Carrito de compras</h3>
                  {totalCartItemsCount > 0 && (
                    <span className="bg-gray-100 text-gray-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {totalCartItemsCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 text-gray-500 hover:text-gray-950 transition-colors cursor-pointer"
                  id="btn-close-cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scroller Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {checkoutStage === 'success' ? (
                  <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full max-h-[450px]">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">¡Compra exitosa!</h4>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                      Tu pedido ficticio ha sido procesado correctamente por el catálogo. ¡Gracias por usar la tienda de prueba!
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 py-2.5 px-6 bg-gray-950 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Continuar explorando
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center h-full max-h-[350px]">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Tu carrito de compras está vacío</h4>
                    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                      Agrega productos desde la tienda para verlos reflejados aquí.
                    </p>
                  </div>
                ) : (
                  /* Display Basket items */
                  <div className="space-y-3.5">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100/50 rounded-2xl"
                        id={`cart-item-${item.product.id}`}
                      >
                        {/* Image */}
                        <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Title details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-gray-900 truncate" title={item.product.title}>
                            {item.product.title}
                          </h5>
                          <span className="text-[10px] text-gray-400 block mb-1.5 uppercase font-medium">
                            {item.product.category}
                          </span>
                          <span className="text-xs font-black text-gray-950 font-mono">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity managers */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => removeCartItem(item.product.id)}
                            className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="px-1.5 py-0.5 hover:bg-gray-100 text-gray-500 cursor-pointer text-xs"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-[11px] font-bold text-gray-800 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="px-1.5 py-0.5 hover:bg-gray-100 text-gray-500 cursor-pointer text-xs"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer Panel */}
              {checkoutStage !== 'success' && cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-4">
                  {/* Totals description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Artículos seleccionados:</span>
                      <span className="font-bold text-gray-700 font-mono">{totalCartItemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-900">Total a pagar:</span>
                      <span className="font-black text-base text-gray-950 font-sans tracking-tight">
                        ${totalCartPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={clearCart}
                      className="col-span-1 flex items-center justify-center gap-1 py-3 px-2 border border-gray-200 text-[10px] font-bold text-gray-500 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer text-center"
                      id="btn-clear-cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpiar</span>
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="col-span-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                      id="btn-checkout-cart"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Proceder al pago</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-center text-gray-400">
                    * Los montos y el checkout representan simulaciones seguras
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
