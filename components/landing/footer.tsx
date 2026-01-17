'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FeedbackDialog } from '@/components/landing/feedback-dialog';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-16 bg-[#1f3f2c] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Logo & Brand */}
          <div className="space-y-4">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center">
                <Image src="/images/logo-white-png.png" alt="Logo" width={50} height={50} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Triple A Gamefarm</h3>
                <p className="text-white/60 text-sm">Championship Gamefowl Breeding</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Breeding championship-quality gamefowl with excellence in bloodlines, training, and customer service.
            </p>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <motion.h4 
              className="text-lg font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Quick Links
            </motion.h4>
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button
                asChild
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 justify-start transition-all duration-200 w-full"
              >
                <Link href="/roosters">
                  Roosters Gallery
                </Link>
              </Button>
              <FeedbackDialog>
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 justify-start transition-all duration-200 w-full"
                >
                  Give Feedback
                </Button>
              </FeedbackDialog>
            </motion.div>
          </div>

          {/* Social Icons */}
          <div className="space-y-4">
            <motion.h4 
              className="text-lg font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Connect With Us
            </motion.h4>
            <motion.div 
              className="flex space-x-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link 
                href="#"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="#"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="#"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </motion.div>
            <p className="text-white/60 text-sm mt-4">
              Follow us for updates and tips
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-white/10 mt-12 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Triple A Gamefarm. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}