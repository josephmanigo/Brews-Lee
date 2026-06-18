import React from 'react';
import { motion } from 'motion/react';
import SmoothScroll from '../components/ui/smooth-scroll';

export const StoryPage = () => {
  return (
    <SmoothScroll className="min-h-screen bg-[#fcfaf5] pb-24">
      {/* Hero Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen flex items-center pt-24 pb-16 z-0 bg-[#fcfaf5]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative w-full h-[60vh] min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 mx-6 md:mx-12 overflow-hidden bg-[#e0e3de] flex items-center justify-center">
            <motion.img 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="/Our Story The Ritual of Stillness.png" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              alt="Zen interior"
            />
            {/* Subtle overlay to match the reference look */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf5]/40 via-transparent to-transparent" />
            
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center mt-12 bg-white/40 backdrop-blur-md p-10 md:p-16 w-full max-w-[90%]">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#0d1b14] mb-6"
              >
                Our Story: The Ritual of Stillness
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-serif text-4xl md:text-6xl lg:text-[72px] leading-[1.15] text-[#0d1b14] mb-8"
              >
                From Kyoto with<br/>Intention, Rooted in<br/>Davao.
              </motion.h1>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-16 h-[1px] bg-[#0d1b14]/30" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen z-10 bg-[#fcfaf5] py-20 md:py-32 flex items-center rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 order-2 md:order-1"
          >
            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 block mb-5">The Philosophy</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0d1b14] mb-10">Cultivating Ma</h2>
            
            <div className="space-y-6 font-sans text-[15px] font-light text-[#0d1b14]/80 leading-relaxed max-w-md">
              <p>At the heart of our practice lies "Ma" (間) — the Japanese concept of negative space, a pause in time, an interval or emptiness in space. In a bustling city, we offer this emptiness not as an absence, but as a space full of potential.</p>
              <p>Our environment, much like our brew, is crafted to strip away the unnecessary, leaving only what is essential. Here, stillness is the ultimate luxury.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 order-1 md:order-2"
          >
            <div className="aspect-[4/5] md:aspect-square bg-[#0d1b14]/5 relative overflow-hidden">
              <img 
                src="/Cultivating Ma.png" 
                alt="Zen philosophy arrangement" 
                className="w-full h-full object-cover grayscale-[30%] opacity-90 sepia-[15%]" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sourcing Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen z-20 bg-[#fcfaf5] py-20 md:py-32 flex items-center rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 flex flex-col items-center"
          >
            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 mb-5">The Sourcing</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0d1b14] mb-8">The Journey of the Leaf & Bean</h2>
            <div className="w-12 h-[1px] bg-[#0d1b14]/20" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative aspect-square md:aspect-[4/3] overflow-hidden p-8 md:p-14 flex flex-col justify-end xl:justify-center items-start"
            >
              <img 
                src="/Shade Grown Perfection.png" 
                alt="Matcha preparation" 
                className="absolute inset-0 w-full h-full object-cover sepia-[10%]" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f5f4ef]/95 via-[#f5f4ef]/80 to-[#f5f4ef]/30" />
              
              <div className="relative z-10 max-w-sm">
                <div className="flex flex-wrap gap-3 mb-6">
                   <span className="px-3 py-1.5 bg-[#dce1a1] text-[#0d1b14] text-[9px] font-bold uppercase tracking-[0.15em] rounded-full">Uji, Kyoto</span>
                   <span className="px-3 py-1.5 bg-[#dce1a1] text-[#0d1b14] text-[9px] font-bold uppercase tracking-[0.15em] rounded-full">Ceremonial Grade</span>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-[#0d1b14] mb-4">Shade-Grown Perfection</h3>
                <p className="font-sans text-[15px] text-[#0d1b14]/80 leading-relaxed font-light">
                  Sourced directly from multi-generational tea farmers in Uji, Kyoto. Our leaves are shade-grown for 20 days before harvest to maximize chlorophyll and L-theanine, resulting in a vibrantly green, umami-rich brew.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative aspect-square md:aspect-[4/3] overflow-hidden p-8 md:p-14 flex flex-col justify-center items-center text-center"
            >
              <img 
                src="/High-Altitude Elegance.png" 
                alt="Coffee beans" 
                className="absolute inset-0 w-full h-full object-cover sepia-[10%] opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f5f4ef]/95 via-[#f5f4ef]/80 to-[#f5f4ef]/40" />
              
              <div className="relative z-10 max-w-sm flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                   <span className="px-3 py-1.5 bg-[#eae8dd] text-[#0d1b14] text-[9px] font-bold uppercase tracking-[0.15em] rounded-full opacity-90">Mt. Apo, Philippines</span>
                   <span className="px-3 py-1.5 bg-[#eae8dd] text-[#0d1b14] text-[9px] font-bold uppercase tracking-[0.15em] rounded-full opacity-90">Specialty</span>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-[#0d1b14] mb-4">High-Altitude Elegance</h3>
                <p className="font-sans text-[15px] text-[#0d1b14]/80 leading-relaxed font-light">
                  Cultivated in the volcanic soils of Mt. Apo, our specialty coffee honors local terroir. Hand-picked and meticulously processed to highlight delicate floral notes and a refined acidity.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Craft Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen z-30 bg-[#fcfaf5] py-20 md:py-32 flex items-center rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-[45%] order-1"
          >
            <div className="aspect-[4/5] bg-[#0d1b14]/5 relative overflow-hidden">
              <img 
                src="/The Hands Behind the Brew.png" 
                alt="Coffee pour over craft" 
                className="w-full h-full object-cover sepia-[15%]" 
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-[55%] order-2"
          >
            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 block mb-5">The Craft</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[56px] text-[#0d1b14] mb-8 leading-[1.1]">The Hands Behind the<br/>Brew</h2>
            
            <div className="space-y-6 font-sans text-[15px] font-light text-[#0d1b14]/80 leading-relaxed max-w-lg">
              <p>Every cup is a deliberate act. Our baristas are trained not just in technique, but in mindfulness. The sequence of brewing — from the grinding of the beans to the whisking of the matcha — is treated as a moving meditation.</p>
              <p>We believe that the intention poured into the preparation directly translates to the quality of your experience. It is a quiet dialogue between the maker and the receiver.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Team Section */}
      <section className="sticky top-[min(0px,calc(100vh-100%))] min-h-screen z-40 bg-[#fcfaf5] py-20 md:py-32 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#0d1b14]/5">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20 flex flex-col items-center"
          >
            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 mb-5">The Team</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0d1b14] mb-8">The People Behind the Pour</h2>
            <div className="w-12 h-[1px] bg-[#0d1b14]/20 mb-10" />
            <p className="font-sans text-[15px] font-light text-[#0d1b14]/80 leading-relaxed max-w-2xl">
              Five friends, one shared obsession — the art of a perfect cup. What started as a simple love for coffee became a pursuit of something deeper: a space where every sip carries intention.
            </p>
          </motion.div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 lg:gap-8 mb-24">
            {[
              { name: 'Ryan Estoque', role: 'Visionary', image: '/RYAN ESTOQUE.jpg' },
              { name: 'Joseph Manigo', role: 'The Coffee Soul', image: '/JOSEPH MANIGO.jpg' },
              { name: 'James Asoy', role: 'Craftsman', image: '/JAMES ASOY.jpg' },
              { name: 'Stephen Bayate', role: 'Strategist', image: '/STEPHEN BAYATE.png' },
              { name: 'Lesther Quimpan', role: 'Architect', image: '/LESTHER QUIMPAN.jpg' },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0d1b14] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  {'image' in member && member.image ? (
                    <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b14] to-[#2a3a2e] opacity-100" />
                      <span className="relative z-10 font-serif text-lg md:text-xl text-[#fcfaf5] tracking-wider">{'initial' in member ? member.initial : ''}</span>
                    </>
                  )}
                </div>
                <h3 className="font-serif text-base md:text-lg text-[#0d1b14] mb-1 leading-tight">{member.name}</h3>
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#0d1b14]/50 font-bold">{member.role}</span>
              </motion.div>
            ))}
          </div>

          {/* Joseph's Story */}
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2 order-2 md:order-1"
            >
              <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d1b14]/60 block mb-5">The Origin Story</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] text-[#0d1b14] mb-8 leading-[1.15]">Joseph &amp; the Coffee That Started It All</h2>
              
              <div className="space-y-6 font-sans text-[15px] font-light text-[#0d1b14]/80 leading-relaxed max-w-md">
                <p>It all began with Joseph Manigo and his inseparable companion — a cup of coffee. Whether he was sketching wireframes at 2 AM, debugging stubborn code, cramming for exams, or simply watching the rain from the campus corridor, Joseph always had a warm cup within arm's reach.</p>
                <p>His friends — Ryan, James, Stephen, and Lesther — watched this ritual unfold day after day. Coffee during study sessions, coffee while brainstorming, coffee on long walks, coffee as a reward after a breakthrough. For Joseph, it was never just caffeine — it was a quiet companion, a signal to slow down and think clearly.</p>
                <p>One evening, over yet another round of brewed cups, Joseph said something that stuck: <em>"The best ideas don't come from rushing. They come when you give yourself permission to pause."</em> That moment sparked a vision the five of them would carry forward — a space where coffee isn't consumed, but experienced.</p>
                <p>Brews &amp; Lee was born from that philosophy: every cup is an invitation to be still, to be present, and to savor the moment between one thought and the next.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2 order-1 md:order-2"
            >
              <div className="aspect-[4/5] md:aspect-square bg-[#e8e6dc] relative overflow-hidden flex items-center justify-center">
                {/* Decorative coffee illustration using styled elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8e6dc] to-[#d9d5c7]" />
                <div className="relative z-10 flex flex-col items-center gap-6 p-8">
                  <div className="text-7xl md:text-8xl opacity-60">☕</div>
                  <div className="space-y-3 text-center">
                    <p className="font-serif text-2xl md:text-3xl text-[#0d1b14]/70 italic">"Pause. Sip. Think."</p>
                    <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#0d1b14]/40 font-bold">— Joseph Manigo</p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-8 right-8 w-16 h-16 border border-[#0d1b14]/10 rounded-full" />
                  <div className="absolute bottom-12 left-8 w-10 h-10 border border-[#0d1b14]/10 rounded-full" />
                  <div className="absolute top-1/4 left-12 w-6 h-6 bg-[#0d1b14]/5 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
};
