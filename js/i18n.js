/**
 * Internationalization (i18n) Module
 * Hỗ trợ Tiếng Việt và English
 */

const translations = {
    vi: {
        // Header
        templates: 'Templates',

        // Script Editor
        scriptEditor: 'Trình soạn kịch bản',
        aiGenerator: 'AI Tạo Kịch Bản',
        genre: 'Thể loại',
        romance: 'Tỏ tình',
        breakup: 'Chia tay',
        comedy: 'Hài hước',
        descriptionOptional: 'Mô tả nội dung (tùy chọn)',
        promptPlaceholder: 'VD: Cuộc hội thoại giữa 2 người yêu xa gặp lại sau 3 năm...',
        emotionLevel: 'Cảm xúc chủ đạo',
        generateAI: 'Tạo Kịch Bản AI',
        orManual: 'hoặc nhập thủ công',
        personA: 'Người A',
        personB: 'Người B',
        enterMessage: 'Nhập tin nhắn...',

        // Preview
        videoPreview: 'Xem trước Video',
        online: 'Đang hoạt động',
        chatTheme: 'Kiểu chat:',
        exportFormat: 'Định dạng:',

        // Settings
        customize: 'Tùy chỉnh',
        change: 'Đổi',
        name: 'Tên',
        bgMusic: 'Nhạc nền',
        noMusic: 'Không có nhạc',
        uploadMusic: 'Hoặc upload nhạc',
        volume: 'Âm lượng',
        soundEffects: 'Hiệu ứng âm thanh',
        sendSound: 'Tiếng gửi tin nhắn',
        receiveSound: 'Tiếng nhận tin nhắn',
        typingSound: 'Tiếng typing',

        // Export
        watchPreview: 'Xem Preview',
        exportVideo: 'Xuất Video WebM',
        saveTemplate: 'Lưu Template',

        // Modals
        aiScript: 'Kịch Bản AI',
        regenerate: 'Tạo lại',
        useScript: 'Dùng kịch bản này',
        savedTemplates: 'Templates đã lưu',
        exporting: 'Đang xuất video...',
        preparing: 'Đang chuẩn bị...',
        loading: 'Đang xử lý...',

        // Messages
        noTemplates: 'Chưa có template nào được lưu',
        templateName: 'Tên template:',
        templateSaved: 'Đã lưu template:',
        deleteConfirm: 'Xóa template này?',
        editMessage: 'Chỉnh sửa tin nhắn:',
        exportComplete: 'Hoàn tất!',
        exportError: 'Lỗi xuất video',
        renderingFrames: 'Đang render frames...',
        creatingVideo: 'Đang tạo video...'
    },

    en: {
        // Header
        templates: 'Templates',

        // Script Editor
        scriptEditor: 'Script Editor',
        aiGenerator: 'AI Script Generator',
        genre: 'Genre',
        romance: 'Romance',
        breakup: 'Breakup',
        comedy: 'Comedy',
        descriptionOptional: 'Description (optional)',
        promptPlaceholder: 'E.g.: A conversation between two long-distance lovers reuniting after 3 years...',
        emotionLevel: 'Main emotion',
        generateAI: 'Generate AI Script',
        orManual: 'or enter manually',
        personA: 'Person A',
        personB: 'Person B',
        enterMessage: 'Enter message...',

        // Preview
        videoPreview: 'Video Preview',
        online: 'Active now',
        chatTheme: 'Chat Style:',
        exportFormat: 'Format:',

        // Settings
        customize: 'Customize',
        change: 'Change',
        name: 'Name',
        bgMusic: 'Background Music',
        noMusic: 'No music',
        uploadMusic: 'Or upload music',
        volume: 'Volume',
        soundEffects: 'Sound Effects',
        sendSound: 'Send message sound',
        receiveSound: 'Receive message sound',
        typingSound: 'Typing sound',

        // Export
        watchPreview: 'Watch Preview',
        exportVideo: 'Export WebM Video',
        saveTemplate: 'Save Template',

        // Modals
        aiScript: 'AI Script',
        regenerate: 'Regenerate',
        useScript: 'Use this script',
        savedTemplates: 'Saved Templates',
        exporting: 'Exporting video...',
        preparing: 'Preparing...',
        loading: 'Processing...',

        // Messages
        noTemplates: 'No templates saved yet',
        templateName: 'Template name:',
        templateSaved: 'Template saved:',
        deleteConfirm: 'Delete this template?',
        editMessage: 'Edit message:',
        exportComplete: 'Complete!',
        exportError: 'Export error',
        renderingFrames: 'Rendering frames...',
        creatingVideo: 'Creating video...'
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'vi';
        this.translations = translations;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updateUI();
    }

    t(key) {
        return this.translations[this.currentLang]?.[key] || this.translations['vi']?.[key] || key;
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }

    init() {
        // Set initial language
        this.updateUI();

        // Bind language toggle buttons
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setLanguage(btn.dataset.lang);
            });
        });

        // Set active button based on current language
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('appTheme') || 'light';
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('appTheme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }

    init() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Bind theme toggle buttons
        document.querySelectorAll('[data-app-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-app-theme]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setTheme(btn.dataset.appTheme);
            });
        });

        // Set active button based on current theme
        document.querySelectorAll('[data-app-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.appTheme === this.currentTheme);
        });
    }
}

// Create global instances
window.i18n = new I18n();
window.themeManager = new ThemeManager();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
    window.themeManager.init();
});
