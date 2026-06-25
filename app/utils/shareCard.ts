import { ACHIEVEMENTS, levelProgress, type GamificationStore } from '@/app/utils/gamificationStore';

export interface ShareCardData {
    username?: string;
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    unlockedAchievementTitles: string[];
}

const WIDTH = 1200;
const HEIGHT = 630;

export function buildShareCardData(gamification: GamificationStore, username?: string): ShareCardData {
    const { level, xpIntoLevel, xpForNextLevel } = levelProgress(gamification.xp);
    const unlockedAchievementTitles = ACHIEVEMENTS.filter((achievement) => gamification.achievements[achievement.id]).map(
        (achievement) => achievement.title
    );
    return { username, level, xpIntoLevel, xpForNextLevel, unlockedAchievementTitles };
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    if (width <= 0 || height <= 0) return;
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
}

// Draws a themed progress card to an off-screen canvas and resolves a PNG
// blob - used by ShareButton to share/download an image instead of just
// text, since this static-export app has no server-side OG image route.
export async function renderShareCard(data: ShareCardData): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    background.addColorStop(0, '#1e1b4b');
    background.addColorStop(1, '#312e81');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('Music Theory Cheatsheet', 60, 90);

    if (data.username) {
        ctx.fillStyle = '#c7d2fe';
        ctx.font = '28px sans-serif';
        ctx.fillText(`@${data.username}`, 60, 135);
    }

    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(150, 290, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(data.level), 150, 296);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`Level ${data.level}`, 270, 270);
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '24px sans-serif';
    ctx.fillText(`${data.xpIntoLevel} / ${data.xpForNextLevel} XP to next level`, 270, 310);

    const barX = 270;
    const barY = 330;
    const barWidth = 690;
    const barHeight = 18;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    fillRoundedRect(ctx, barX, barY, barWidth, barHeight, 9);
    const progress = data.xpForNextLevel > 0 ? Math.min(1, data.xpIntoLevel / data.xpForNextLevel) : 0;
    ctx.fillStyle = '#818cf8';
    fillRoundedRect(ctx, barX, barY, barWidth * progress, barHeight, 9);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${data.unlockedAchievementTitles.length} / ${ACHIEVEMENTS.length} Achievements`, 60, 440);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#c7d2fe';
    data.unlockedAchievementTitles
        .slice(-4)
        .reverse()
        .forEach((title, index) => {
            ctx.fillText(`• ${title}`, 60, 480 + index * 36);
        });

    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}
