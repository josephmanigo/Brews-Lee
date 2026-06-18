import React from 'react';
import { motion } from 'motion/react';

export const InfoPage = ({ title }: { title: string }) => {
  return (
    <div className="min-h-screen bg-[#fcfaf5] pb-24 pt-48">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 block mb-6">Information</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#0d1b14] leading-[1.1] tracking-tight">{title}</h1>
          <div className="w-12 h-[1px] bg-[#0d1b14]/20 mt-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg prose-neutral font-sans font-light text-[#0d1b14]/80 leading-relaxed"
        >
          <p>
            Welcome to the {title} page for Brews Lee. We are dedicated to providing
            transparency, excellence in craftsmanship, and unparalleled service.
          </p>
          <p>
            If you have any urgent inquiries regarding {title.toLowerCase()}, please do not hesitate to 
            reach out to our support team. We appreciate your passion for 
            premium coffee.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
