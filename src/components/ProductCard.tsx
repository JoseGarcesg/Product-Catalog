/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, Heart, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Safe category decorator styles
  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'jewelery':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case "men's clothing":
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case "women's clothing":
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Helper to draw star rating representing both full, half, and empty stars
  const renderStars = (rate: number) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3.5 h-3.5 text-gray-200 flex-shrink-0">
            <Star className="absolute top-0 left-0 w-3.5 h-3.5 fill-amber-400 text-amber-400 overflow-hidden [clip-path:inset(0_50%_0_0)]" />
            <Star className="absolute top-0 left-0 w-3.5 h-3.5 text-gray-200" />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-gray-200 flex-shrink-0" />
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Category & Favorite Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <span 
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase pointer-events-auto ${getCategoryTheme(
            product.category
          )}`}
        >
          {product.category}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center border font-medium cursor-pointer transition-all pointer-events-auto shadow-xs active:scale-90 ${
            isFavorite
              ? 'bg-rose-50 border-rose-100 text-rose-600'
              : 'bg-white/80 backdrop-blur-xs border-slate-100 text-slate-400 hover:text-slate-600'
          }`}
          id={`btn-fav-${product.id}`}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image Wrap */}
      <div className="relative h-48 w-full p-6 bg-slate-50/50 flex items-center justify-center overflow-hidden border-b border-slate-50">
        <motion.img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform"
        />
      </div>

      {/* Content wrapper */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating Block */}
          <div className="flex items-center gap-1.5 mb-2 select-none">
            <div className="flex items-center">
              {renderStars(product.rating.rate)}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 font-mono">
              {product.rating.rate.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">
              ({product.rating.count})
            </span>
          </div>

          {/* Title */}
          <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-2 leading-snug line-clamp-2 h-[2.5rem] hover:text-blue-600 transition-colors">
            {product.title}
          </h4>

          {/* Expandable description block */}
          <div className="text-xs text-slate-500 mb-4">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {product.description}
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-950 font-medium cursor-pointer animate-fade-in"
              id={`btn-desc-toggle-${product.id}`}
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  Ver menos
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Ver más descripción
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Area with Pricing and Call-to-actions */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Precio</span>
            <span className="text-lg font-black text-slate-950 font-sans tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer active:scale-95 shadow-xs"
            id={`btn-add-cart-${product.id}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
