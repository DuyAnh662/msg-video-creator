/**
 * Theme Configurations
 * Định nghĩa styles cho Messenger, ChatGPT, Gemini
 */

const THEMES = {
    messenger: {
        name: 'Messenger',
        styles: {
            background: '#ffffff',
            headerBg: 'rgba(255, 255, 255, 0.95)',
            senderBubble: 'linear-gradient(180deg, #0084ff 0%, #00c6ff 100%)',
            senderBubbleColor: '#ffffff',
            receiverBubble: '#f0f2f5',
            receiverBubbleColor: '#050505',
            textColor: '#050505',
            typingBubble: '#f0f2f5',
            typingDots: '#65676b',
            statusColor: '#31a24c',
            font: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            bubbleRadius: 18,
            avatarSize: 32,
            avatarShape: 'circle'
        },
        sounds: {
            send: 'messenger-send',
            receive: 'messenger-receive',
            typing: 'messenger-typing'
        }
    },

    chatgpt: {
        name: 'ChatGPT',
        hideStatus: true,
        styles: {
            background: '#ffffffff',
            headerBg: 'rgba(255, 255, 255, 0.9)',
            senderBubble: '#343541',
            senderBubbleColor: '#ececf1',
            senderBubbleBorder: '1px solid rgba(255,255,255,0.1)',
            receiverBubble: '#444654',
            receiverBubbleColor: '#ececf1',
            textColor: '#ececf1',
            typingBubble: '#444654',
            typingDots: '#ececf1',
            statusColor: '#10a37f',
            font: "'Söhne', 'ui-sans-serif', system-ui, sans-serif",
            bubbleRadius: 8,
            avatarSize: 30,
            avatarShape: 'square',
            senderIcon: '👤',
            receiverIcon: '🤖'
        },
        sounds: {
            send: 'soft-click',
            receive: 'soft-pop',
            typing: 'keyboard-soft'
        }
    },

    gemini: {
        name: 'Gemini',
        hideStatus: true,
        styles: {
            background: '#ffffffff',
            headerBg: 'rgba(255, 255, 255, 0.9)',
            senderBubble: 'transparent',
            senderBubbleColor: '#e3e3e3',
            senderBubbleBorder: '1px solid #8ab4f8',
            receiverBubble: 'rgba(138, 180, 248, 0.1)',
            receiverBubbleColor: '#e3e3e3',
            receiverBubbleBorder: '1px solid rgba(138, 180, 248, 0.2)',
            textColor: '#e3e3e3',
            typingBubble: 'rgba(138, 180, 248, 0.1)',
            typingDots: '#8ab4f8',
            statusColor: '#8ab4f8',
            accentGradient: 'linear-gradient(135deg, #8ab4f8, #c58af9)',
            font: "'Google Sans', 'Roboto', sans-serif",
            bubbleRadius: 20,
            avatarSize: 32,
            avatarShape: 'circle',
            receiverIcon: '✨'
        },
        sounds: {
            send: 'gemini-send',
            receive: 'gemini-receive',
            typing: 'gemini-thinking'
        }
    }
};

// Default avatars
const DEFAULT_AVATARS = {
    A: 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366f1"/>
                    <stop offset="100%" style="stop-color:#a855f7"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#grad1)"/>
            <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial" font-weight="bold">A</text>
        </svg>
    `),
    B: 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ec4899"/>
                    <stop offset="50%" style="stop-color:#f43f5e"/>
                    <stop offset="100%" style="stop-color:#f97316"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#grad2)"/>
            <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial" font-weight="bold">B</text>
        </svg>
    `)
};

// Apply theme to phone screen
function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    const phoneScreen = document.querySelector('.phone-screen');
    const chatHeader = document.querySelector('.chat-header');
    const chatStatus = document.querySelector('.chat-status');

    // Remove old theme classes
    phoneScreen.classList.remove('theme-messenger', 'theme-chatgpt', 'theme-gemini');
    phoneScreen.classList.add(`theme-${themeName}`);

    // Apply inline styles
    phoneScreen.style.background = theme.styles.background;
    phoneScreen.style.fontFamily = theme.styles.font;
    chatHeader.style.background = theme.styles.headerBg;
    chatStatus.style.color = theme.styles.statusColor;

    // Toggle status visibility
    if (theme.hideStatus) {
        chatStatus.style.display = 'none';
    } else {
        chatStatus.style.display = 'block';
    }

    // Update typing indicator
    const typingBubble = document.querySelector('.typing-bubble');
    const typingDots = document.querySelectorAll('.typing-dot');

    if (typingBubble) {
        typingBubble.style.background = theme.styles.typingBubble;
    }

    typingDots.forEach(dot => {
        dot.style.background = theme.styles.typingDots;
    });

    return theme;
}

// Get bubble styles for a theme
function getBubbleStyles(themeName, isSent) {
    const theme = THEMES[themeName];
    if (!theme) return {};

    const styles = theme.styles;

    if (isSent) {
        return {
            background: styles.senderBubble,
            color: styles.senderBubbleColor,
            border: styles.senderBubbleBorder || 'none',
            borderRadius: styles.bubbleRadius + 'px',
            borderBottomRightRadius: '4px'
        };
    } else {
        return {
            background: styles.receiverBubble,
            color: styles.receiverBubbleColor,
            border: styles.receiverBubbleBorder || 'none',
            borderRadius: styles.bubbleRadius + 'px',
            borderBottomLeftRadius: '4px'
        };
    }
}

// Export for use in other modules
window.THEMES = THEMES;
window.DEFAULT_AVATARS = DEFAULT_AVATARS;
window.applyTheme = applyTheme;
window.getBubbleStyles = getBubbleStyles;
