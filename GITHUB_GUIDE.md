# 📤 Hướng dẫn đăng dự án lên GitHub

Dưới đây là các bước chi tiết để bạn đưa source code `MSG Video Creator` lên GitHub để lưu trữ và chia sẻ.

## Bước 1: Chuẩn bị trên GitHub
1.  Đăng nhập vào [GitHub](https://github.com).
2.  Bấm vào dấu **`+`** ở góc trên bên phải -> Chọn **New repository**.
3.  Đặt tên cho repository (ví dụ: `msg-video-creator`).
4.  Chọn **Public** (Công khai) hoặc **Private** (Riêng tư).
5.  **Quan trọng**: Đừng tick vào ô "Add a README file" (vì mình đã tạo file README.md ở máy rồi).
6.  Bấm nút **Create repository**.

## Bước 2: Chuẩn bị trên máy tính (Terminal)
Mở **Terminal** (hoặc CMD/Git Bash) tại thư mục dự án của bạn (`/Users/vuduyanh/Desktop/project auto video`).

Chạy lần lượt các lệnh sau:

### 1. Khởi tạo Git
```bash
git init
```

### 2. Thêm file vào Git
```bash
git add .
```
*(Lệnh này sẽ thêm tất cả các file hiện có vào danh sách chờ).*

### 3. Lưu (Commit) code
```bash
git commit -m "First commit: Hoàn thiện tính năng AI và giao diện"
```

### 4. Đổi tên nhánh chính (nếu cần)
Git mặc định có thể là `master` hoặc `main`. Để chuẩn theo GitHub hiện nay:
```bash
git branch -M main
```

### 5. Kết nối với GitHub
Copy đường link repository bạn vừa tạo ở Bước 1 (dạng `https://github.com/tên-bạn/msg-video-creator.git`). Sau đó chạy lệnh:

```bash
git remote add origin ĐƯỜNG_LINK_CỦA_BẠN
```
*(Ví dụ: `git remote add origin https://github.com/vuduyanh/msg-video-creator.git`)*

### 6. Đẩy code lên (Push)
```bash
git push -u origin main
```

## ✅ Hoàn tất
Sau khi chạy xong lệnh push, bạn quay lại trang GitHub và F5 (tải lại trang). Bạn sẽ thấy toàn bộ code và file `README.md` giới thiệu dự án đã hiện lên đẹp đẽ!

---

## 💡 Lưu ý về bảo mật
-   **API Key**: Bạn yên tâm là code hiện tại **không chứa key cứng** nào cả. Key của bạn chỉ nằm trong trình duyệt (LocalStorage).
-   **File .gitignore**: Nếu sau này bạn có dùng Node.js, nhớ tạo file `.gitignore` để loại bỏ thư mục `node_modules` nhé. Với dự án HTML thuần này thì không cần thiết lắm.
