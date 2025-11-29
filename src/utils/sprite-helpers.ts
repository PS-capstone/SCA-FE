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
    // clown fish
    1: { column: 7, row: 0 },

    // blue tang
    2: { column: 8, row: 1 },

    // Sea Horse
    3: { column: 4, row: 0 },

    // Pufferfish
    4: { column: 3, row: 1 },

    // jellyfish
    5: { column: 4, row: 4 },

    // Banded Butterflyfish
    6: { column: 0, row: 0 },

    // Sea Angel
    7: { column: 9, row: 4 },

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