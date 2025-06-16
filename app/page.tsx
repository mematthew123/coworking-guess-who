import { FeaturesSection } from '@/components/FeaturesSection';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';


export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Coworking Guess Who</h3>
              <p className="text-gray-400">
                Building stronger coworking communities through fun and games.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/games" className="hover:text-white transition-colors">
                    Play Now
                  </Link>
                </li>
                <li><Link href="/games" className="hover:text-white transition-colors">Play Now</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Memberships</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-gray-400 mb-4">
                Have questions? We&apos;d love to hear from you!
              </p>
              <a href="mailto:hello@coworkingguesswho.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                hello@coworkingguesswho.com
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Coworking Guess Who. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}