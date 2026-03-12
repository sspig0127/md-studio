# Hướng Dẫn Cú Pháp Markdown + Mermaid

> Chào mừng đến với Trình soạn thảo Markdown! Hướng dẫn này bao gồm các cú pháp thường dùng — hãy chỉnh sửa nội dung ở bên trái và xem kết quả hiển thị ngay bên phải.

---

## 1. Tiêu đề

Dùng ký tự `#` để xác định cấp độ tiêu đề (H1–H6):

```
# Tiêu đề cấp 1
## Tiêu đề cấp 2
### Tiêu đề cấp 3
```

---

## 2. Định dạng văn bản

**In đậm** — bao quanh bằng hai dấu sao: `**In đậm**`

*In nghiêng* — bao quanh bằng một dấu sao: `*In nghiêng*`

~~Gạch ngang~~ — bao quanh bằng hai dấu ngã: `~~Gạch ngang~~`

`Code nội dòng` — bao quanh bằng dấu backtick

---

## 3. Danh sách

Danh sách không có thứ tự (bắt đầu bằng `-`):

- Táo
- Chuối
  - Chuối tiêu (thụt vào hai dấu cách để tạo mục con)
- Cam

Danh sách có thứ tự (số + dấu chấm):

1. Bước 1: Cài đặt công cụ
2. Bước 2: Soạn thảo nội dung
3. Bước 3: Xuất tài liệu

---

## 4. Trích dẫn

> Dùng `>` ở đầu dòng để tạo khối trích dẫn.
> Có thể trải dài nhiều dòng và lồng nhau:
>
> > Đây là trích dẫn lồng nhau.

---

## 5. Liên kết & Hình ảnh

[Văn bản liên kết](https://github.com/sspig0127/md-studio)

![Văn bản thay thế](https://placehold.co/300x80/7c6af7/ffffff?text=Markdown+Editor)

---

## 6. Khối code

Code nội dòng: `console.log('Hello')`

Khối code (ba dấu backtick + tên ngôn ngữ):

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(greet('World'));
```

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```

---

## 7. Bảng

| Cú pháp        | Kết quả       | Ghi chú             |
| -------------- | ------------- | ------------------- |
| `**văn bản**`  | **In đậm**    | Hai dấu sao         |
| `*văn bản*`    | *In nghiêng*  | Một dấu sao         |
| `~~văn bản~~`  | ~~Gạch ngang~~| Hai dấu ngã         |
| `# Tiêu đề`    | Tiêu đề       | 1–6 ký tự `#`      |

---

## 8. Mermaid — Sơ đồ luồng

```mermaid
graph TD
    A[Bắt đầu] --> B{Đã đăng nhập?}
    B -->|Có| C[Vào trang chủ]
    B -->|Không| D[Đến trang đăng nhập]
    D --> E[Nhập thông tin đăng nhập]
    E --> F{Xác thực thành công?}
    F -->|Có| C
    F -->|Không| G[Hiển thị lỗi]
    G --> D
    C --> H[Kết thúc]
```

---

## 9. Mermaid — Sơ đồ tuần tự

```mermaid
sequenceDiagram
    participant Người dùng
    participant Frontend
    participant Backend
    participant Cơ sở dữ liệu

    Người dùng->>Frontend: Nhấn Đăng nhập
    Frontend->>Backend: POST /api/login
    Backend->>Cơ sở dữ liệu: Truy vấn tài khoản
    Cơ sở dữ liệu-->>Backend: Trả về dữ liệu
    Backend-->>Frontend: Trả về JWT Token
    Frontend-->>Người dùng: Đăng nhập thành công
```

---

## 10. Mermaid — Biểu đồ tròn

```mermaid
pie title Tỷ lệ sử dụng ngôn ngữ lập trình
    "JavaScript" : 38
    "Python" : 28
    "TypeScript" : 20
    "Go" : 8
    "Khác" : 6
```

---

## 11. Mermaid — Biểu đồ Gantt

```mermaid
gantt
    title Lịch trình phát triển dự án
    dateFormat  YYYY-MM-DD
    section Lập kế hoạch
    Phân tích yêu cầu   :done,    a1, 2025-01-01, 7d
    Thiết kế kiến trúc  :done,    a2, after a1,  5d
    section Phát triển
    Phát triển Frontend :active,  b1, after a2, 14d
    Phát triển Backend  :         b2, after a2, 14d
    section Kiểm thử
    Kiểm thử tích hợp   :         c1, after b1, 7d
    Triển khai          :         c2, after c1, 2d
```

---

*Chúc mừng! Bạn đã xem qua tất cả các ví dụ. Hãy thử chỉnh sửa nội dung bên trái và quan sát bản xem trước thay đổi ngay lập tức!*
