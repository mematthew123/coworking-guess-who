import { FeaturesSection } from '@/components/FeaturesSection';
import HeroSection from '@/components/HeroSection';

export default function Home() {
    return (
        <main className='min-h-screen'>
            <HeroSection />
            <FeaturesSection />
        </main>
    );
}
