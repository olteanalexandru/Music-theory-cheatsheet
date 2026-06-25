'use client';

import React, { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    label?: string;
    className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, label = 'Share', className = '' }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url ?? window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                return;
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                // Any other failure (unsupported data, permission, etc.) falls through to clipboard.
            }
        }

        try {
            await navigator.clipboard.writeText(`${text} ${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable in this context; nothing more we can do.
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 ${className}`}
        >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied!' : label}
        </button>
    );
};

export default ShareButton;
