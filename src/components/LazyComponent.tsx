import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    <span className="ml-2 text-slate-600">로딩 중...</span>
  </div>
);

export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: P & LazyComponentProps) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// 예시: 지연 로딩 컴포넌트들
export const LazyMeetingScheduler = createLazyComponent(
  () => import('../MeetingSchedulerMVP.jsx')
);

export const LazyUserDemoView = createLazyComponent(
  () => import('./UserDemoView.tsx')
);

export default LazyComponent;
