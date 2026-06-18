import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { cartItemCount, setIsCartOpen, user } = useAppContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bounce animation when cart count changes
  const [isBouncing, setIsBouncing] = useState(false);
  useEffect(() => {
    if (cartItemCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Story', href: '/story' },
    { name: 'Menu', href: '/menu' },
  ];

  const isHome = location === '/';

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled || !isHome ? "bg-white/40 backdrop-blur-md py-4 border-b border-ink/5" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className={cn(
            "font-serif text-3xl font-semibold tracking-tight transition-colors text-matcha-900"
          )}>
            Brews Lee<span className="text-matcha-500 text-xl ">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(
                "font-sans text-sm font-medium tracking-wide uppercase transition-colors relative",
                location === link.href 
                  ? "text-matcha-900"
                  : "text-matcha-700/70 hover:text-matcha-900"
              )}>
                {link.name}
                {location === link.href && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className={cn(
                      "absolute -bottom-2 left-0 right-0 h-0.5 bg-matcha-500"
                    )}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link href={user ? '/dashboard' : '/login'} className={cn(
              "transition-colors text-matcha-900"
            )}>
              <User className="w-5 h-5" />
            </Link>
            
            <button 
              id="cart-icon"
              className={cn(
                "relative transition-colors text-matcha-900"
              )}
              onClick={() => setIsCartOpen(true)}
            >
              <motion.div
                animate={isBouncing ? { scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.div>
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-matcha-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-beige-50"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </button>

            <button 
              className={cn(
                "md:hidden transition-colors text-matcha-900"
              )}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-matcha-900 z-50 flex flex-col p-6"
          >
            <div className="flex justify-between items-center text-white mb-16">
              <span className="font-serif text-2xl font-semibold">Brews Lee.</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8 text-white/70">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={cn(
                    "font-serif text-5xl hover:text-white transition-colors",
                    location === link.href && "text-white"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href={user ? '/dashboard' : '/login'}
                className="font-serif text-5xl hover:text-white transition-colors mt-8 pt-8 border-t border-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
