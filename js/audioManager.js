/**
 * Audio Manager
 * Quản lý âm thanh hiệu ứng và nhạc nền
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.backgroundMusic = null;
        this.musicGainNode = null;
        this.isMuted = false;
        this.volume = 0.7;

        this.init();
    }

    init() {
        // Lazy init AudioContext on user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createSounds();
            }
        }, { once: true });
    }

    createSounds() {
        // Create synthesized sound effects
        this.sounds = {
            'messenger-send': () => this.playTone([800, 1000], 0.1, 'sine'),
            'messenger-receive': () => this.playTone([600, 800, 600], 0.15, 'sine'),
            'messenger-typing': () => this.playNoise(0.05),
            'soft-click': () => this.playTone([500], 0.05, 'square'),
            'soft-pop': () => this.playTone([400, 600], 0.08, 'sine'),
            'keyboard-soft': () => this.playNoise(0.03),
            'gemini-send': () => this.playTone([600, 900, 1200], 0.12, 'sine'),
            'gemini-receive': () => this.playTone([800, 600, 1000], 0.15, 'triangle'),
            'gemini-thinking': () => this.playNoise(0.04)
        };
    }

    playTone(frequencies, duration, type = 'sine') {
        if (!this.audioContext || this.isMuted) return;

        const now = this.audioContext.currentTime;

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, now + (index * duration / frequencies.length));

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(now + (index * duration / frequencies.length));
            oscillator.stop(now + duration + 0.1);
        });
    }

    playNoise(duration) {
        if (!this.audioContext || this.isMuted) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Background music generation
    generateBackgroundMusic(type = 'romantic', duration = 120) {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);

        // Music generation based on type
        const configs = {
            romantic: { baseFreq: 261.63, scale: [0, 2, 4, 5, 7, 9, 11], tempo: 0.5 },
            sad: { baseFreq: 220, scale: [0, 2, 3, 5, 7, 8, 10], tempo: 0.4 },
            happy: { baseFreq: 293.66, scale: [0, 2, 4, 5, 7, 9, 11], tempo: 0.7 },
            dramatic: { baseFreq: 196, scale: [0, 1, 4, 5, 7, 8, 11], tempo: 0.6 },
            comedy: { baseFreq: 329.63, scale: [0, 2, 4, 5, 7, 9, 11], tempo: 0.8 }
        };

        const config = configs[type] || configs.romantic;
        const noteLength = sampleRate / config.tempo;

        for (let i = 0; i < length; i++) {
            const noteIndex = Math.floor(i / noteLength);
            const scaleNote = config.scale[noteIndex % config.scale.length];
            const frequency = config.baseFreq * Math.pow(2, scaleNote / 12);

            const t = i / sampleRate;
            const envelope = Math.exp(-3 * (i % noteLength) / noteLength);

            // Simple sine wave with harmonics
            let sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
            sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2;
            sample += Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.3;

            sample *= envelope * 0.15;

            // Stereo effect
            leftChannel[i] = sample * (0.8 + 0.2 * Math.sin(t * 0.3));
            rightChannel[i] = sample * (0.8 + 0.2 * Math.cos(t * 0.3));
        }

        return buffer;
    }

    async loadCustomMusic(file) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    playBackgroundMusic(buffer, fadeIn = true) {
        if (!this.audioContext || !buffer) return;

        // Stop existing music
        this.stopBackgroundMusic();

        this.backgroundMusic = this.audioContext.createBufferSource();
        this.musicGainNode = this.audioContext.createGain();

        this.backgroundMusic.buffer = buffer;
        this.backgroundMusic.loop = true;

        if (fadeIn) {
            this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGainNode.gain.linearRampToValueAtTime(
                this.volume * 0.5,
                this.audioContext.currentTime + 2
            );
        } else {
            this.musicGainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
        }

        this.backgroundMusic.connect(this.musicGainNode);
        this.musicGainNode.connect(this.audioContext.destination);
        this.backgroundMusic.start();
    }

    stopBackgroundMusic(fadeOut = true) {
        if (!this.backgroundMusic || !this.musicGainNode) return;

        if (fadeOut) {
            this.musicGainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 2
            );
            setTimeout(() => {
                if (this.backgroundMusic) {
                    this.backgroundMusic.stop();
                    this.backgroundMusic = null;
                }
            }, 2000);
        } else {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime(
                this.isMuted ? 0 : this.volume * 0.5,
                this.audioContext.currentTime
            );
        }
        return this.isMuted;
    }

    // Generate audio buffer for video export
    async generateAudioTrack(messages, musicType, options = {}) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const {
            includeSfx = true,
            includeMusic = true,
            musicVolume = 0.5,
            sfxVolume = 0.7,
            fadeMusic = true
        } = options;

        // Calculate total duration
        let totalDuration = 0;
        messages.forEach(msg => {
            totalDuration += msg.delay || 2000;
        });
        totalDuration = totalDuration / 1000 + 3; // Add 3 seconds padding

        const sampleRate = this.audioContext.sampleRate;
        const length = Math.ceil(sampleRate * totalDuration);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        // Add background music
        if (includeMusic && musicType) {
            const musicBuffer = this.generateBackgroundMusic(musicType, totalDuration);
            if (musicBuffer) {
                const leftMusic = musicBuffer.getChannelData(0);
                const rightMusic = musicBuffer.getChannelData(1);
                const leftOut = buffer.getChannelData(0);
                const rightOut = buffer.getChannelData(1);

                for (let i = 0; i < length && i < leftMusic.length; i++) {
                    let fadeMultiplier = 1;

                    if (fadeMusic) {
                        // Fade in first 2 seconds
                        if (i < sampleRate * 2) {
                            fadeMultiplier = i / (sampleRate * 2);
                        }
                        // Fade out last 2 seconds
                        if (i > length - sampleRate * 2) {
                            fadeMultiplier = (length - i) / (sampleRate * 2);
                        }
                    }

                    leftOut[i] += leftMusic[i] * musicVolume * fadeMultiplier;
                    rightOut[i] += rightMusic[i] * musicVolume * fadeMultiplier;
                }
            }
        }

        return buffer;
    }
}

// Create global instance
window.audioManager = new AudioManager();
