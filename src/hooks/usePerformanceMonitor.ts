import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // 성능 메트릭 로깅 (개발 모드에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${componentName}]:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          memoryUsage: (performance as any).memory ? {
            used: `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`,
            total: `${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB`,
          } : 'N/A'
        });
      }
    };
  });

  return {
    renderCount: renderCount.current,
    measureRender: (fn: () => void) => {
      const start = performance.now();
      fn();
      const end = performance.now();
      return end - start;
    }
  };
};

export default usePerformanceMonitor;
