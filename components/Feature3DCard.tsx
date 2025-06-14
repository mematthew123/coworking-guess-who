import { use3DCardEffect, useRevealAnimation } from "@/hooks/animations";

export const Feature3DCard = ({ icon, title, description, delay = 0 }: { icon: string; title: string; description: string; delay?: number }) => {
    const cardRef = use3DCardEffect(1000);
    const revealRef = useRevealAnimation<HTMLDivElement>({ delay });

    return (
        <div ref={cardRef} className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300" style={{ transformStyle: 'preserve-3d' }}>
            <div ref={revealRef} className="relative z-10">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" style={{ transform: 'translateZ(-10px)' }} />
        </div>
    );
};