import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export const FlyingItemAnimation = () => {
  const { flyingItems, removeFlyingItem } = useAppContext();
  const [cartPos, setCartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Find the cart icon position to fly towards
    const updateCartPos = () => {
      const cartIcon = document.getElementById('cart-icon');
      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        setCartPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };
    
    updateCartPos();
    window.addEventListener('resize', updateCartPos);
    return () => window.removeEventListener('resize', updateCartPos);
  }, [flyingItems]); // re-check when items fly

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {flyingItems.map(item => (
          <motion.img
            key={item.id}
            src={item.imageUrl}
            className="absolute h-16 w-16 rounded-full object-cover shadow-lg border-2 border-white"
            initial={{ 
              x: item.startX - 32, // -32 for half width
              y: item.startY - 32,
              scale: 1,
              opacity: 1
            }}
            animate={{ 
              x: cartPos.x - 32,
              y: cartPos.y - 32,
              scale: 0.2,
              opacity: 0.5,
              rotate: 180
            }}
            transition={{ 
              duration: 0.7, 
              ease: [0.17, 0.67, 0.38, 1], // Custom easing for curve feel
              opacity: { delay: 0.3, duration: 0.4 }
            }}
            onAnimationComplete={() => removeFlyingItem(item.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
