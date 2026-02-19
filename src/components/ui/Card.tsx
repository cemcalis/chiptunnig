import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: 'bg-gray-900 border border-gray-800',
            glass: 'bg-gray-900/50 backdrop-blur-md border border-white/10',
        };

        return (
            <div
                ref={ref}
                className={cn('rounded-lg p-6 shadow-xl', variants[variant], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

export { Card };
