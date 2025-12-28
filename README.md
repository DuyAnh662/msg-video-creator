# 🎬 MSG Video Creator - AI Message Video Generator

**MSG Video Creator** là công cụ giúp bạn tạo video tin nhắn giả lập (fake message) cực nhanh với sự hỗ trợ của AI. Hỗ trợ nhiều giao diện (Messenger, ChatGPT, Gemini) và xuất video chất lượng cao ngay trên trình duyệt.

![Demo](https://via.placeholder.com/800x400?text=MSG+Video+Creator+Demo)
*(Bạn có thể thay ảnh này bằng ảnh chụp màn hình thực tế của dự án)*

## ✨ Tính năng nổi bật

-   **🤖 AI Writer Tốc độ cao**:
    -   Tích hợp **Groq API** (Llama 3.1 8B) cho tốc độ tạo kịch bản siêu nhanh (< 2s) và miễn phí.
    -   Hỗ trợ fallback sang **ChatGPT** hoặc **Gemini** nếu có key.
    -   Tự động tạo hội thoại theo cảm xúc (Hài hước, Drama, Tỏ tình, Chia tay...).
-   **🎨 Đa dạng Giao diện**:
    -   **Messenger**: Giao diện tin nhắn Facebook quen thuộc.
    -   **ChatGPT**: Giao diện AI chatbot hiện đại.
    -   **Gemini**: Phong cách Google Gemini tinh tế.
-   **📱 Tùy biến linh hoạt**:
    -   Chế độ **Light/Dark Mode** tự động theo theme.
    -   Hỗ trợ tỉ lệ **16:9** (PC/YouTube) và **9:16** (TikTok/Shorts).
    -   Tùy chỉnh Avatar, Tên, và nội dung tin nhắn kéo thả dễ dàng.
-   **🔒 Bảo mật & Riêng tư**:
    -   API Key được lưu trực tiếp trên trình duyệt của bạn (`localStorage`).
    -   **Không** gửi dữ liệu về server trung gian.
    -   Source code sạch, an toàn để chia sẻ.
-   **🎥 Xuất Video Nhanh**:
    -   Quay màn hình và xuất file `.webm` hoặc `.mp4` trực tiếp.
    -   Không cần cài đặt FFmpeg hay phần mềm hỗ trợ nào khác.

## 🚀 Hướng dẫn cài đặt

Dự án này chạy thuần **HTML/CSS/JS**, không cần cài đặt môi trường phức tạp (Node.js/Python).

1.  Tải source code về máy.
2.  Mở file `index.html` bằng trình duyệt (Chrome/Edge/Safari).
    -   *Khuyên dùng*: Cài extension **Live Server** trên VS Code để chạy mượt mà nhất (tránh lỗi CORS khi load module).

## 📖 Cách sử dụng

1.  **Cài đặt API** (Khuyên dùng):
    -   Bấm nút **Cài đặt (⚙️)** trên góc phải.
    -   Nhập **Groq API Key** (Lấy miễn phí tại [console.groq.com](https://console.groq.com)).
    -   Bấm **Lưu**.
2.  **Tạo kịch bản**:
    -   Chọn thể loại (Drama, Hài hước...) ở cột trái.
    -   Bấm **"✨ Tạo Kịch Bản AI"**.
    -   Chỉnh sửa lại nội dung nếu cần.
3.  **Tùy chỉnh giao diện**:
    -   Chọn theme (Messenger/ChatGPT...).
    -   Upload Avatar cho Người A và Người B.
4.  **Xuất Video**:
    -   Bấm nút **"Quay & Xuất Video"** để tải thành phẩm về.

## 🛠️ Công nghệ sử dụng

-   **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), Vanilla JavaScript (ES6+).
-   **AI Integration**: Fetch API (Restbox) tới Groq, OpenAI, Google Gemini.
-   **Storage**: LocalStorage (Lưu cài đặt & API Key).

## 📄 License

Dự án này là mã nguồn mở. Bạn có thể thoải mái sử dụng và tùy biến.
