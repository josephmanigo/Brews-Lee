import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

type ModalKey = 'sourcing' | 'contact' | 'privacy' | 'terms' | 'shipping' | null;

const MODAL_CONTENT: Record<Exclude<ModalKey, null>, { title: string; content: React.ReactNode }> = {
  sourcing: {
    title: 'Our Sourcing',
    content: (
      <div className="space-y-4 font-sans text-white/70 font-light leading-relaxed text-sm">
        <p>
          At Brews Lee, every ingredient begins its journey long before it reaches your cup. We partner
          directly with small-scale farms across the Philippines, Japan, and Ethiopia — cultivating
          relationships built on fair trade, transparency, and a shared passion for quality.
        </p>
        <p>
          Our matcha is ceremonial-grade Uji sourced from Kyoto's oldest tea estates, hand-picked during the
          first flush of spring. Our single-origin coffees are harvested from high-altitude farms in
          Benguet and Sagada, where cooler temperatures develop complex, nuanced flavors.
        </p>
        <p>
          Pastry ingredients are locally sourced wherever possible, supporting Filipino artisan producers
          who share our commitment to sustainable, chemical-free agriculture.
        </p>
        <div className="border-t border-white/10 pt-4 mt-6">
          <p className="text-xs tracking-widest uppercase font-bold text-white/30">Certifications</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>✦ Fair Trade Certified Partners</li>
            <li>✦ Rainforest Alliance Coffee Farms</li>
            <li>✦ JONA Organic Matcha (Japan Organic & Natural Foods Association)</li>
          </ul>
        </div>
      </div>
    ),
  },
  contact: {
    title: 'Contact Us',
    content: (
      <div className="space-y-6 font-sans text-white/70 font-light leading-relaxed text-sm">
        <p>We'd love to hear from you. Whether it's a question about an order, a custom catering inquiry,
          or simply wanting to connect over a shared love of coffee — reach out anytime.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">General Inquiries</p>
            <p className="font-medium text-white">hello@brewslee.com</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Orders & Support</p>
            <p className="font-medium text-white">orders@brewslee.com</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Phone</p>
            <p className="font-medium text-white">+63 917 123 4567</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Hours</p>
            <p className="font-medium text-white">Mon – Sat, 8am – 8pm</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Visit Us</p>
          <p className="font-medium text-white">123 J.P. Laurel Ave, Bajada, Davao City</p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4 font-sans text-[#0d1b14]/80 font-light leading-relaxed text-sm">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30">Effective Date: January 1, 2026</p>
        <p>Brews Lee ("we," "us," or "our") respects your privacy. This policy describes how we collect, use, and protect your personal information when you use our website and services.</p>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Information We Collect</h4>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>Name, email, and contact details when you register or order</li>
            <li>Shipping address and payment method (via secure processor)</li>
            <li>Browsing behavior for improving site experience</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">How We Use Your Data</h4>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>To process and fulfill your orders</li>
            <li>To communicate order updates and promotions (with your consent)</li>
            <li>To improve our website and product offerings</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Your Rights</h4>
          <p className="text-white/50">You may request access to, correction of, or deletion of your personal data at any time by contacting hello@brewslee.com.</p>
        </div>
        <p className="text-xs text-white/30">We never sell your data to third parties.</p>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <div className="space-y-4 font-sans text-white/70 font-light leading-relaxed text-sm">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30">Last Updated: January 1, 2026</p>
        <p>By using the Brews Lee website or placing an order, you agree to these Terms of Service. Please read them carefully.</p>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Use of Service</h4>
          <p className="text-white/50">Our website and services are intended for personal, non-commercial use. You agree not to misuse the platform or attempt to circumvent its security.</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Orders &amp; Payment</h4>
          <p className="text-white/50">All prices are listed in Philippine Pesos (PHP). We reserve the right to cancel orders due to pricing errors or product unavailability. Payment is processed securely via encrypted gateways.</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Intellectual Property</h4>
          <p className="text-white/50">All content on this site — including images, text, and branding — is owned by Brews Lee and protected by copyright. Unauthorized reproduction is prohibited.</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Limitation of Liability</h4>
          <p className="text-white/50">Brews Lee is not liable for any indirect or consequential damages arising from the use of our products or services beyond the amount paid for an order.</p>
        </div>
      </div>
    ),
  },
  shipping: {
    title: 'Shipping & Returns',
    content: (
      <div className="space-y-4 font-sans text-white/70 font-light leading-relaxed text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Davao City</p>
            <p className="font-medium text-white">1–2 Business Days</p>
            <p className="text-xs text-white/40 mt-1">Free on orders over ₱800</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#c1f23e] mb-2">Nationwide</p>
            <p className="font-medium text-white">3–5 Business Days</p>
            <p className="text-xs text-white/40 mt-1">Free on orders over ₱1,500</p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Order Processing</h4>
          <p className="text-white/50">Orders placed before 12:00 PM are processed the same business day. Orders placed after 12:00 PM are processed the next business day. Orders are not processed on Sundays or public holidays.</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Returns &amp; Exchanges</h4>
          <p className="text-white/50">We accept returns on non-perishable items within 7 days of delivery, provided they are unused and in original packaging. Due to the nature of our food products, consumables are non-returnable unless damaged or defective.</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Damaged Items</h4>
          <p className="text-white/50">If your item arrives damaged, please contact orders@brewslee.com within 48 hours with a photo. We will arrange a replacement or full refund at no additional cost.</p>
        </div>
      </div>
    ),
  },
};

export const Footer = () => {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const modalData = activeModal ? MODAL_CONTENT[activeModal] : null;

  return (
    <>
      <footer className="relative bg-[#0d1b14] text-beige-50 pt-24 pb-8 overflow-hidden">
        {/* Giant Watermark Text */}
        <div className="absolute bottom-16 left-0 right-0 pointer-events-none select-none overflow-hidden flex items-center justify-center -z-0 opacity-[0.03]">
          <span className="font-serif text-[24vw] leading-none whitespace-nowrap tracking-tighter">MATCHA</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-white/10 pb-20 mb-8">
            
            {/* Left: Big CTA & Offer */}
            <div className="md:col-span-12 lg:col-span-5 flex flex-col justify-center">
              <h2 className="font-serif text-5xl md:text-[3.5rem] leading-[1.1] text-white mb-10 tracking-tight">
                Save up to 20% or <br className="hidden md:block" />
                more <br className="hidden md:block" />
                on your first order.
              </h2>
              <div>
                <Link href="/signup" className="inline-block px-8 py-4 bg-[#c1f23e] text-[#0d1b14] font-sans font-bold tracking-wide rounded-full hover:bg-[#a9d936] hover:scale-105 transition-all text-sm">
                  Unlock 20% Off
                </Link>
              </div>
            </div>
            
            {/* Middle: Links */}
            <div className="md:col-span-12 lg:col-span-7 flex gap-16 lg:justify-end items-start pt-4">
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#c1f23e] uppercase mb-6">Shop</h4>
                <ul className="space-y-4 font-sans text-sm text-beige-300 font-light">
                  <li><Link href="/menu?category=Matcha+Drinks" className="hover:text-white transition-colors">Matcha</Link></li>
                  <li><Link href="/menu?category=Coffee" className="hover:text-white transition-colors">Coffee</Link></li>
                  <li><Link href="/menu?category=Pastries" className="hover:text-white transition-colors">Pastries</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#c1f23e] uppercase mb-6">About</h4>
                <ul className="space-y-4 font-sans text-sm text-beige-300 font-light">
                  <li><Link href="/story" className="hover:text-white transition-colors">Our Story</Link></li>
                  <li>
                    <button onClick={() => setActiveModal('sourcing')} className="hover:text-white transition-colors text-left">Sourcing</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors text-left">Contact</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs font-sans text-beige-300/60 gap-6 mt-8">
            <div className="font-serif text-2xl font-medium tracking-widest text-white uppercase">
              Brews Lee
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-light">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => setActiveModal('shipping')} className="hover:text-white transition-colors">Shipping & Returns</button>
            </div>

            <div className="font-light text-center md:text-right">
              &copy; 2026 Brews Lee Premium Coffee. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <AnimatePresence>
        {activeModal && modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0e1a12] w-full max-w-2xl max-h-[88vh] overflow-y-auto relative border border-white/10"
            >
              {/* Accent top bar */}
              <div className="h-[2px] w-full bg-[#c1f23e]" />

              {/* Header */}
              <div className="sticky top-0 bg-[#0e1a12] px-8 pt-7 pb-6 border-b border-white/10 flex items-start justify-between gap-4 z-10">
                <div>
                  <span className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase text-[#c1f23e] block mb-2">Brews Lee</span>
                  <h2 className="font-serif text-4xl text-white leading-tight tracking-tight">{modalData.title}</h2>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-1 p-2 border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all text-white/50 hover:text-white flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-8">
                {modalData.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
