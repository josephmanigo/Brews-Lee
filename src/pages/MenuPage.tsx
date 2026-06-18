import React, { useState, useEffect } from 'react';
import { useSearch } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import { Category, Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { formatPHP } from '../lib/utils';
import { X, Minus, Plus, Heart } from 'lucide-react';

export const MenuPage = () => {
  const categories: Category[] = ['Matcha Drinks', 'Coffee', 'Pastries'];
  const search = useSearch();

  const getCategoryFromSearch = (searchStr: string): Category => {
    const params = new URLSearchParams(searchStr);
    const cat = params.get('category') as Category;
    return categories.includes(cat) ? cat : 'Matcha Drinks';
  };

  const [activeCategory, setActiveCategory] = useState<Category>(() => getCategoryFromSearch(search));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, favorites, toggleFavorite, user } = useAppContext();

  // Re-sync whenever the query string changes (e.g. footer link clicked while on /menu)
  useEffect(() => {
    setActiveCategory(getCategoryFromSearch(search));
  }, [search]);

  const filteredProducts = products.filter(p => p.category === activeCategory);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity, e);
      setSelectedProduct(null);
    }
  };

  const handleAddToCartQuick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, e);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf5] pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-16 lg:gap-24">
        
        {/* Sidebar */}
        <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
          <h2 className="font-serif text-3xl italic text-[#0d1b14] mb-8">The Collection</h2>
          
          <ul className="space-y-6 mb-16">
            {categories.map((cat) => (
              <li key={cat}>
                <button 
                  onClick={() => setActiveCategory(cat)}
                  className={`font-sans text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-3 transition-colors ${
                    activeCategory === cat ? 'text-[#0d1b14]' : 'text-[#0d1b14]/40 hover:text-[#0d1b14]/70'
                  }`}
                >
                  {activeCategory === cat && <span className="w-1.5 h-1.5 bg-[#0d1b14] rounded-full shrink-0"></span>}
                  {cat}
                </button>
              </li>
            ))}
          </ul>

          <p className="font-sans text-[13px] italic text-[#0d1b14]/60 relative before:content-[''] before:block before:w-12 before:h-[1px] before:bg-[#0d1b14]/20 before:mb-6 leading-relaxed">
            "Each whisk is a ritual, each sip a sanctuary."
          </p>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            {activeCategory === 'Matcha Drinks' ? (
              <>
                <h1 className="font-serif text-5xl md:text-[80px] text-[#0d1b14] leading-[1.1] mb-8 tracking-tight">
                  The Matcha <br/><span className="italic">Ceremony</span>
                </h1>
                <p className="font-sans text-sm md:text-base text-[#0d1b14]/70 max-w-lg font-light leading-relaxed">
                  Curated Uji grade matcha, hand-whisked and paired with artisanal ingredients to create a symphony of earthy notes and velvety textures.
                </p>
              </>
            ) : activeCategory === 'Coffee' ? (
              <>
                <h1 className="font-serif text-5xl md:text-[80px] text-[#0d1b14] leading-[1.1] mb-8 tracking-tight">
                  The Coffee <br/><span className="italic">Roasts</span>
                </h1>
                <p className="font-sans text-sm md:text-base text-[#0d1b14]/70 max-w-lg font-light leading-relaxed">
                  Sourced from local highlands and roasted to highlight their unique origin notes. Built to awaken the senses.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-5xl md:text-[80px] text-[#0d1b14] leading-[1.1] mb-8 tracking-tight">
                  The <br/><span className="italic">Pastries</span>
                </h1>
                <p className="font-sans text-sm md:text-base text-[#0d1b14]/70 max-w-lg font-light leading-relaxed">
                  Carefully baked delights designed to pair beautifully with every sip. Indulgent, handcrafted, and fresh.
                </p>
              </>
            )}
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
                // Determine if we should display the large full-width style
                const isFullWidthVariant = index === 2 && filteredProducts.length >= 3;

                if (isFullWidthVariant) {
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      onClick={() => handleOpenModal(product)}
                      className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-0 items-stretch bg-[#fdfbf7] border border-[#0d1b14]/5 cursor-pointer group"
                    >
                      <div className="w-full md:w-1/2 overflow-hidden bg-[#0d1b14]/5 relative">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover min-h-[300px] transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-[#0d1b14]/0 group-hover:bg-[#0d1b14]/5 transition-colors duration-300" />
                        {/* Heart button — only visible when logged in */}
                        {user && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                            className="absolute top-4 right-4 p-1.5 hover:scale-110 transition-transform"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-[#0d1b14]/40'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex justify-between items-start border-b border-[#0d1b14]/10 pb-4 mb-4">
                          <h3 className="font-serif text-4xl text-[#0d1b14] leading-tight pr-4">{product.name}</h3>
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <span className="font-serif italic text-2xl text-[#0d1b14]/40 leading-none">Signature</span>
                            <p className="font-sans text-[#0d1b14] font-medium text-xs mt-2">{formatPHP(product.price).replace('.00', '').replace('₱', 'P')}</p>
                          </div>
                        </div>
                        <p className="font-sans text-[#0d1b14]/70 text-sm font-light leading-relaxed mb-10 flex-1">
                          {product.description}
                        </p>
                        <div className="flex gap-4">
                          <button 
                            onClick={(e) => handleAddToCartQuick(product, e)} 
                            className="px-8 py-3.5 border border-[#0d1b14]/20 text-[#0d1b14] bg-transparent font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#0d1b14] hover:text-white transition-colors"
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="px-8 py-3.5 border-b border-transparent text-[#0d1b14] font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:border-[#0d1b14]/30 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col group cursor-pointer"
                    onClick={() => handleOpenModal(product)}
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-[#0d1b14]/5 mb-6 relative">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-[#0d1b14]/0 group-hover:bg-[#0d1b14]/5 transition-colors duration-300" />
                      {/* Heart button — only visible when logged in */}
                      {user && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                          className="absolute top-3 right-3 p-1.5 hover:scale-110 transition-transform"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-[#0d1b14]/40'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col xl:flex-row xl:items-end gap-1 xl:gap-4 mb-3">
                      <h3 className="font-serif text-[26px] leading-[1.1] text-[#0d1b14] truncate xl:whitespace-normal">{product.name}</h3>
                      <div className="hidden xl:block flex-1 w-full border-b border-[#0d1b14]/10 mb-1.5 relative overflow-hidden"></div>
                      <span className="font-sans text-xs font-medium text-[#0d1b14] pb-0.5 shrink-0 tracking-wide">{formatPHP(product.price).replace('.00', '').replace('₱', 'P')}</span>
                    </div>
                    
                    <p className="font-sans text-sm text-[#0d1b14]/70 font-light leading-relaxed mb-6 flex-1">
                      {product.description}
                    </p>
                    
                    <div>
                      <button 
                        onClick={(e) => handleAddToCartQuick(product, e)} 
                        className="inline-block px-6 py-3 border border-[#0d1b14]/20 text-[#0d1b14] font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#0d1b14] hover:text-white transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-beige-50 w-full max-w-4xl overflow-hidden spring-shadow border border-ink/5 flex flex-col md:flex-row relative max-h-[90vh]"
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-64 md:h-auto">
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                  <span className="font-sans text-xs tracking-widest uppercase text-matcha-500 mb-2">{selectedProduct.category}</span>
                  <h2 className="font-serif text-3xl md:text-5xl font-medium text-ink mb-4">{selectedProduct.name}</h2>
                  <p className="font-sans text-2xl text-matcha-700 mb-6">{formatPHP(selectedProduct.price)}</p>
                  
                  <p className="font-sans text-ink/70 leading-relaxed font-light mb-10">
                    {selectedProduct.description}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    {/* Quantity selector */}
                    <div className="flex items-center justify-between border-t border-b border-[#0d1b14]/10 py-4">
                      <span className="font-sans text-[11px] font-bold tracking-[0.15em] uppercase text-[#0d1b14]/40">Quantity</span>
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center border border-[#0d1b14]/20 hover:border-[#0d1b14] transition-colors text-[#0d1b14]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-sans font-semibold text-lg w-4 text-center text-[#0d1b14]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-[#0d1b14]/20 hover:border-[#0d1b14] transition-colors text-[#0d1b14]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-5 border border-[#0d1b14]/20 text-[#0d1b14] bg-transparent font-sans text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#0d1b14] hover:text-white transition-colors flex items-center justify-between px-8 group"
                    >
                      <span>Add to Cart</span>
                      <span className="font-serif text-base font-normal tracking-normal normal-case group-hover:translate-x-1 transition-transform">{formatPHP(selectedProduct.price * quantity)}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
