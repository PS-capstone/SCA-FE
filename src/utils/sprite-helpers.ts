import { SPRITE_SIZE } from '../styles/images';
import shark_anim from '../styles/encyclopedia/Shark.png';
import octopus_anim from '../styles/encyclopedia/Octopus.png';
import turtle_anim from '../styles/encyclopedia/Turtle.png';
import eel_anim from '../styles/encyclopedia/ElectricEel.png';
import ghost_whale_anim from '../styles/encyclopedia/GhostWaleSprite.png';
import sea_serpent_anim from '../styles/encyclopedia/SeaSerpentSprite.png';

export const getSpritePosition = (columnIndex: number, rowIndex: number): string => {
    const xOffset = -(columnIndex * SPRITE_SIZE);
    const yOffset = -(rowIndex * SPRITE_SIZE);

    return `${xOffset}px ${yOffset}px`;
};

export const FISH_ICONS: { [key: number]: { 
    column: number, 
    row: number, 
    isAnimated?: boolean, 
    animation?: { url: string, frames: number, duration?: number, frameSize: number } 
} } = {
    // 1. 해파리 - jellyfish
    1: { column: 4, row: 4 },

    // 2. 열대어 - Banded Butterflyfish
    2: { column: 0, row: 0 },

    // 3. 해마 - Sea Horse
    3: { column: 4, row: 0 },

    // 4. 복어 - Pufferfish
    4: { column: 3, row: 1 },

    // 5. 흰동가리 - clown fish
    5: { column: 7, row: 0 },

    // 6. 금붕어 - blue tang
    6: { column: 8, row: 1 },

    // 7. 구피 - Sea Angel
    7: { column: 9, row: 4 },

    // 8. 바다거북 - turtle (animated)
    8: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: turtle_anim, 
            frames: 6,
            duration: 0.8,
            frameSize: 48
        }
    },

    // 9. 문어 - octopus (animated)
    9: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: octopus_anim, 
            frames: 6,
            duration: 0.8,
            frameSize: 48
        }
    },

    // 10. 상어 - shark (animated)
    10: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: shark_anim, 
            frames: 4,
            duration: 0.6,
            frameSize: 48
        }
    },

    // 11. 전기뱀장어 - eel (animated)
    11: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: eel_anim, 
            frames: 6,
            duration: 0.8,
            frameSize: 48
        }
    },

    // 12. 심해해룡 - sea serpent (animated)
    12: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: sea_serpent_anim, 
            frames: 4,
            duration: 0.6,
            frameSize: 96
        }
    },

    // 13. 리바이어던 - ghost whale (animated)
    13: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: ghost_whale_anim, 
            frames: 4,
            duration: 0.6,
            frameSize: 96
        }
    }
};