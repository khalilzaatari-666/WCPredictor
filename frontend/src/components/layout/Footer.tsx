'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Twitter, Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'FAQ', href: '#faq' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-background to-black/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Trophy className="w-8 h-8 text-wc-gold" />
                <div className="absolute inset-0 bg-wc-gold/20 rounded-full blur-xl" />
              </motion.div>
              <div>
                <div className="text-xl font-bold gradient-animate bg-clip-text text-transparent">
                  WC2026
                </div>
                <div className="text-xs text-muted-foreground">Predictor</div>
              </div>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The ultimate platform for World Cup 2026 predictions. Join thousands of fans
              making their predictions and competing for glory!
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm flex items-center">
              © 2025 WC2026 Predictor. Made with{' '}
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> for football fans.
            </p>

            <div className="flex items-center space-x-6 text-sm">
              <span className="text-muted-foreground">Powered by</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-wc-accent animate-pulse" />
                <span className="text-wc-accent font-semibold">Polygon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-wc-primary via-wc-accent to-wc-gold" />
    </footer>
  );
}
