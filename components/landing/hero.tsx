'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FeedbackDialog } from '@/components/landing/feedback-dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Hero() {
  const isMobile = useIsMobile();

  return (
    <section
      id="hero"
      className="relative h-screen overflow-hidden"
    >
      {/* Sky layer - bottom */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/hero/sky.png')",
          backgroundSize: "150% 150%"
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
        }}
        transition={{
          duration: 1000,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Text layer - middle */}
      <motion.div 
        className={`relative z-10 w-full h-full flex items-start ${isMobile ? 'pt-8' : 'pt-12'} lg:pt-16`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={`${isMobile ? 'px-6 w-full' : 'pl-44 lg:pl-44 pr-10 w-2/5 lg:w-1/2'}`}>
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="font-bold text-[#1f3f2c] text-base lg:text-lg"
            
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Triple A Gamefarm
            </motion.span>
            <motion.h1 
              className={`${isMobile ? 'text-5xl' : 'text-7xl lg:text-8xl'} font-bold text-[#1f3f2c] leading-tight`}
          
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Mga Kampeon <br/> na Manok!
            </motion.h1>
            <motion.p 
              className={`${isMobile ? 'text-lg' : 'text-xl lg:text-xl'} leading-relaxed text-white max-w-2xl bg-emerald-900 p-5`}
              
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Magtiwala sa pinakamahusay na breeding program! 
              Mga world-class na manok na siguradong pampanalo. 
              Samahan mo kami sa tagumpay!
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className={`${isMobile ? 'flex flex-col space-y-3' : 'flex flex-row space-x-4'} pt-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <FeedbackDialog>
                  <Button
                    variant="outline"
                    className={`${isMobile ? 'w-full' : 'px-8 py-8 text-lg'} bg-[#1f3f2c] text-white border-[#1f3f2c] hover:bg-[#1f3f2c] hover:text-white transition-all duration-200 font-medium`}
                  >
                    Magbahagi ng Feedback
                  </Button>
                </FeedbackDialog>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Button
                  asChild
                  className={`${isMobile ? 'w-full' : 'px-8 py-8 text-lg'} bg-[#3d6c58] hover:bg-[#4e816b] text-white transition-all duration-200 font-medium`}
                >
                  <Link href="/roosters">
                    Tingnan ang Mga Manok <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Farm layer - top */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat bg-bottom opacity-100"
        style={{ backgroundImage: "url('/images/hero/farm.png')"}}
      />
    </section>
  );
}