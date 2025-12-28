/**
 * AI Script Generator
 * Tạo kịch bản hội thoại tự động với Groq, ChatGPT hoặc Gemini API
 * Có fallback phong phú nếu API lỗi
 */

// ============================================
// CẤU HÌNH API
// ============================================
// Helper để lấy key từ localStorage
const getGroqKey = () => localStorage.getItem('groq_key');
const getOpenAIKey = () => localStorage.getItem('openai_key');
const getGeminiKey = () => localStorage.getItem('gemini_key');

// ============================================
// GENRE PROMPTS
// ============================================
const GENRE_PROMPTS = {
    drama: {
        name: 'Drama',
        emoji: '🎭',
        description: 'Kịch tính, plot twist, cảm xúc mạnh',
        systemPrompt: `Tạo đoạn hội thoại tin nhắn giữa 2 người (A và B) với tình huống kịch tính, bất ngờ và plot twist mạnh. Tiếng Việt tự nhiên. Trả về đúng JSON array, không có text dư thừa.`
    },
    romance: {
        name: 'Tỏ tình',
        emoji: '💕',
        description: 'Lãng mạn, ngọt ngào, đáng yêu',
        systemPrompt: `Tạo đoạn hội thoại tỏ tình ngọt ngào giữa 2 người (A và B). Cảm xúc chân thành, bẽn lẽn. Tiếng Việt tự nhiên. Trả về đúng JSON array.`
    },
    breakup: {
        name: 'Chia tay',
        emoji: '💔',
        description: 'Buồn nhưng văn minh, cảm động',
        systemPrompt: `Tạo đoạn hội thoại chia tay văn minh, buồn man mác giữa 2 người (A và B). Tiếng Việt tự nhiên. Trả về đúng JSON array.`
    },
    comedy: {
        name: 'Hài hước',
        emoji: '😂',
        description: 'Cợt nhả, trào phúng, gây cười',
        systemPrompt: `Tạo đoạn chat HÀI HƯỚC, troll, có twist cuối cực nhây giữa 2 người (A và B). Tiếng Việt tự nhiên. Trả về đúng JSON array.`
    }
};

// Emotion mappings
const EMOTIONS = {
    neutral: { emoji: '😐', color: '#a1a1aa' },
    happy: { emoji: '😊', color: '#22c55e' },
    sad: { emoji: '😢', color: '#3b82f6' },
    angry: { emoji: '😠', color: '#ef4444' },
    surprised: { emoji: '😲', color: '#f59e0b' },
    romantic: { emoji: '😍', color: '#ec4899' },
    shy: { emoji: '🙈', color: '#f472b6' },
    worried: { emoji: '😰', color: '#6366f1' },
    crying: { emoji: '😭', color: '#60a5fa' },
    nervous: { emoji: '😬', color: '#a855f7' },
    shocked: { emoji: '😱', color: '#f97316' },
    blushing: { emoji: '☺️', color: '#fb7185' },
    thoughtful: { emoji: '🤔', color: '#8b5cf6' },
    grateful: { emoji: '🙏', color: '#10b981' },
    trollface: { emoji: '😏', color: '#22d3ee' },
    deadpan: { emoji: '😑', color: '#94a3b8' },
    facepalm: { emoji: '🤦', color: '#fb923c' }
};

// ============================================
// FALLBACK TEMPLATES
// ============================================
const FALLBACK_TEMPLATES = {
    comedy: [
        [{ sender: 'A', text: 'Bro ơi cho vay 500k được không?', emotion: 'hopeful' }, { sender: 'B', text: 'Được, nhưng mà...', emotion: 'thoughtful' }, { sender: 'A', text: 'Nhưng sao?', emotion: 'worried' }, { sender: 'B', text: 'Tao cũng đang định hỏi mượn mày 500k 💀', emotion: 'deadpan' }]
    ],
    drama: [
        [{ sender: 'A', text: 'Em cần nói với anh một chuyện...', emotion: 'nervous' }, { sender: 'B', text: 'Sao? Có chuyện gì vậy?', emotion: 'worried' }, { sender: 'A', text: 'Người đó... người mà anh gặp hôm qua... Là chồng cũ của em', emotion: 'sad' }, { sender: 'B', text: '...', emotion: 'shocked' }]
    ],
    romance: [
        [{ sender: 'A', text: 'Này... em có thể hỏi một câu được không?', emotion: 'shy' }, { sender: 'B', text: 'Ừ, anh cứ hỏi đi', emotion: 'neutral' }, { sender: 'A', text: 'Theo em... người ta yêu ai đó thì như thế nào?', emotion: 'blushing' }, { sender: 'B', text: 'Vậy chắc em yêu anh rồi 🙈', emotion: 'shy' }, { sender: 'B', text: 'Anh cũng yêu em ❤️', emotion: 'romantic' }]
    ],
    breakup: [
        [{ sender: 'A', text: 'Có lẽ... chúng ta nên dừng lại ở đây', emotion: 'sad' }, { sender: 'B', text: 'Anh biết... anh cũng cảm nhận được', emotion: 'sad' }, { sender: 'A', text: 'Em không hối hận về khoảng thời gian bên anh', emotion: 'grateful' }, { sender: 'B', text: 'Chúc em hạnh phúc...', emotion: 'sad' }]
    ]
};

