import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import SmoothScroll from '../components/ui/smooth-scroll';

export const HomePage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);

  return (
    <SmoothScroll className="bg-[#fcfaf5]">
      {/* Hero Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-16 z-0">
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: y1 }}
            className="absolute inset-0 w-full h-[120%]"
          >
            <img
              src="/hero page.png"
              alt="Brews Lee Hero Background"
              className="w-full h-full object-cover object-center select-none"
            />
            {/* Soft overlays to ensure text readability while keeping the image visible */}
            <div className="absolute inset-0 bg-[#fcfaf5]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf5] via-transparent to-[#fcfaf5]/30" />
          </motion.div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between mt-8 sm:mt-12 md:mt-24">

            {/* Left side content */}
            <div className="max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-serif text-5xl sm:text-6xl md:text-[84px] lg:text-[96px] leading-[1.05] text-[#0d1b14] mb-8 sm:mb-12 tracking-tight uppercase"
              >
                Brewed in<br />
                Stillness
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="pl-5 sm:pl-6 border-l border-[#0d1b14]/20"
              >
                <p className="font-sans text-sm sm:text-[15px] text-[#0d1b14]/80 leading-relaxed font-light mb-8 sm:mb-10 max-w-[380px]">
                  A momentary escape from the urban chaos. Experience the convergence of premium Filipino hospitality and modern Japanese minimalism in every cup.
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link href="/menu" className="h-11 sm:h-12 px-6 sm:px-8 bg-[#0a1811] text-white font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors rounded-full flex items-center justify-center">
                    Order Now
                  </Link>
                  <Link href="/story" className="h-11 sm:h-12 px-6 sm:px-8 border border-[#0d1b14]/20 bg-[#fcfaf5]/50 backdrop-blur-sm text-[#0d1b14] font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-white/80 transition-colors rounded-full flex items-center justify-center">
                    Read Our Story
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right side content */}
            <div className="hidden md:flex flex-col items-end pt-4">
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="font-serif text-2xl md:text-3xl lg:text-[40px] text-[#0d1b14] uppercase tracking-tight text-right leading-tight max-w-[300px] mb-8"
              >
                Served With<br />Intention
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="text-[#0d1b14]/30 font-serif text-xl lg:text-2xl tracking-[0.4em] font-light"
                style={{ writingMode: 'vertical-rl' }}
              >
                静けさの中で淹れる
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 md:py-32 sticky top-[min(0px,calc(100vh-100%))] min-h-screen bg-[#fcfaf5] z-10 flex items-center rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-5/12 order-2 md:order-1"
            >
              <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 block mb-4 md:mb-6">Our Approach</span>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#0d1b14] leading-[1.1] mb-6 md:mb-10 tracking-tight">The Alchemy of<br />Perfect Extraction</h2>

              <div className="w-12 h-[1px] bg-[#0d1b14]/20 mb-6 md:mb-8" />

              <p className="font-sans text-[14px] md:text-[15px] font-light text-[#0d1b14]/80 leading-relaxed mb-4 md:mb-6">
                We believe that exceptional coffee is born from an uncompromising dedication to the craft. From sourcing the finest single-origin beans to the precise calibration of water, temperature, and time, every step in our process is intentional. Brews Lee is a celebration of the profound complexity and rich nuances hidden within the perfect roast.
              </p>

              <Link href="/story" className="inline-flex items-center gap-2 font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14] hover:text-[#0d1b14]/60 transition-colors">
                Read Our Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-7/12 order-1 md:order-2"
            >
              <div className="aspect-[4/3] bg-[#0d1b14]/5 relative overflow-hidden shadow-sm">
                <img
                  src="/The Alchemy of Perfect Extraction.png"
                  alt="Minimalist coffee counter"
                  className="w-full h-full object-cover sepia-[15%]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Delights Section */}
      <section className="py-16 md:py-32 sticky top-[min(0px,calc(100vh-100%))] min-h-screen bg-[#fcfaf5] z-20 flex flex-col justify-center rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 flex flex-col items-center"
          >
            <h2 className="font-serif text-5xl md:text-6xl text-[#0d1b14] mb-8">Featured Delights</h2>
            <div className="w-[1px] h-12 bg-[#0d1b14]/20" />
          </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column (takes 2/3 space) */}
          <div className="md:col-span-2 flex flex-col gap-6">

            {/* Signature Uji Matcha (Large landscape) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative overflow-hidden aspect-[16/9] md:aspect-auto md:flex-1 cursor-pointer group"
            >
              <img
                src="/Signature Uji Matcha.png"
                alt="Signature Uji Matcha"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811]/90 via-[#0a1811]/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 w-full">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white border border-white/20">Earthy</span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white border border-white/20">Ceremonial</span>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-2">Signature Uji Matcha</h3>
                <p className="font-sans text-[15px] font-light text-white/80 max-w-sm">
                  Whisked to order using ceremonial grade leaves sourced directly from Kyoto.
                </p>
              </div>
            </motion.div>

            {/* Bottom Row of Left Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:h-[45%]">

              {/* Seasonal Wagashi */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative overflow-hidden aspect-square sm:aspect-auto sm:h-full cursor-pointer group"
              >
                <img
                  src="/Seasonal Wagashi.webp"
                  alt="Seasonal Wagashi"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811]/90 via-[#0a1811]/40 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h3 className="font-serif text-2xl text-white mb-1.5">Seasonal Wagashi</h3>
                  <p className="font-sans text-[13px] font-light text-white/80">
                    Artisanal sweets to complement your brew.
                  </p>
                </div>
              </motion.div>

              {/* View Full Menu */}
              <Link href="/menu">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="bg-[#f5f4ef] aspect-square sm:aspect-auto sm:h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#eae8dd] transition-colors border border-[#0d1b14]/5"
                >
                  <h3 className="font-serif text-2xl text-[#0d1b14] mb-2">View Full Menu</h3>
                  <p className="font-sans text-[13px] font-light text-[#0d1b14]/70 max-w-[200px]">
                    Explore our complete collection of teas, coffees, and accompaniments.
                  </p>
                </motion.div>
              </Link>

            </div>

          </div>

          {/* Right Column (takes 1/3 space) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-1"
          >
            {/* The Ritual Pour (Portrait) */}
            <div className="relative overflow-hidden aspect-[4/5] md:h-full cursor-pointer group">
              <img
                src="/The Ritual Pour.png"
                alt="The Ritual Pour"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811]/95 via-[#0a1811]/30 to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 p-8 z-10">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white">Single Origin</span>
                </div>
                <h3 className="font-serif text-3xl md:text-[32px] md:leading-[1.1] text-white mb-3">The Ritual Pour</h3>
                <p className="font-sans text-[14px] font-light text-white/80">
                  Slow-brewed perfection highlighting delicate floral notes.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
        </div>
      </section>

    </SmoothScroll>
  );
};
