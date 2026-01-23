'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function RoosterGalleryFooter() {
  return (
    <footer className="bg-[#2f8466] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Triple A Gamefarm</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Pinagkakatiwalaan ng mga mahilig at kompetidor. 
              Mga world-class na manok na siguradong pampanalo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/roosters" className="text-white/80 hover:text-white transition-colors">
                  Rooster Gallery
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-white/80 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">0950 972 7214</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">
                  119 Purok 1 Rose, Paltok<br />
                  Angat, Bulacan
                </span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="mt-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61578922746473" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>Triple A Game Farm</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © 2026 Triple A Gamefarm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

