import React, { forwardRef } from 'react';
import { Button } from './ui/button';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  description?: string;
  ariaLabel?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    variant = 'default',
    size = 'default',
    loading = false,
    loadingText = '로딩 중...',
    description,
    ariaLabel,
    disabled,
    className,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    const buttonProps = {
      ref,
      variant,
      size,
      disabled: isDisabled,
      className,
      'aria-label': ariaLabel || (description ? `${children}, ${description}` : undefined),
      'aria-describedby': description ? `${props.id}-description` : undefined,
      'aria-disabled': isDisabled,
      ...props
    };

    return (
      <>
        <Button {...buttonProps}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              {loadingText}
            </>
          ) : (
            children
          )}
        </Button>
        {description && (
          <span id={`${props.id}-description`} className="sr-only">
            {description}
          </span>
        )}
      </>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
