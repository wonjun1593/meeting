import { useEffect, useRef, useCallback } from 'react';

interface AccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardNavigation = true
  } = options;

  const announceRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLElement | null>(null);

  // 스크린 리더를 위한 변경사항 알림
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !announceRef.current) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    announceRef.current.appendChild(announcement);

    // 알림 후 정리
    setTimeout(() => {
      if (announceRef.current?.contains(announcement)) {
        announceRef.current.removeChild(announcement);
      }
    }, 1000);
  }, [announceChanges]);

  // 포커스 관리
  const setFocus = useCallback((element: HTMLElement | null) => {
    if (!focusManagement) return;
    
    focusRef.current = element;
    element?.focus();
  }, [focusManagement]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((event: KeyboardEvent, handlers: Record<string, () => void>) => {
    if (!keyboardNavigation) return;

    const { key, ctrlKey, altKey, shiftKey } = event;
    const keyCombo = `${ctrlKey ? 'Ctrl+' : ''}${altKey ? 'Alt+' : ''}${shiftKey ? 'Shift+' : ''}${key}`;
    
    if (handlers[keyCombo] || handlers[key]) {
      event.preventDefault();
      (handlers[keyCombo] || handlers[key])();
    }
  }, [keyboardNavigation]);

  // ARIA 라벨 생성
  const createAriaLabel = useCallback((label: string, description?: string) => {
    return description ? `${label}, ${description}` : label;
  }, []);

  // 포커스 트랩 (모달 등에서 사용)
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  useEffect(() => {
    // 접근성 개선을 위한 전역 설정
    document.documentElement.setAttribute('lang', 'ko');
    
    return () => {
      // 정리 작업
    };
  }, []);

  return {
    announce,
    setFocus,
    handleKeyDown,
    createAriaLabel,
    trapFocus,
    announceRef,
    focusRef
  };
};

export default useAccessibility;
