# 🃏 Agile AI Planning Poker

Hệ thống hỗ trợ ước lượng độ phức tạp công việc (**Story Points**) theo phương pháp **Agile/Scrum Planning Poker** thời gian thực, tích hợp trợ lý kỹ sư AI (**Llama-3**) tham gia bỏ phiếu độc lập và tranh luận kỹ thuật cùng nhóm phát triển.

---

## ✨ Tính năng nổi bật

* **Xác thực & Phân quyền chuẩn Scrum (JWT + Spring Security):**
  * Đăng ký, đăng nhập tài khoản với 3 vai trò: `Product Owner (PO)`, `Scrum Master (SM)`, và `Developer (Dev)`.
  * Phân quyền thao tác trực tiếp trên phòng họp (PO/SM quản lý Backlog, điều phối lật bài, bỏ phiếu lại và chốt điểm).
* **Phòng họp Real-time (STOMP WebSocket):**
  * Tạo phòng nhanh với mã 6 ký tự, hỗ trợ sao chép mã mời và lưu lịch sử các phòng đã tham gia.
  * Đồng bộ tức thì trạng thái chọn bài (úp bài kín), lật bài, bỏ phiếu lại (Re-vote) và khung chat thảo luận giữa các thành viên.
* **Trợ lý AI Engineer (Llama-3 Integration):**
  * Tự động phân tích `Title`, `Description` và `Acceptance Criteria` của User Story để đưa ra mức Story Point (dãy Fibonacci) kèm lập luận kỹ thuật.
  * Tham gia tranh luận trực tiếp trong khung chat khi được tag `@AI` hoặc bật chế độ hỏi AI, có khả năng cập nhật lại điểm ước lượng sau khi nghe lập luận của nhóm.
  * Hỗ trợ cơ chế dự phòng (`Mock Mode`) và hiển thị trạng thái kết nối dịch vụ AI theo thời gian thực.
* **Phân tích thống kê & Xuất báo cáo Sprint:**
  * Tự động tính **Điểm trung bình (Average)**, **Trung vị (Median)** và cảnh báo **Chênh lệch lớn (Outlier Detection)** khi các thành viên vote cách nhau từ 2 bước Fibonacci trở lên.
  * Quản lý Backlog (Thêm / Sửa / Xóa User Story) và xuất toàn bộ kết quả ước lượng ra file **CSV** (chuẩn UTF-8 BOM mở trực tiếp trên Excel).

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.4, Spring Security (JWT), Spring WebSocket (STOMP + SockJS), Spring Data JPA |
| **Frontend** | React, Vite, Tailwind CSS, `@stomp/stompjs`, Lucide Icons |
| **Database** | MySQL 8 |
| **AI Service** | FastAPI / Python kết nối mô hình Llama-3 (qua REST API) |

---

## 📁 Cấu trúc thư mục

```text
agile-poker-project/
├── backend/                  # Spring Boot REST API & WebSocket Server
│   └── src/main/java/com/vku/agilepoker/
│       ├── config/           # Cấu hình JWT, Spring Security, WebSocket, Async
│       ├── controller/       # REST Controllers (Auth, Room, Story) & STOMP Controller
│       ├── dto/              # Data Transfer Objects
│       ├── entity/           # JPA Entities (User, Room, UserStory, Vote, ChatMessage)
│       ├── repository/       # Spring Data JPA Repositories
│       └── service/          # Nghiệp vụ phòng họp & Tích hợp AI Service
├── frontend/                 # React SPA Client
│   └── src/
│       ├── components/       # AuthPage, LobbyPage, StorySidebar, PokerTable, DiscussionChat
│       ├── services/         # API Client tích hợp JWT Token
│       └── App.jsx           # Điều phối trạng thái & Kết nối WebSocket
└── README.md

🚀 Hướng dẫn cài đặt & Chạy dự án
1. Yêu cầu môi trường
JDK 17+ & Maven 3.8+

Node.js 18+ & npm

MySQL 8.0+ (đang chạy ở cổng 3306)

2. Cấu hình & Chạy Backend
Tạo database trống trong MySQL (ví dụ: agile_poker).

Kiểm tra thông tin kết nối Database và URL dịch vụ AI trong backend/src/main/resources/application.yml (hoặc application.properties):

YAML
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/agile_poker?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: your_mysql_password
  jpa:
    hibernate:
      ddl-auto: update

ai:
  service:
    base-url: http://localhost:8000
Khởi chạy server Spring Boot:

Bash
cd backend
mvn clean spring-boot:run
Backend sẽ chạy tại http://localhost:8080.

3. Cài đặt & Chạy Frontend
Mở một terminal mới và cài đặt các gói thư viện:

Bash
cd frontend
npm install
Khởi chạy ứng dụng React:

Bash
npm run dev
Truy cập trình duyệt tại http://localhost:5173.

🔌 Giao thức API tích hợp AI Service (Tùy chọn)
Khi triển khai dịch vụ AI riêng (FastAPI/Llama-3), Backend sẽ gọi 2 endpoint sau:

GET /health — Kiểm tra trạng thái hoạt động của mô hình.

POST /api/v1/ai/estimate — Nhận { title, description, acceptance_criteria }, trả về { story_point, reasoning }.

POST /api/v1/ai/discuss — Nhận { story, current_votes, chat_history }, trả về { reply, updated_point }.


==================Khởi chạy nhanh bằng Docker Compose===========
Yêu cầu: Máy đã cài đặt Docker và Docker Compose (Docker Desktop).

Mở terminal tại thư mục gốc agile-poker-project/ (nơi chứa file docker-compose.yml).

Build image và khởi chạy toàn bộ các container (mysql, backend, frontend):

Bash
docker compose up -d --build
Kiểm tra trạng thái các container đang chạy:

Bash
docker compose ps
Truy cập ứng dụng:

Frontend (React): http://localhost:5173 (hoặc cổng được cấu hình trong docker-compose.yml)

Backend API (Spring Boot): http://localhost:8080

MySQL Database: localhost:3306

Một số lệnh Docker hữu ích khác:

Bash
# Xem log của backend để theo dõi quá trình khởi động / gọi AI
docker compose logs -f backend

# Dừng toàn bộ hệ thống
docker compose down

# Dừng hệ thống và xóa luôn dữ liệu volume database (reset sạch DB)
docker compose down -v

