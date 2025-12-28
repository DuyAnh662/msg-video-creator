/**
 * Video Renderer
 * Canvas-based video rendering với animations như Messenger
 */

class VideoRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.messages = [];
        this.currentTheme = 'messenger';
        this.avatars = { A: null, B: null };
        this.names = { A: 'Người A', B: 'Người B' };

        // Animation state
        this.isPlaying = false;
        this.currentFrame = 0;
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.lastFrameTime = 0;

        // Visible messages during playback
        this.visibleMessages = [];
        this.typingState = { active: false, sender: null };

        // Recording state
        this.isRecording = false;
        this.recordedFrames = [];
        this.mediaRecorder = null;

        // Format settings
        this.format = '16:9';
        this.dimensions = {
            '16:9': { width: 1920, height: 1080 },
            '9:16': { width: 1080, height: 1920 }
        };
    }

    setMessages(messages) {
        this.messages = messages.map((msg, index) => ({
            ...msg,
            id: msg.id || `msg_${index}`,
            delay: msg.delay || 1500 + msg.text.length * 30,
            startTime: 0,
            animationProgress: 0
        }));

        // Calculate start times
        let currentTime = 500; // Initial delay
        this.messages.forEach(msg => {
            msg.startTime = currentTime;
            currentTime += msg.delay;
        });

        this.totalDuration = currentTime + 2000; // Extra time at end
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
    }

    setAvatars(avatarA, avatarB) {
        this.avatars.A = avatarA;
        this.avatars.B = avatarB;
    }

    setNames(nameA, nameB) {
        this.names.A = nameA || 'Người A';
        this.names.B = nameB || 'Người B';
    }

    setFormat(format) {
        this.format = format;
        const dims = this.dimensions[format];
        this.canvas.width = dims.width;
        this.canvas.height = dims.height;
    }

    // Easing functions
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    // Get current time in playback
    getCurrentTime() {
        return this.currentFrame * this.frameInterval;
    }

    // Draw frame at specific time
    drawFrame(time) {
        const ctx = this.ctx;
        const theme = window.THEMES[this.currentTheme];
        const dims = this.dimensions[this.format];

        // Clear canvas
        ctx.clearRect(0, 0, dims.width, dims.height);

        // Draw background
        this.drawBackground(theme);

        // Draw header
        this.drawHeader(theme);

        // Calculate visible messages
        this.updateVisibleMessages(time);

        // Draw messages
        this.drawMessages(theme, time);

        // Draw typing indicator if active
        if (this.typingState.active) {
            this.drawTypingIndicator(theme);
        }
    }

    drawBackground(theme) {
        const ctx = this.ctx;
        const dims = this.dimensions[this.format];

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, dims.height);
        gradient.addColorStop(0, theme.styles.background);
        gradient.addColorStop(1, this.adjustColor(theme.styles.background, -20));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, dims.width, dims.height);
    }

    drawHeader(theme) {
        const ctx = this.ctx;
        const dims = this.dimensions[this.format];
        const scale = this.format === '9:16' ? 1.5 : 1;

        const headerHeight = 100 * scale;

        // Header background
        ctx.fillStyle = theme.styles.headerBg;
        ctx.fillRect(0, 0, dims.width, headerHeight);

        // Avatar
        const avatarSize = 50 * scale;
        const avatarX = 30 * scale;
        const avatarY = (headerHeight - avatarSize) / 2;

        ctx.save();
        ctx.beginPath();
        if (theme.styles.avatarShape === 'square') {
            ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 8 * scale);
        } else {
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        }
        ctx.clip();

        if (this.avatars.B) {
            ctx.drawImage(this.avatars.B, avatarX, avatarY, avatarSize, avatarSize);
        } else {
            // Default gradient avatar
            const avatarGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
            avatarGradient.addColorStop(0, '#ec4899');
            avatarGradient.addColorStop(1, '#f97316');
            ctx.fillStyle = avatarGradient;
            ctx.fill();

            // Letter
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${24 * scale}px ${theme.styles.font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('B', avatarX + avatarSize / 2, avatarY + avatarSize / 2);
        }
        ctx.restore();

        // Name and status
        const textX = avatarX + avatarSize + 15 * scale;

        ctx.fillStyle = theme.styles.textColor;
        ctx.font = `600 ${20 * scale}px ${theme.styles.font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.names.B, textX, headerHeight / 2 - 12 * scale);

        ctx.fillStyle = theme.styles.statusColor;
        ctx.font = `${14 * scale}px ${theme.styles.font}`;
        ctx.fillText('Đang hoạt động', textX, headerHeight / 2 + 12 * scale);
    }

    updateVisibleMessages(time) {
        this.visibleMessages = [];
        this.typingState.active = false;

        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];

            if (time >= msg.startTime) {
                // Message is visible
                const animTime = time - msg.startTime;
                const animDuration = 300; // 300ms animation
                const progress = Math.min(1, animTime / animDuration);

                this.visibleMessages.push({
                    ...msg,
                    animationProgress: this.easeOutBack(progress)
                });
            } else if (time >= msg.startTime - 1000 && time < msg.startTime) {
                // Show typing indicator before message appears
                this.typingState.active = true;
                this.typingState.sender = msg.sender;
                break;
            }
        }
    }

    drawMessages(theme, time) {
        const ctx = this.ctx;
        const dims = this.dimensions[this.format];
        const scale = this.format === '9:16' ? 1.5 : 1;

        const startY = 120 * scale;
        const padding = 30 * scale;
        const bubbleMaxWidth = (dims.width - padding * 2) * 0.7;
        const bubblePadding = 15 * scale;
        const lineHeight = 24 * scale;
        const bubbleGap = 12 * scale;

        let currentY = startY;

        this.visibleMessages.forEach((msg, index) => {
            const isSent = msg.sender === 'A';
            const styles = window.getBubbleStyles(this.currentTheme, isSent);

            // Measure text
            ctx.font = `${16 * scale}px ${theme.styles.font}`;
            const words = msg.text.split(' ');
            const lines = [];
            let currentLine = '';

            words.forEach(word => {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const metrics = ctx.measureText(testLine);

                if (metrics.width > bubbleMaxWidth - bubblePadding * 2) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) lines.push(currentLine);

            // Calculate bubble dimensions
            const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
            const bubbleWidth = textWidth + bubblePadding * 2;
            const bubbleHeight = lines.length * lineHeight + bubblePadding * 2;

            // Animation
            const progress = msg.animationProgress;
            const scaleAnim = 0.8 + 0.2 * progress;
            const alphaAnim = progress;
            const slideOffset = (1 - progress) * 20 * (isSent ? 1 : -1);

            // Position
            let bubbleX;
            if (isSent) {
                bubbleX = dims.width - padding - bubbleWidth + slideOffset;
            } else {
                bubbleX = padding + 40 * scale + slideOffset; // Extra space for avatar
            }

            ctx.save();
            ctx.globalAlpha = alphaAnim;

            // Draw avatar for received messages
            if (!isSent) {
                const avatarSize = 32 * scale;
                ctx.save();
                ctx.beginPath();
                ctx.arc(padding + avatarSize / 2, currentY + bubbleHeight - avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                ctx.clip();

                if (this.avatars.B) {
                    ctx.drawImage(this.avatars.B, padding, currentY + bubbleHeight - avatarSize, avatarSize, avatarSize);
                } else {
                    const avatarGradient = ctx.createLinearGradient(padding, currentY, padding + avatarSize, currentY + avatarSize);
                    avatarGradient.addColorStop(0, '#ec4899');
                    avatarGradient.addColorStop(1, '#f97316');
                    ctx.fillStyle = avatarGradient;
                    ctx.fill();
                }
                ctx.restore();
            }

            // Draw bubble
            ctx.save();
            ctx.translate(bubbleX + bubbleWidth / 2, currentY + bubbleHeight / 2);
            ctx.scale(scaleAnim, scaleAnim);
            ctx.translate(-bubbleWidth / 2, -bubbleHeight / 2);

            // Bubble background
            const radius = parseFloat(styles.borderRadius) * scale;
            ctx.beginPath();
            this.roundRect(ctx, 0, 0, bubbleWidth, bubbleHeight, radius, isSent);

            if (styles.background.includes('gradient')) {
                const gradient = ctx.createLinearGradient(0, 0, 0, bubbleHeight);
                gradient.addColorStop(0, '#0084ff');
                gradient.addColorStop(1, '#00c6ff');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = styles.background;
            }
            ctx.fill();

            if (styles.border && styles.border !== 'none') {
                ctx.strokeStyle = styles.border.split(' ').pop();
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Draw text
            ctx.fillStyle = styles.color;
            ctx.font = `${16 * scale}px ${theme.styles.font}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            lines.forEach((line, lineIndex) => {
                ctx.fillText(line, bubblePadding, bubblePadding + lineIndex * lineHeight);
            });

            ctx.restore();
            ctx.restore();

            currentY += bubbleHeight + bubbleGap;
        });
    }

    drawTypingIndicator(theme) {
        const ctx = this.ctx;
        const dims = this.dimensions[this.format];
        const scale = this.format === '9:16' ? 1.5 : 1;

        const padding = 30 * scale;
        const avatarSize = 32 * scale;

        // Calculate Y position (after all visible messages)
        let currentY = 120 * scale;
        this.visibleMessages.forEach(msg => {
            const lines = Math.ceil(msg.text.length / 30); // Rough estimate
            currentY += (lines * 24 + 30) * scale + 12 * scale;
        });

        const bubbleWidth = 70 * scale;
        const bubbleHeight = 40 * scale;
        const bubbleX = padding + 40 * scale;

        // Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(padding + avatarSize / 2, currentY + bubbleHeight / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();

        const avatarGradient = ctx.createLinearGradient(padding, currentY, padding + avatarSize, currentY + avatarSize);
        avatarGradient.addColorStop(0, '#ec4899');
        avatarGradient.addColorStop(1, '#f97316');
        ctx.fillStyle = avatarGradient;
        ctx.fill();
        ctx.restore();

        // Bubble
        ctx.fillStyle = theme.styles.typingBubble;
        ctx.beginPath();
        this.roundRect(ctx, bubbleX, currentY, bubbleWidth, bubbleHeight, 18 * scale, false);
        ctx.fill();

        // Animated dots
        const time = this.getCurrentTime();
        const dotRadius = 5 * scale;
        const dotGap = 8 * scale;
        const dotsStartX = bubbleX + bubbleWidth / 2 - dotGap;
        const dotsY = currentY + bubbleHeight / 2;

        for (let i = 0; i < 3; i++) {
            const offset = Math.sin((time / 200) + i * 0.5) * 4 * scale;
            ctx.fillStyle = theme.styles.typingDots;
            ctx.beginPath();
            ctx.arc(dotsStartX + i * dotGap, dotsY + offset, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    roundRect(ctx, x, y, width, height, radius, isSent) {
        const bottomRadius = 4;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - (isSent ? bottomRadius : radius));
        ctx.quadraticCurveTo(x + width, y + height, x + width - (isSent ? bottomRadius : radius), y + height);
        ctx.lineTo(x + (isSent ? radius : bottomRadius), y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - (isSent ? radius : bottomRadius));
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    adjustColor(color, amount) {
        // Simple color adjustment
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            const r = Math.min(255, Math.max(0, (num >> 16) + amount));
            const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
            const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
            return `rgb(${r}, ${g}, ${b})`;
        }
        return color;
    }

    // Playback controls
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.visibleMessages = [];
        this.typingState = { active: false, sender: null };
        this.drawFrame(0);
    }

    seek(time) {
        this.currentFrame = Math.floor(time / this.frameInterval);
        this.drawFrame(time);
    }

    animate() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;

        if (elapsed >= this.frameInterval) {
            this.currentFrame++;
            const currentTime = this.getCurrentTime();

            if (currentTime >= this.totalDuration) {
                this.isPlaying = false;
                this.onPlaybackComplete?.();
                return;
            }

            this.drawFrame(currentTime);
            this.lastFrameTime = now - (elapsed % this.frameInterval);
        }

        requestAnimationFrame(() => this.animate());
    }

    // Get total duration
    getTotalDuration() {
        return this.totalDuration || 0;
    }

    // Export frames for video encoding
    async captureFrames(progressCallback) {
        const frames = [];
        const totalFrames = Math.ceil(this.totalDuration / this.frameInterval);

        for (let frame = 0; frame < totalFrames; frame++) {
            const time = frame * this.frameInterval;
            this.drawFrame(time);

            // Capture frame as blob
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/webp', 0.9);
            });

            frames.push(blob);

            if (progressCallback) {
                progressCallback(frame / totalFrames);
            }
        }

        return frames;
    }
}

// Export
window.VideoRenderer = VideoRenderer;
