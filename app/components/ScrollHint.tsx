'use client';

import React, { useEffect, useRef, useState } from 'react';

const FADE_PX = 28;

// Wraps a horizontally-scrollable region and fades whichever edge still has
// more content past it, using a CSS mask rather than an overlay - so it
// works over any background (themes, gradients, images) without needing to
// match a fade color. The fade disappears once that edge has nothing left
// to reveal, so it never falsely suggests there's more to scroll.
export default function ScrollHint({
    children,
    className = '',
    as: Tag = 'div',
}: {
    children: React.ReactNode;
    className?: string;
    as?: 'div' | 'nav';
}) {
    const ref = useRef<HTMLElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            setCanScrollLeft(el.scrollLeft > 2);
            setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
        };
        update();
        el.addEventListener('scroll', update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            el.removeEventListener('scroll', update);
            observer.disconnect();
        };
    }, []);

    const mask =
        canScrollLeft || canScrollRight
            ? `linear-gradient(to right, ${canScrollLeft ? 'transparent' : 'black'} 0%, black ${FADE_PX}px, black calc(100% - ${FADE_PX}px), ${
                  canScrollRight ? 'transparent' : 'black'
              } 100%)`
            : undefined;

    return (
        <Tag
            ref={ref as React.Ref<HTMLDivElement>}
            className={`overflow-x-auto overflow-y-hidden ${className}`}
            style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
        >
            {children}
        </Tag>
    );
}
