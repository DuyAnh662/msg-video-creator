/**
 * Main Application
 * Kết nối tất cả modules và xử lý UI
 * Sử dụng MediaRecorder API để xuất video (không cần FFmpeg)
 */

class App {
    constructor() {
        // State
        this.messages = [];
        this.currentTheme = 'messenger';
        this.currentFormat = '16:9';
        this.currentGenre = 'drama';
        this.currentSender = 'A';

        this.avatars = {
            A: null,
            B: null
        };

        this.names = {
            A: 'Người A',
            B: 'Người B'
        };

        this.musicType = '';
        this.customMusic = null;
        this.musicVolume = 0.7;
        this.fadeMusic = true;

        this.soundEffects = {
            send: true,
            receive: true,
            typing: true
        };

        // Templates storage
        this.templates = [];

        // Modules
        this.renderer = null;
        this.timeline = null;

        // Recording state
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];

        this.init();
    }

    async init() {
        // Wait for i18n and theme manager to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize canvas renderer
        const canvas = document.getElementById('render-canvas');
        this.renderer = new VideoRenderer(canvas);

        // Initialize timeline
        this.timeline = new TimelineManager(document.querySelector('.timeline-container'), {
            onReorder: (messages) => this.onMessagesReorder(messages),
            onSeek: (time) => this.onTimelineSeek(time)
        });

        // Initialize audio waveform
        this.audioWaveform = new AudioWaveform(document.getElementById('audio-waveform'));

        // Load avatars
        this.loadDefaultAvatars();

        // Load saved templates
        this.loadTemplates();

        // Bind events
        this.bindEvents();

        // Add demo messages
        this.addDemoMessages();

        // Check API Keys
        this.checkAPIKeys();

        console.log('🎬 MSG Video Creator initialized!');
    }

    loadDefaultAvatars() {
        // Set default SVG avatars
        document.getElementById('avatar-a-img').src = DEFAULT_AVATARS.A;
        document.getElementById('avatar-b-img').src = DEFAULT_AVATARS.B;
        document.getElementById('receiver-avatar-display').src = DEFAULT_AVATARS.B;
        document.getElementById('typing-avatar-img').src = DEFAULT_AVATARS.B;
    }

    bindEvents() {
        // Genre selection
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentGenre = btn.dataset.genre;
            });
        });

        // AI Generate button
        document.getElementById('generate-ai-btn')?.addEventListener('click', () => this.generateAIScript());

        // Chat theme selection (Messenger/ChatGPT/Gemini)
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTheme = btn.dataset.theme;
                this.applyChatTheme();
                this.updatePreview();
            });
        });

        // Format selection
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFormat = btn.dataset.format;
                this.updatePhoneFrame();
                this.updatePreview();
            });
        });

        // Sender toggle
        document.querySelectorAll('.sender-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sender-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSender = btn.dataset.sender;
            });
        });

        // Add message
        document.getElementById('add-message-btn')?.addEventListener('click', () => this.addMessage());
        document.getElementById('new-message-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMessage();
        });

        // Avatar uploads
        document.getElementById('avatar-a-btn')?.addEventListener('click', () => {
            document.getElementById('avatar-a-input').click();
        });
        document.getElementById('avatar-b-btn')?.addEventListener('click', () => {
            document.getElementById('avatar-b-input').click();
        });

        document.getElementById('avatar-a-input')?.addEventListener('change', (e) => this.handleAvatarUpload(e, 'A'));
        document.getElementById('avatar-b-input')?.addEventListener('change', (e) => this.handleAvatarUpload(e, 'B'));

        // Name inputs
        document.getElementById('name-a-input')?.addEventListener('change', (e) => {
            this.names.A = e.target.value || 'Người A';
            this.updatePreview();
        });
        document.getElementById('name-b-input')?.addEventListener('change', (e) => {
            this.names.B = e.target.value || 'Người B';
            document.getElementById('receiver-name-display').textContent = this.names.B;
            this.updatePreview();
        });

        // Music selection
        document.getElementById('music-select')?.addEventListener('change', (e) => {
            this.musicType = e.target.value;
            this.updateAudioWaveform();
        });

        // Custom music upload
        document.getElementById('custom-music-input')?.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                this.customMusic = await window.audioManager.loadCustomMusic(e.target.files[0]);
                this.musicType = 'custom';
                this.updateAudioWaveform();
            }
        });

        // Volume slider
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.musicVolume = e.target.value / 100;
            document.getElementById('volume-value').textContent = e.target.value;
            window.audioManager.setVolume(this.musicVolume);
        });

        // Fade toggle
        document.getElementById('fade-music')?.addEventListener('change', (e) => {
            this.fadeMusic = e.target.checked;
        });

        // Sound effects toggles
        document.getElementById('sound-send')?.addEventListener('change', (e) => {
            this.soundEffects.send = e.target.checked;
        });
        document.getElementById('sound-receive')?.addEventListener('change', (e) => {
            this.soundEffects.receive = e.target.checked;
        });
        document.getElementById('sound-typing')?.addEventListener('change', (e) => {
            this.soundEffects.typing = e.target.checked;
        });

        // Preview controls
        document.getElementById('preview-play-btn')?.addEventListener('click', () => this.togglePreviewPlay());
        document.getElementById('preview-reset-btn')?.addEventListener('click', () => this.resetPreview());
        document.getElementById('preview-full-btn')?.addEventListener('click', () => this.playFullPreview());

        // Export button
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportVideo());

        // Save template button
        document.getElementById('save-template-btn')?.addEventListener('click', () => this.saveTemplate());

        // Templates modal
        document.getElementById('saved-templates-btn')?.addEventListener('click', () => this.showTemplatesModal());
        document.getElementById('close-templates-modal')?.addEventListener('click', () => this.hideTemplatesModal());

        // AI Script modal
        document.getElementById('close-ai-modal')?.addEventListener('click', () => this.hideAIModal());
        document.getElementById('regenerate-script-btn')?.addEventListener('click', () => this.generateAIScript());
        document.getElementById('accept-script-btn')?.addEventListener('click', () => this.acceptAIScript());

        // Modal backdrop clicks
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
            });
        });

        // Settings Modal
        document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettingsModal());
        document.getElementById('close-settings-modal')?.addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());
    }

    // Settings Management
    showSettingsModal() {
        document.getElementById('groq-key-input').value = localStorage.getItem('groq_key') || '';
        document.getElementById('openai-key-input').value = localStorage.getItem('openai_key') || '';
        document.getElementById('gemini-key-input').value = localStorage.getItem('gemini_key') || '';
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    saveSettings() {
        const groqKey = document.getElementById('groq-key-input').value.trim();
        const openaiKey = document.getElementById('openai-key-input').value.trim();
        const geminiKey = document.getElementById('gemini-key-input').value.trim();

        if (groqKey) localStorage.setItem('groq_key', groqKey);
        else localStorage.removeItem('groq_key');

        if (openaiKey) localStorage.setItem('openai_key', openaiKey);
        else localStorage.removeItem('openai_key');

        if (geminiKey) localStorage.setItem('gemini_key', geminiKey);
        else localStorage.removeItem('gemini_key');

        this.checkAPIKeys();
        this.hideSettingsModal();
        alert('Đã lưu cài đặt API Key!');
    }

    checkAPIKeys() {
        const hasGroq = !!localStorage.getItem('groq_key');
        const hasOpenAI = !!localStorage.getItem('openai_key');
        const hasGemini = !!localStorage.getItem('gemini_key');

        const warning = document.getElementById('ai-key-warning');
        if (!hasGroq && !hasOpenAI && !hasGemini) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }

    // Add demo messages
    addDemoMessages() {
        this.messages = [
            { sender: 'A', text: 'Này, bạn có rảnh không?', emotion: 'casual', delay: 1500 },
            { sender: 'B', text: 'Có, sao vậy?', emotion: 'curious', delay: 1200 },
            { sender: 'A', text: 'Mình muốn nói với bạn một điều... 🙈', emotion: 'nervous', delay: 2000 }
        ];

        this.updateMessagesList();
        this.updateTimeline();
        this.updatePreview();
    }

    // Chat theme application
    applyChatTheme() {
        applyTheme(this.currentTheme);
    }

    // Phone frame format
    updatePhoneFrame() {
        const phoneFrame = document.getElementById('phone-frame');
        if (this.currentFormat === '9:16') {
            phoneFrame.classList.add('tiktok-format');
        } else {
            phoneFrame.classList.remove('tiktok-format');
        }
    }

    // Add message manually
    addMessage() {
        const input = document.getElementById('new-message-input');
        const text = input.value.trim();

        if (!text) return;

        const message = {
            id: `msg_${Date.now()}`,
            sender: this.currentSender,
            text: text,
            emotion: 'neutral',
            delay: 1000 + text.length * 30
        };

        this.messages.push(message);
        input.value = '';

        // Play sound
        if (this.soundEffects.send) {
            window.audioManager.playSound('messenger-send');
        }

        this.updateMessagesList();
        this.updateTimeline();
        this.updatePreview();
    }

    // Update messages list UI
    updateMessagesList() {
        const container = document.getElementById('messages-list');
        container.innerHTML = '';

        this.messages.forEach((msg, index) => {
            const item = document.createElement('div');
            item.className = 'message-item';
            item.draggable = true;
            item.dataset.index = index;

            item.innerHTML = `
                <div class="message-sender ${msg.sender === 'B' ? 'sender-b' : ''}">${msg.sender}</div>
                <div class="message-content">${msg.text}</div>
                <div class="message-actions">
                    <button class="message-action-btn edit-btn" data-index="${index}">✏️</button>
                    <button class="message-action-btn delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;

            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', () => {
                this.messages.splice(index, 1);
                this.updateMessagesList();
                this.updateTimeline();
                this.updatePreview();
            });

            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', () => {
                const promptText = window.i18n?.t('editMessage') || 'Chỉnh sửa tin nhắn:';
                const newText = prompt(promptText, msg.text);
                if (newText !== null) {
                    this.messages[index].text = newText;
                    this.messages[index].delay = 1000 + newText.length * 30;
                    this.updateMessagesList();
                    this.updateTimeline();
                    this.updatePreview();
                }
            });

            // Drag and drop
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;

                if (fromIndex !== toIndex) {
                    const [moved] = this.messages.splice(fromIndex, 1);
                    this.messages.splice(toIndex, 0, moved);
                    this.updateMessagesList();
                    this.updateTimeline();
                    this.updatePreview();
                }
            });

            container.appendChild(item);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Update timeline
    updateTimeline() {
        this.timeline.setMessages(this.messages);
    }

    // Update preview
    updatePreview() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';

        this.messages.forEach(msg => {
            const isSent = msg.sender === 'A';

            if (isSent) {
                const bubble = document.createElement('div');
                bubble.className = 'chat-bubble sent';
                bubble.textContent = msg.text;
                chatMessages.appendChild(bubble);
            } else {
                const wrapper = document.createElement('div');
                wrapper.className = 'bubble-with-avatar';

                wrapper.innerHTML = `
                    <div class="bubble-avatar">
                        <img src="${this.avatars.B || DEFAULT_AVATARS.B}" alt="B">
                    </div>
                    <div class="chat-bubble received">${msg.text}</div>
                `;

                chatMessages.appendChild(wrapper);
            }
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Update renderer
        this.renderer.setMessages(this.messages);
        this.renderer.setTheme(this.currentTheme);
        this.renderer.setNames(this.names.A, this.names.B);
    }

    // Avatar upload handler
    handleAvatarUpload(event, person) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.avatars[person] = img;

                // Update UI
                document.getElementById(`avatar-${person.toLowerCase()}-img`).src = e.target.result;

                if (person === 'B') {
                    document.getElementById('receiver-avatar-display').src = e.target.result;
                    document.getElementById('typing-avatar-img').src = e.target.result;
                }

                this.renderer.setAvatars(this.avatars.A, this.avatars.B);
                this.updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Audio waveform update
    updateAudioWaveform() {
        if (this.musicType && this.musicType !== 'custom') {
            const buffer = window.audioManager.generateBackgroundMusic(this.musicType, 30);
            this.audioWaveform.visualize(buffer);
        } else if (this.customMusic) {
            this.audioWaveform.visualize(this.customMusic);
        } else {
            this.audioWaveform.clear();
        }
    }

    // Messages reorder callback
    onMessagesReorder(messages) {
        this.messages = messages;
        this.updateMessagesList();
        this.updatePreview();
    }

    // Timeline seek callback
    onTimelineSeek(time) {
        this.renderer.seek(time);
    }

    // Preview controls
    togglePreviewPlay() {
        const btn = document.getElementById('preview-play-btn');
        const icon = document.getElementById('play-icon');

        if (this.renderer.isPlaying) {
            this.renderer.pause();
            icon.textContent = '▶️';
        } else {
            this.playAnimatedPreview();
            icon.textContent = '⏸️';
        }
    }

    playAnimatedPreview() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';

        let delay = 0;

        this.messages.forEach((msg, index) => {
            delay += 500; // Typing indicator delay

            // Show typing indicator
            setTimeout(() => {
                if (msg.sender === 'B') {
                    document.getElementById('typing-indicator').classList.remove('hidden');
                    if (this.soundEffects.typing) {
                        window.audioManager.playSound('messenger-typing');
                    }
                }
            }, delay);

            delay += msg.delay || 1500;

            // Show message
            setTimeout(() => {
                document.getElementById('typing-indicator').classList.add('hidden');

                const isSent = msg.sender === 'A';

                if (isSent) {
                    const bubble = document.createElement('div');
                    bubble.className = 'chat-bubble sent';
                    bubble.textContent = msg.text;
                    chatMessages.appendChild(bubble);

                    if (this.soundEffects.send) {
                        window.audioManager.playSound('messenger-send');
                    }
                } else {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'bubble-with-avatar';
                    wrapper.innerHTML = `
                        <div class="bubble-avatar">
                            <img src="${this.avatars.B || DEFAULT_AVATARS.B}" alt="B">
                        </div>
                        <div class="chat-bubble received">${msg.text}</div>
                    `;
                    chatMessages.appendChild(wrapper);

                    if (this.soundEffects.receive) {
                        window.audioManager.playSound('messenger-receive');
                    }
                }

                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, delay);
        });

        // Reset play button after completion
        setTimeout(() => {
            document.getElementById('play-icon').textContent = '▶️';
        }, delay + 1000);
    }

    resetPreview() {
        this.renderer.reset();
        this.timeline.reset();
        document.getElementById('play-icon').textContent = '▶️';
        this.updatePreview();
    }

    playFullPreview() {
        // Start background music
        if (this.musicType) {
            let buffer;
            if (this.musicType === 'custom' && this.customMusic) {
                buffer = this.customMusic;
            } else {
                buffer = window.audioManager.generateBackgroundMusic(this.musicType, 120);
            }
            window.audioManager.playBackgroundMusic(buffer, this.fadeMusic);
        }

        // Play animated preview
        this.playAnimatedPreview();

        // Update timeline during playback
        const startTime = Date.now();
        const updateInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            this.timeline.setCurrentTime(elapsed);

            if (elapsed >= this.renderer.getTotalDuration()) {
                clearInterval(updateInterval);
                window.audioManager.stopBackgroundMusic(this.fadeMusic);
            }
        }, 100);
    }

    // AI Script generation
    async generateAIScript() {
        const prompt = document.getElementById('ai-prompt').value;
        const emotionLevel = document.getElementById('emotion-level').value;

        // Show loading state for BOTH buttons
        const mainBtn = document.getElementById('generate-ai-btn');
        const regenBtn = document.getElementById('regenerate-script-btn');

        if (mainBtn) {
            mainBtn.disabled = true;
            mainBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> ...';
        }

        if (regenBtn) {
            regenBtn.disabled = true;
            regenBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> ...';
        }

        try {
            const result = await generateAIScript(this.currentGenre, prompt, emotionLevel);
            this.showAIScriptModal(result);
        } catch (error) {
            console.error('AI generation error:', error);
            alert('Có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại!');
        } finally {
            // Reset buttons
            if (mainBtn) {
                mainBtn.disabled = false;
                mainBtn.innerHTML = `<span>✨</span> <span data-i18n="generateAI">${window.i18n?.t('generateAI') || 'Tạo Kịch Bản AI'}</span>`;
            }
            if (regenBtn) {
                regenBtn.disabled = false;
                regenBtn.innerHTML = `<span>🔄</span> <span data-i18n="regenerate">${window.i18n?.t('regenerate') || 'Tạo lại'}</span>`;
            }
        }
    }

    showAIScriptModal(result) {
        this.generatedScript = result;

        const preview = document.getElementById('ai-script-preview');
        preview.innerHTML = '';

        result.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `ai-script-message ${msg.sender === 'A' ? 'sent' : ''}`;
            div.innerHTML = `
                <span class="ai-script-sender">${msg.sender === 'A' ? this.names.A : this.names.B}</span>
                <span class="ai-script-text">${msg.text}</span>
            `;
            preview.appendChild(div);
        });

        document.getElementById('ai-script-modal').classList.remove('hidden');
    }

    hideAIModal() {
        document.getElementById('ai-script-modal').classList.add('hidden');
    }

    acceptAIScript() {
        if (this.generatedScript) {
            this.messages = this.generatedScript.messages.map((msg, i) => ({
                ...msg,
                id: `msg_${Date.now()}_${i}`
            }));

            // Set suggested music
            if (this.generatedScript.suggestedMusic) {
                this.musicType = this.generatedScript.suggestedMusic;
                document.getElementById('music-select').value = this.musicType;
                this.updateAudioWaveform();
            }

            this.updateMessagesList();
            this.updateTimeline();
            this.updatePreview();
            this.hideAIModal();
        }
    }

    // Video export using MediaRecorder API (works without server!)
    async exportVideo() {
        const modal = document.getElementById('export-modal');
        const progressBar = document.getElementById('export-progress-bar');
        const statusText = document.getElementById('export-status');
        const percentText = document.getElementById('export-percent');

        // Validate messages
        if (this.messages.length === 0) {
            alert(window.i18n?.t('noMessages') || 'Vui lòng thêm tin nhắn trước khi xuất video!');
            return;
        }

        modal.classList.remove('hidden');

        try {
            statusText.textContent = window.i18n?.t('preparing') || 'Đang chuẩn bị...';
            percentText.textContent = '0%';
            progressBar.style.width = '0%';

            // Setup canvas for recording
            const canvas = document.getElementById('render-canvas');
            const dims = this.renderer.dimensions[this.currentFormat];
            canvas.width = dims.width;
            canvas.height = dims.height;

            // Important: Set format and messages BEFORE getting duration
            this.renderer.setFormat(this.currentFormat);
            this.renderer.setMessages(this.messages);
            this.renderer.setTheme(this.currentTheme);
            this.renderer.setNames(this.names.A, this.names.B);

            // Calculate total duration (minimum 2 seconds)
            const totalDuration = Math.max(2000, this.renderer.getTotalDuration());
            console.log('Export: Total duration =', totalDuration, 'ms');

            // Create video stream from canvas
            const stream = canvas.captureStream(30);

            // Setup MediaRecorder
            let mimeType = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                mimeType = 'video/webm;codecs=vp8';
            }

            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                statusText.textContent = window.i18n?.t('exportComplete') || 'Hoàn tất!';
                progressBar.style.width = '100%';
                percentText.textContent = '100%';

                // Create and download video
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-video-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(url);

                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 1500);
            };

            this.mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                throw new Error('Recording failed');
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms

            statusText.textContent = window.i18n?.t('creatingVideo') || 'Đang tạo video...';

            // Render frames using requestAnimationFrame for better performance
            const fps = 30;
            const frameInterval = 1000 / fps;
            let currentTime = 0;
            let lastRenderTime = performance.now();

            const renderFrame = () => {
                const now = performance.now();
                const delta = now - lastRenderTime;

                // Draw current frame
                this.renderer.drawFrame(currentTime);

                // Update progress
                const progress = Math.min(100, Math.round((currentTime / totalDuration) * 100));
                progressBar.style.width = `${progress}%`;
                percentText.textContent = `${progress}%`;

                currentTime += frameInterval;

                if (currentTime >= totalDuration) {
                    // Stop recording after a small delay to ensure last frame is captured
                    setTimeout(() => {
                        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                            this.mediaRecorder.stop();
                        }
                    }, 100);
                    return;
                }

                // Schedule next frame
                requestAnimationFrame(renderFrame);
                lastRenderTime = now;
            };

            // Start rendering
            requestAnimationFrame(renderFrame);

        } catch (error) {
            console.error('Export error:', error);
            statusText.textContent = (window.i18n?.t('exportError') || 'Lỗi') + ': ' + error.message;
            percentText.textContent = '❌';

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 3000);
        }
    }


    // Template management
    saveTemplate() {
        const promptText = window.i18n?.t('templateName') || 'Tên template:';
        const name = prompt(promptText);
        if (!name) return;

        const template = {
            id: Date.now(),
            name: name,
            messages: this.messages,
            theme: this.currentTheme,
            format: this.currentFormat,
            musicType: this.musicType,
            names: { ...this.names },
            createdAt: new Date().toISOString()
        };

        this.templates.push(template);
        this.saveTemplatesToStorage();

        const savedText = window.i18n?.t('templateSaved') || 'Đã lưu template:';
        alert(savedText + ' ' + name);
    }

    saveTemplatesToStorage() {
        localStorage.setItem('msgVideoTemplates', JSON.stringify(this.templates));
    }

    loadTemplates() {
        const saved = localStorage.getItem('msgVideoTemplates');
        if (saved) {
            this.templates = JSON.parse(saved);
        }
    }

    showTemplatesModal() {
        const list = document.getElementById('templates-list');
        list.innerHTML = '';

        if (this.templates.length === 0) {
            const noTemplatesText = window.i18n?.t('noTemplates') || 'Chưa có template nào được lưu';
            list.innerHTML = `<p class="text-muted text-center">${noTemplatesText}</p>`;
        } else {
            this.templates.forEach((template, index) => {
                const item = document.createElement('div');
                item.className = 'template-item';
                item.innerHTML = `
                    <div class="template-info">
                        <h4>${template.name}</h4>
                        <p>${template.messages.length} messages • ${new Date(template.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-primary load-template-btn" data-index="${index}">✓</button>
                        <button class="btn btn-sm btn-ghost delete-template-btn" data-index="${index}">🗑️</button>
                    </div>
                `;

                item.querySelector('.load-template-btn').addEventListener('click', () => {
                    this.loadTemplate(template);
                    this.hideTemplatesModal();
                });

                item.querySelector('.delete-template-btn').addEventListener('click', () => {
                    const confirmText = window.i18n?.t('deleteConfirm') || 'Xóa template này?';
                    if (confirm(confirmText)) {
                        this.templates.splice(index, 1);
                        this.saveTemplatesToStorage();
                        this.showTemplatesModal();
                    }
                });

                list.appendChild(item);
            });
        }

        document.getElementById('templates-modal').classList.remove('hidden');
    }

    hideTemplatesModal() {
        document.getElementById('templates-modal').classList.add('hidden');
    }

    loadTemplate(template) {
        this.messages = template.messages;
        this.currentTheme = template.theme;
        this.currentFormat = template.format;
        this.musicType = template.musicType || '';
        this.names = template.names || { A: 'Người A', B: 'Người B' };

        // Update UI
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === this.currentFormat);
        });
        document.getElementById('music-select').value = this.musicType;
        document.getElementById('name-a-input').value = this.names.A;
        document.getElementById('name-b-input').value = this.names.B;
        document.getElementById('receiver-name-display').textContent = this.names.B;

        this.applyChatTheme();
        this.updatePhoneFrame();
        this.updateMessagesList();
        this.updateTimeline();
        this.updatePreview();
        this.updateAudioWaveform();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