// ============================================
// GROQ API (Siêu tốc)
// ============================================
async function generateWithGroq(genre, customPrompt = '', emotionLevel = 50) {
    const apiKey = getGroqKey();
    if (!apiKey) return null;

    const genreData = GENRE_PROMPTS[genre] || GENRE_PROMPTS.comedy;
    const systemMessage = `Bạn là AI viết kịch bản hội thoại. Yêu cầu:
- Trả về JSON array: [{"sender": "A", "text": "...", "emotion": "neutral"}]
- Tối thiểu 6 tin nhắn
- Nội dung tiếng Việt tự nhiên, phù hợp thể loại ${genreData.name}
- Chỉ trả về JSON, không có text khác.`;

    try {
        console.log('🚀 Đang gọi Groq API (Siêu tốc)...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: customPrompt || `Tạo kịch bản cho thể loại: ${genreData.name}` }
                ],
                temperature: 0.7
            })
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content;
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const messages = JSON.parse(jsonMatch[0]);
                console.log('✅ Groq thành công!');
                return {
                    messages: messages.map((msg, i) => ({ ...msg, id: `msg_groq_${Date.now()}_${i}` })),
                    provider: 'groq'
                };
            }
        } else {
            const errText = await response.text();
            console.warn('⚠️ Groq API Error:', response.status, errText);
        }
    } catch (e) { console.warn('❌ Groq API Fail:', e); }
    return null;
}

// ============================================
// CHATGPT API
// ============================================
async function generateWithChatGPT(genre, customPrompt = '', emotionLevel = 50) {
    const apiKey = getOpenAIKey();
    if (!apiKey) return null;

    const genreData = GENRE_PROMPTS[genre];
    try {
        console.log('🤖 Đang gọi ChatGPT API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `${genreData.systemPrompt} ${customPrompt}. Trả về JSON array.` }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const jsonMatch = data.choices[0].message.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                console.log('✅ ChatGPT thành công!');
                return {
                    messages: JSON.parse(jsonMatch[0]).map((msg, i) => ({ ...msg, id: `msg_gpt_${Date.now()}_${i}` })),
                    provider: 'chatgpt'
                };
            }
        }
    } catch (e) { console.log('⚠️ ChatGPT failed'); }
    return null;
}

// ============================================
// GEMINI API
// ============================================
async function generateWithGemini(genre, customPrompt = '', emotionLevel = 50) {
    const apiKey = getGeminiKey();
    if (!apiKey) return null;

    const genreData = GENRE_PROMPTS[genre];
    const prompt = `${genreData.systemPrompt} ${customPrompt}. Trả về JSON array.`;
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const model of models) {
        try {
            console.log(`🤖 Đang thử Gemini model: ${model}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.candidates[0].content.parts[0].text;
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    console.log('✅ Gemini thành công!');
                    return {
                        messages: JSON.parse(jsonMatch[0]).map((msg, i) => ({ ...msg, id: `msg_gemini_${Date.now()}_${i}` })),
                        provider: 'gemini'
                    };
                }
            }
        } catch (e) { console.log(`⚠️ Gemini ${model} failed`); }
    }
    return null;
}

// ============================================
// FALLBACK
// ============================================
function generateFallback(genre) {
    console.log('📦 Đang dùng fallback template...');
    const list = FALLBACK_TEMPLATES[genre] || FALLBACK_TEMPLATES.comedy;
    const template = list[Math.floor(Math.random() * list.length)];
    return {
        messages: template.map((msg, i) => ({ ...msg, id: `msg_fb_${Date.now()}_${i}` })),
        provider: 'fallback'
    };
}

// ============================================
// MAIN FUNCTION
// ============================================
async function generateAIScript(genre, customPrompt = '', emotionLevel = 50) {
    const hasKey = getGroqKey() || getOpenAIKey() || getGeminiKey();
    console.log(`🚀 Bắt đầu tạo kịch bản: ${genre} (Has Key: ${!!hasKey})`);

    let result = null;

    // Ưu tiên Groq -> OpenAI -> Gemini
    if (getGroqKey()) result = await generateWithGroq(genre, customPrompt, emotionLevel);
    if (!result && getOpenAIKey()) result = await generateWithChatGPT(genre, customPrompt, emotionLevel);
    if (!result && getGeminiKey()) result = await generateWithGemini(genre, customPrompt, emotionLevel);

    return result || generateFallback(genre);
}

window.generateAIScript = generateAIScript;
window.GENRE_PROMPTS = GENRE_PROMPTS;
window.EMOTIONS = EMOTIONS;
console.log('🤖 AI Generator V3 ready (Secure Keys)');