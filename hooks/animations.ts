'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

// NEW HOOKS FROM HERO SECTION

// Hook for 3D card tilt effect
export const use3DCardEffect = (perspective: number = 1000) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * -20;
      const rotateY = (x - 0.5) * 20;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: perspective,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [perspective]);

  return cardRef;
};

// Hook for elastic button animations
export const useElasticButton = <T extends HTMLElement = HTMLElement>(config?: { delay?: number }) => {
  const buttonRef = useRef<T>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    gsap.fromTo(
      buttonRef.current,
      { y: 50, opacity: 0, scale: 0.8, rotateX: -30 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.8,
        delay: config?.delay || 0,
        ease: 'elastic.out(1, 0.5)',
        transformPerspective: 1000,
      }
    );
  }, [config?.delay]);

  return buttonRef;
};

// Hook for particle system
export const useParticleSystem = (particleCount: number = 50) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['#60A5FA', '#F472B6', '#818CF8'];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + '30';
        ctx.fill();

        // Draw connections
        particles.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = particle.color + Math.floor((1 - distance / 150) * 20).toString(16);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount]);

  return canvasRef;
};

// Hook for magnetic hover effect
export const useMagneticHover = (force: number = 20, threshold: number = 200) => {
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  
  const setElementRef = useCallback((index: number) => (el: HTMLElement | null) => {
    elementsRef.current[index] = el;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      elementsRef.current.forEach((element) => {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const elementX = rect.left + rect.width / 2;
        const elementY = rect.top + rect.height / 2;

        const distX = e.clientX - elementX;
        const distY = e.clientY - elementY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < threshold) {
          const strength = (1 - distance / threshold) * force;
          const pushX = (distX / distance) * strength;
          const pushY = (distY / distance) * strength;

          gsap.to(element, {
            x: pushX,
            y: pushY,
            duration: 0.3,
            ease: 'power2.out',
          });
        } else {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [force, threshold]);

  return { setElementRef, elementsRef };
};

// Hook for continuous rotation
export const useContinuousRotation = <T extends HTMLElement = HTMLElement>(duration: number = 30) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animation = gsap.to(elementRef.current, {
      rotation: 360,
      duration,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      animation.kill();
    };
  }, [duration]);

  return elementRef;
};

// Hook for phase-based animations
export const usePhaseAnimation = <T extends string>(
  phases: T[],
  phaseDuration: number = 3000
) => {
  const [currentPhase, setCurrentPhase] = useState<T>(phases[0]);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, phaseDuration);

    return () => clearInterval(interval);
  }, [phases.length, phaseDuration]);

  useEffect(() => {
    setCurrentPhase(phases[phaseIndex]);
  }, [phaseIndex, phases]);

  return { currentPhase, phaseIndex };
};

// Hook for wave SVG animation
export const useWaveAnimation = (amplitude: number = 20, frequency: number = 2) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const baseD = path.getAttribute('d') || '';

    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Parse and modify the path
      const modifiedD = baseD.replace(/C[\d\s,.-]+/g, (match) => {
        const numbers = match.match(/-?\d+\.?\d*/g)?.map(Number) || [];
        if (numbers.length >= 6) {
          numbers[1] = numbers[1] + Math.sin(time * frequency) * amplitude;
          numbers[3] = numbers[3] + Math.sin(time * frequency + Math.PI) * amplitude;
        }
        return `C${numbers.join(',')}`;
      });

      path.setAttribute('d', modifiedD);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [amplitude, frequency]);

  return pathRef;
};

// Hook for reveal animation on scroll
export const useRevealAnimation = <T extends HTMLElement = HTMLElement>(config?: {
  threshold?: number;
  duration?: number;
  delay?: number;
}) => {
  const elementRef = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRevealed) {
          setIsRevealed(true);
          gsap.fromTo(
            elementRef.current,
            {
              opacity: 0,
              y: 50,
              scale: 0.9,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: config?.duration || 0.8,
              delay: config?.delay || 0,
              ease: 'power3.out',
            }
          );
        }
      },
      { threshold: config?.threshold || 0.1 }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isRevealed, config]);

  return elementRef;
};