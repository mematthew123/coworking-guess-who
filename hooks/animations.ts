'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  animationConfig: gsap.TweenVars,
  scrollConfig?: ScrollTrigger.Vars
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Set initial state
    gsap.set(element, { opacity: 0, ...animationConfig.from });

    // Create scroll-triggered animation
    const animation = gsap.to(element, {
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      ...animationConfig,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...scrollConfig,
      },
    });

    return () => {
      animation.kill();
    };
  }, [animationConfig, scrollConfig]);

  return elementRef;
};

// Hook for hero text animations
export const useHeroTextAnimation = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Split text into spans for each word
    const titleWords = titleRef.current.textContent?.split(' ') || [];
    const titleHTML = titleWords.map(word => `<span class="inline-block">${word}</span>`).join(' ');
    titleRef.current.innerHTML = titleHTML;

    const titleSpans = titleRef.current.querySelectorAll('span');

    // Animate title words
    tl.fromTo(
      titleSpans,
      {
        y: 100,
        opacity: 0,
        rotateX: -90,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.1,
      }
    );

    // Animate subtitle
    tl.fromTo(
      subtitleRef.current,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
      },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, []);

  return { titleRef, subtitleRef };
};

// Hook for floating elements
export const useFloatingAnimation = (config?: { duration?: number; y?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animation = gsap.to(elementRef.current, {
      y: config?.y || -20,
      duration: config?.duration || 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    return () => {
      animation.kill();
    };
  }, [config]);

  return elementRef;
};

// Hook for hover animations
export const useHoverAnimation = (
  hoverConfig: gsap.TweenVars = {},
  initialConfig: gsap.TweenVars = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Set initial state
    gsap.set(element, initialConfig);

    // Create hover listeners
    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
        ...hoverConfig,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hoverConfig, initialConfig]);

  return elementRef;
};

// Hook for parallax scrolling
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const animation = gsap.to(element, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
    };
  }, [speed]);

  return elementRef;
};

// Hook for stagger animations
export const useStaggerAnimation = (
  itemSelector: string,
  animationConfig: gsap.TweenVars = {},
  staggerConfig: number | gsap.StaggerVars = 0.1
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll(itemSelector);
    
    gsap.set(items, { opacity: 0, y: 50 });

    const animation = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: staggerConfig,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
      ...animationConfig,
    });

    return () => {
      animation.kill();
    };
  }, [itemSelector, animationConfig, staggerConfig]);

  return containerRef;
};

// Hook for morphing SVG animations
export const useMorphAnimation = (
  fromPath: string,
  toPath: string,
  config?: gsap.TweenVars
) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const animation = gsap.to(pathRef.current, {
      attr: { d: toPath },
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      ...config,
    });

    return () => {
      animation.kill();
    };
  }, [toPath, config]);

  return pathRef;
};

// Hook for count-up animations
export const useCountUp = (
  endValue: number,
  duration: number = 2,
  startValue: number = 0
) => {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const obj = { value: startValue };

    const animation = gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        if (elementRef.current) {
          elementRef.current.textContent = Math.round(obj.value).toString();
        }
      },
    });

    return () => {
      animation.kill();
    };
  }, [endValue, duration, startValue]);

  return elementRef;
};