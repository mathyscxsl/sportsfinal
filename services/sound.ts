import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio/build/AudioModule.types';

type SoundConfig = {
    volume: number;
    soundEnabled: boolean;
};

const registry = new Map<string, number>();
const instances = new Map<string, AudioPlayer>();
let audioModeSet = false;
let config: SoundConfig = { volume: 1.0, soundEnabled: true };

async function ensureAudioMode() {
    if (audioModeSet) return;
    try {
        await setAudioModeAsync({ playsInSilentMode: true });
        audioModeSet = true;
    } catch { }
}

export const Sound = {
    configure(opts: Partial<SoundConfig>) {
        config = { ...config, ...opts };
    },

    register(name: string, moduleId: number) {
        registry.set(name, moduleId);
    },

    async play(name: string) {
        if (!config.soundEnabled) return;
        await ensureAudioMode();
        const src = registry.get(name);
        if (!src) return;

        let snd = instances.get(name) || null;
        try {
            if (!snd) {
                snd = createAudioPlayer(src);
                snd.volume = config.volume;
                instances.set(name, snd);
            } else {
                snd.volume = config.volume;
            }
            snd.play();
        } catch { }
    },

    async unload(name?: string) {
        try {
            if (name) {
                const s = instances.get(name);
                if (s) { s.remove(); instances.delete(name); }
            } else {
                for (const s of instances.values()) { try { s.remove(); } catch { } }
                instances.clear();
            }
        } catch { }
    },
};

export default Sound;

try {
    const testModule = require('@/assets/sfx/test.mp3');
    Sound.register('test.mp3', testModule);
} catch { }
