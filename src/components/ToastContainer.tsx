import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg font-sans text-sm",
              toast.type === 'success' && "bg-matcha-900 text-white",
              toast.type === 'error' && "bg-red-800 text-white",
              toast.type === 'info' && "bg-beige-500 text-white"
            )}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-matcha-300" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-300" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-beige-100" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
