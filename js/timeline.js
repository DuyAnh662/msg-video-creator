/**
 * Timeline Manager
 * Drag-and-drop timeline với playhead và zoom
 */

class TimelineManager {
    constructor(container, options = {}) {
        this.container = container;
        this.trackElement = document.getElementById('timeline-track');
        this.itemsElement = document.getElementById('timeline-items');
        this.playheadElement = document.getElementById('timeline-playhead');

        this.messages = [];
        this.zoom = 1;
        this.pixelsPerSecond = 100;
        this.currentTime = 0;
        this.totalDuration = 0;

        this.isPlaying = false;
        this.isDragging = false;
        this.draggedItem = null;
        this.draggedIndex = -1;

        this.onReorder = options.onReorder || (() => { });
        this.onSeek = options.onSeek || (() => { });

        this.init();
    }

    init() {
        // Zoom controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.setZoom(this.zoom * 1.2));
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.setZoom(this.zoom / 1.2));

        // Track click to seek
        this.trackElement?.addEventListener('click', (e) => {
            if (e.target === this.trackElement || e.target === this.itemsElement) {
                const rect = this.trackElement.getBoundingClientRect();
                const x = e.clientX - rect.left + this.trackElement.scrollLeft;
                const time = (x / (this.pixelsPerSecond * this.zoom)) * 1000;
                this.seekTo(time);
            }
        });
    }

    setMessages(messages) {
        this.messages = messages;
        this.calculateDuration();
        this.render();
    }

    calculateDuration() {
        this.totalDuration = 0;
        this.messages.forEach(msg => {
            this.totalDuration += msg.delay || 2000;
        });
        this.totalDuration += 2000; // Padding
    }

    render() {
        if (!this.itemsElement) return;

        this.itemsElement.innerHTML = '';

        let currentTime = 500;

        this.messages.forEach((msg, index) => {
            const item = document.createElement('div');
            item.className = `timeline-item ${msg.sender === 'A' ? 'sent' : 'received'}`;
            item.draggable = true;
            item.dataset.index = index;

            // Calculate width based on message delay
            const duration = msg.delay || 2000;
            const width = (duration / 1000) * this.pixelsPerSecond * this.zoom;
            item.style.width = `${Math.max(60, width)}px`;
            item.style.left = `${(currentTime / 1000) * this.pixelsPerSecond * this.zoom}px`;

            // Truncate text
            const maxChars = Math.floor(width / 8);
            const displayText = msg.text.length > maxChars ?
                msg.text.substring(0, maxChars) + '...' :
                msg.text;

            item.innerHTML = `
                <span class="timeline-item-sender">${msg.sender}</span>
                <span class="timeline-item-text">${displayText}</span>
            `;

            // Drag events
            item.addEventListener('dragstart', (e) => this.onDragStart(e, index));
            item.addEventListener('dragend', (e) => this.onDragEnd(e));
            item.addEventListener('dragover', (e) => this.onDragOver(e, index));
            item.addEventListener('drop', (e) => this.onDrop(e, index));

            this.itemsElement.appendChild(item);

            currentTime += duration;
        });

        // Update timeline width
        const totalWidth = (this.totalDuration / 1000) * this.pixelsPerSecond * this.zoom;
        this.itemsElement.style.width = `${totalWidth}px`;

        // Update time display
        this.updateTimeDisplay();
    }

    onDragStart(e, index) {
        this.isDragging = true;
        this.draggedIndex = index;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
    }

    onDragEnd(e) {
        this.isDragging = false;
        this.draggedIndex = -1;
        e.target.classList.remove('dragging');

        // Remove all drag-over states
        this.itemsElement.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    onDragOver(e, index) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this.draggedIndex !== index) {
            e.target.classList.add('drag-over');
        }
    }

    onDrop(e, targetIndex) {
        e.preventDefault();

        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (sourceIndex !== targetIndex) {
            // Reorder messages
            const [movedItem] = this.messages.splice(sourceIndex, 1);
            this.messages.splice(targetIndex, 0, movedItem);

            this.render();
            this.onReorder(this.messages);
        }

        e.target.classList.remove('drag-over');
    }

    setZoom(newZoom) {
        this.zoom = Math.max(0.5, Math.min(3, newZoom));
        this.render();
    }

    setCurrentTime(time) {
        this.currentTime = time;
        this.updatePlayhead();
        this.updateTimeDisplay();
    }

    seekTo(time) {
        this.currentTime = Math.max(0, Math.min(time, this.totalDuration));
        this.updatePlayhead();
        this.updateTimeDisplay();
        this.onSeek(this.currentTime);
    }

    updatePlayhead() {
        if (!this.playheadElement) return;

        const position = (this.currentTime / 1000) * this.pixelsPerSecond * this.zoom;
        this.playheadElement.style.left = `${position}px`;

        // Auto-scroll if playhead is out of view
        const containerRect = this.trackElement.getBoundingClientRect();
        const playheadPosition = position - this.trackElement.scrollLeft;

        if (playheadPosition > containerRect.width - 50) {
            this.trackElement.scrollLeft = position - containerRect.width / 2;
        } else if (playheadPosition < 50) {
            this.trackElement.scrollLeft = position - 50;
        }
    }

    updateTimeDisplay() {
        const currentTimeEl = document.getElementById('current-time');
        const totalTimeEl = document.getElementById('total-time');

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.currentTime);
        }
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.totalDuration);
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.currentTime = 0;
        this.updatePlayhead();
        this.updateTimeDisplay();
    }
}

// Audio waveform visualization
class AudioWaveform {
    constructor(container) {
        this.container = container;
    }

    visualize(audioBuffer) {
        if (!audioBuffer || !this.container) return;

        this.container.innerHTML = '';

        const data = audioBuffer.getChannelData(0);
        const samples = 100;
        const blockSize = Math.floor(data.length / samples);

        for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(data[i * blockSize + j]);
            }
            const avg = sum / blockSize;
            const height = Math.max(4, avg * 100);

            const bar = document.createElement('div');
            bar.className = 'audio-waveform-bar';
            bar.style.height = `${height}px`;
            this.container.appendChild(bar);
        }
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export
window.TimelineManager = TimelineManager;
window.AudioWaveform = AudioWaveform;
