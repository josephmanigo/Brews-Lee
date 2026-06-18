import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatPHP } from '../lib/utils';
import { useLocation } from 'wouter';

export const CartPanel = () => {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, user, addToast } = useAppContext();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      addToast('Please sign in to checkout', 'info');
      setLocation('/login');
      return;
    }
    setLocation('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-beige-50 spring-shadow border-l border-ink/5 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-matcha-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-matcha-700" />
                <h2 className="font-serif text-2xl font-medium text-ink">Your Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-beige-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-matcha-700" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-matcha-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="font-sans">Your cart is feeling a bit empty.</p>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setLocation('/menu');
                    }}
                    className="inline-block px-6 py-3 border border-[#0d1b14]/20 text-[#0d1b14] font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#0d1b14] hover:text-white transition-colors mt-4"
                  >
                    EXPLORE MENU
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-serif text-lg font-medium leading-tight">{item.product.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-matcha-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-sans text-sm text-matcha-500 mt-1">{formatPHP(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-matcha-300 rounded-full">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-matcha-100 rounded-l-full transition-colors"
                            >
                              <Minus className="w-4 h-4 text-matcha-700" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-matcha-100 rounded-r-full transition-colors"
                            >
                              <Plus className="w-4 h-4 text-matcha-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-matcha-100 flex flex-col gap-4">
                <div className="flex justify-between text-lg font-serif">
                  <span className="text-matcha-700">Subtotal</span>
                  <span className="font-bold text-ink">{formatPHP(cartTotal)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#0e1a12] text-[#c1f23e] rounded-none font-sans text-[11px] font-bold tracking-[0.18em] uppercase hover:opacity-90 transition-all cursor-pointer"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                  <p className="text-xs text-matcha-500/80 text-center font-sans">Shipping and taxes calculated at checkout.</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
