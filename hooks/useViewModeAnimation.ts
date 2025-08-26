import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { BoardViewMode } from '@/types/questionHistory';

interface AnimationConfig {
  duration?: number;
  stagger?: number;
  ease?: string;
}

export function useViewModeAnimation(
  viewMode: BoardViewMode,
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  config: AnimationConfig = {}
) {
  const { 
    duration = 0.6, 
    stagger = 0.03, 
    ease = "power2.inOut" 
  } = config;
  
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const previousModeRef = useRef<BoardViewMode>(viewMode);
  const overlayTimelineRef = useRef<gsap.core.Timeline | null>(null);
  
  useEffect(() => {
    if (!cardRefs.current || cardRefs.current.length === 0) return;
    
    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const cards = cardRefs.current.filter(Boolean);
    const tl = gsap.timeline();
    timelineRef.current = tl;
    
    // Determine animation based on mode transition
    const fromMode = previousModeRef.current;
    const toMode = viewMode;
    
    if (fromMode === toMode) return;
    
    // Exit animation from previous mode
    if (fromMode === BoardViewMode.Normal) {
      tl.to(cards, {
        scale: 0.95,
        opacity: 0.8,
        duration: duration * 0.5,
        stagger: {
          each: stagger,
          from: "random"
        },
        ease: ease
      });
    }
    
    // Mode-specific animations
    switch (toMode) {
      case BoardViewMode.Normal:
        // Return to normal view with spring effect
        tl.to(cards, {
          scale: 1,
          opacity: 1,
          rotateY: 0,
          rotateX: 0,
          z: 0,
          duration: duration,
          stagger: {
            each: stagger,
            from: "center",
            grid: "auto"
          },
          ease: "back.out(1.2)",
          clearProps: "transform"
        });
        break;
        
      case BoardViewMode.QuestionHistory:
        // 3D flip effect with depth
        tl.set(cards, { transformPerspective: 1000 })
        .to(cards, {
          rotateY: 90,
          scale: 0.8,
          z: -50,
          duration: duration * 0.4,
          stagger: {
            each: stagger,
            from: "random",
            grid: "auto"
          },
          ease: "power2.in"
        })
        .set(cards, { 
          rotateY: -90,
          onComplete: () => {
            // Trigger overlay animations
            cards.forEach((card, index) => {
              if (card) {
                const overlay = card.querySelector('.question-overlay');
                if (overlay) {
                  gsap.fromTo(overlay, 
                    { opacity: 0, scale: 0.5 },
                    { 
                      opacity: 1, 
                      scale: 1, 
                      duration: 0.3,
                      delay: index * 0.02,
                      ease: "back.out(1.7)"
                    }
                  );
                }
              }
            });
          }
        })
        .to(cards, {
          rotateY: 0,
          scale: 1,
          z: 0,
          duration: duration * 0.4,
          stagger: {
            each: stagger,
            from: "random"
          },
          ease: "power2.out"
        });
        break;
        
      case BoardViewMode.EliminationPath:
        // Emphasize eliminated cards with glow effect
        tl.to(cards, {
          scale: (index, target) => {
            const isEliminated = target.classList.contains('eliminated-card');
            return isEliminated ? 1.05 : 0.85;
          },
          opacity: (index, target) => {
            const isEliminated = target.classList.contains('eliminated-card');
            return isEliminated ? 1 : 0.4;
          },
          filter: (index, target) => {
            const isEliminated = target.classList.contains('eliminated-card');
            return isEliminated ? "brightness(1.2) contrast(1.1)" : "brightness(0.7)";
          },
          z: (index, target) => {
            const isEliminated = target.classList.contains('eliminated-card');
            return isEliminated ? 20 : -20;
          },
          duration: duration,
          stagger: {
            each: stagger,
            from: "random",
            amount: duration * 0.7
          },
          ease: "power3.inOut"
        });
        break;
        
      case BoardViewMode.HeatMap:
        // Wave animation with color intensity
        const centerIndex = Math.floor(cards.length / 2);
        tl.to(cards, {
          scale: (index) => {
            const distance = Math.abs(index - centerIndex);
            const maxDistance = Math.max(centerIndex, cards.length - centerIndex);
            const intensity = 1 - (distance / maxDistance) * 0.3;
            return intensity;
          },
          y: (index) => {
            const wave = Math.sin((index / cards.length) * Math.PI * 2);
            return wave * 15;
          },
          duration: duration,
          stagger: {
            each: stagger,
            from: "center",
            grid: "auto",
            amount: duration
          },
          ease: "sine.inOut"
        })
        .to(cards, {
          y: 0,
          duration: duration * 0.5,
          ease: "elastic.out(1, 0.5)"
        });
        break;
        
      case BoardViewMode.Timeline:
        // Timeline cascade effect
        tl.to(cards, {
          x: (index) => (index % 6) * 5,
          y: (index) => Math.floor(index / 6) * 10,
          scale: 0.95,
          duration: duration * 0.5,
          stagger: {
            each: stagger * 2,
            from: "start"
          },
          ease: "power2.out"
        })
        .to(cards, {
          rotateX: 15,
          rotateY: -15,
          duration: duration * 0.3,
          stagger: {
            each: stagger,
            from: "end"
          },
          ease: "power2.inOut"
        });
        break;
    }
    
    previousModeRef.current = viewMode;
    
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [viewMode, cardRefs, duration, stagger, ease]);
  
  // Cleanup function for overlay animations
  const cleanupOverlayAnimations = useCallback(() => {
    if (overlayTimelineRef.current) {
      overlayTimelineRef.current.kill();
      overlayTimelineRef.current = null;
    }
  }, []);
  
  // Animate overlays based on mode
  const animateOverlays = useCallback((mode: BoardViewMode) => {
    cleanupOverlayAnimations();
    
    const overlayTl = gsap.timeline();
    overlayTimelineRef.current = overlayTl;
    
    const cards = cardRefs.current.filter(Boolean);
    
    switch (mode) {
      case BoardViewMode.QuestionHistory:
      case BoardViewMode.EliminationPath:
        // Fade in overlays with bounce
        cards.forEach((card, index) => {
          if (!card) return;
          const overlays = card.querySelectorAll('.question-overlay, .elimination-overlay');
          if (overlays.length > 0) {
            overlayTl.fromTo(overlays,
              { opacity: 0, scale: 0, rotation: -180 },
              { 
                opacity: 1, 
                scale: 1, 
                rotation: 0,
                duration: 0.4,
                delay: index * 0.02,
                ease: "back.out(2)"
              },
              index * 0.01
            );
          }
        });
        break;
    }
  }, [cardRefs, cleanupOverlayAnimations]);
  
  return {
    animateCardEntry: (index: number) => {
      const card = cardRefs.current[index];
      if (!card) return;
      
      gsap.fromTo(card, {
        scale: 0,
        opacity: 0,
        rotation: Math.random() * 360 - 180,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
      }, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        delay: index * 0.02,
        ease: "back.out(1.7)"
      });
    },
    
    animateCardExit: (index: number) => {
      const card = cardRefs.current[index];
      if (!card) return;
      
      gsap.to(card, {
        scale: 0,
        opacity: 0,
        rotation: Math.random() * 360 - 180,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        duration: 0.4,
        ease: "power2.in"
      });
    },
    
    animateOverlays,
    cleanupOverlayAnimations
  };
}