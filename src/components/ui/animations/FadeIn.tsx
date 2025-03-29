
import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 500,
  once = true,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = elementRef.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && current) {
            observer.unobserve(current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [once]);

  const getDirectionStyles = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-10';
      case 'down':
        return 'translate-y-[-10px]';
      case 'left':
        return 'translate-x-10';
      case 'right':
        return 'translate-x-[-10px]';
      case 'none':
        return '';
      default:
        return 'translate-y-10';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 transform-none' : `opacity-0 ${getDirectionStyles()}`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

export default FadeIn;
