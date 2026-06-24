# HIS-DAO-CARE: Backend Development Skill & Architecture Guide

Tài liệu này định nghĩa các nguyên tắc phát triển, cấu trúc thư mục, tiêu chuẩn bảo mật và quy tắc viết code (Coding Standards) dành riêng cho các Backend Agent phát triển dự án **HIS-DAO-CARE**.

---

## 1. Công Nghệ & Kiến Trúc Cốt Lõi

*   **Framework chính**: NestJS.
*   **Ngôn ngữ**: TypeScript (TS).
*   **Mô hình thiết kế**: Domain-Driven Design (DDD) kết hợp với Clean Architecture.
*   **Quy trình kiểm thử**: Bắt buộc viết Unit Test cho 100% Use Cases.
*   **Tài liệu hóa**: 100% API endpoints phải có tài liệu Swagger/OpenAPI.
*   **Cơ sở dữ liệu chính**: PostgreSQL.
*   **Lưu trữ tệp tin**: MinIO (sử dụng cho toàn bộ ảnh, video, tài liệu và tệp tin đính kèm).

---

## 2. Phân Chia Cấu Trúc Thư Mục (Clean Architecture & DDD)

Mỗi module trong hệ thống cần tuân thủ cấu trúc 4 lớp sau để tách biệt rõ ràng trách nhiệm:

```
src/modules/<module_name>/
├── domain/                    # 1. Lớp Nghiệp Vụ Chính (Entities, Value Objects, Rules)
│   ├── entities/              # Các thực thể cốt lõi (ví dụ: Patient.ts, Appointment.ts)
│   ├── value-objects/         # Các đối tượng giá trị (ví dụ: Email.ts, PhoneNumber.ts)
│   ├── repositories/          # Interfaces định nghĩa cách lưu trữ (không chứa code thực thi)
│   └── events/                # Các Domain Events phát sinh
│
├── application/               # 2. Lớp Luồng Công Việc (Use Cases & DTOs)
│   ├── use-cases/             # Chứa logic thực thi từng ca sử dụng (ví dụ: CreateAppointmentUseCase.ts)
│   ├── dtos/                  # Cấu trúc dữ liệu Input/Output của Use Case
│   └── use-cases/__tests__/   # Bắt buộc: File Unit Test cho từng Use Case (.spec.ts)
│
├── infrastructure/            # 3. Lớp Kỹ Thuật (Database, ORM, External Services, Security)
│   ├── database/              # Schema database, ORM models (Prisma/TypeORM/Mongoose)
│   ├── repositories/          # Implement chi tiết của Domain Repositories
│   └── services/              # Tích hợp cổng thanh toán, SMS, PACS/LIS...
│
    │   ├── guards/            # NestJS Guards (Auth, Permissions)
    │   ├── pipes/             # NestJS Pipes (Validation, Transformation)
    │   ├── <module>.controller.ts # NestJS Controller
    │   └── <module>.module.ts # NestJS Module
    └── swagger/               # Tài liệu OpenAPI của module (Swagger Decorators)
```

---

## 3. Các Quy Tắc Viết Code Bắt Buộc (Hard Coding Rules)

### 3.1. Tuyệt đối KHÔNG dùng Magic Number / Magic String
*   Tất cả các số, trạng thái (status), mã lỗi, giá trị cấu hình giới hạn... không được viết trực tiếp trong logic code.
*   **Yêu cầu**: Phải định nghĩa trong các tệp hằng số (`constants/`) hoặc Enum rõ nghĩa.
*   *Sai*: `if (appointment.status === 2) { ... }`
*   *Đúng*: `if (appointment.status === AppointmentStatus.WAITING) { ... }`

### 3.2. Bắt buộc viết Unit Test cho Use Case
*   Mỗi Use Case khi được tạo mới hoặc sửa đổi phải có tệp test đi kèm (`<use-case>.spec.ts`).
*   Sử dụng cơ chế Mocking (ví dụ: Mock Repositories) để test logic của Use Case mà không kết nối với database thật.
*   Coverage của lớp `application` và `domain` phải đạt tối thiểu **90%**.

### 3.3. Tài liệu hóa Swagger
*   Mọi API phải được mô tả chi tiết bằng Swagger annotations/decorators.
*   Phải chỉ rõ: Cấu trúc Request Body, Query Params, cấu trúc Response thành công (200/201) và các mã lỗi có thể xảy ra (400, 401, 403, 404, 500).

---

## 4. Bảo Mật & Phòng Thủ (Security & Defensive Programming)

### 4.1. Rate Limiting (Giới hạn tần suất yêu cầu)
*   **Public API**: Giới hạn mặc định tối đa 100 requests / 15 phút cho mỗi IP.
*   **Sensitive API (Đăng nhập, OTP, Đặt lịch)**: Giới hạn nghiêm ngặt tối đa 5 requests / 1 phút cho mỗi IP/Tài khoản để chống brute-force và spam SMS.

### 4.2. Bảo mật HTTP Headers (Helmet)
*   Bắt buộc tích hợp thư viện `helmet` để bảo vệ ứng dụng khỏi các lỗ hổng HTTP headers thông thường (X-Frame-Options, X-XSS-Protection, Strict-Transport-Security...).

### 4.3. CORS (Cross-Origin Resource Sharing)
*   Cấu hình chặt chẽ CORS. Không sử dụng `origin: '*'` ở môi trường production.
*   Chỉ cho phép các domain được định nghĩa trong danh sách trắng (Whitelist) cấu hình qua biến môi trường `.env`.

### 4.4. Kiểm tra và Lọc dữ liệu đầu vào (Input Validation & Sanitization)
*   Sử dụng DTOs kết hợp các thư viện validate mạnh mẽ (như `class-validator` hoặc `zod`) để lọc và kiểm tra dữ liệu trước khi đi vào Use Case.
*   Tránh các lỗi injection (SQL, NoSQL, Command) bằng cách sử dụng ORM parameterized queries.

### 4.5. Quản lý Lỗi (Error Handling)
*   Không bao giờ hiển thị trực tiếp stack trace của hệ thống ra ngoài API Client ở môi trường production.
*   Phân biệt rõ **Domain Error** (Lỗi nghiệp vụ - trả về 4xx kèm mã lỗi tự định nghĩa) và **System Error** (Lỗi hệ thống - ghi log kèm trace ID và trả về 500 cho khách hàng).

---

## 5. Quy Trình Mô Phỏng Nghiệp Vụ VTTECH (VTTech Emulation Guidelines)

### 5.1. Nguyên tắc đọc tài liệu và phản hồi
*   **Bắt buộc nghiên cứu trước**: Trước khi làm bất kỳ tính năng hoặc sửa đổi nào, Agent phải đọc kỹ tài liệu nghiệp vụ tương ứng từ cổng tài liệu của VTTech (`https://vttechsolution.com/documentation`).
*   **Review trước khi code**: Trình bày rõ ràng giải pháp, luồng đi và thiết kế API/Giao diện cho USER duyệt. **Không tự ý thực hiện code khi chưa có sự xác nhận.**
*   **Hỏi ý kiến từng chặng**: Đến mỗi bước có sự lựa chọn thiết kế hoặc cấu trúc dữ liệu, phải dừng lại hỏi ý kiến USER.

### 5.2. Phân chia Agent chi tiết cho từng phần việc tiếp theo
*   **Phần 1: Chi nhánh & Phòng/Giường (Branch & Rooms Card Grid)**
    *   **Backend Agent**: `be-agent-org` chịu trách nhiệm mở rộng schema/API (cập nhật thông tin ngân hàng VietQR cho chi nhánh, cấu hình trạng thái phòng/giường).
    *   **Frontend Agent**: `fe-agent-org` chịu trách nhiệm thiết kế giao diện đổi chi nhánh trên Header, và sơ đồ lưới phòng theo Tầng -> Thẻ Phòng -> Danh sách Giường/Ghế.
*   **Phần 2: Nhân viên & Phòng ban (Staff & Departments)**
    *   **Backend Agent**: `be-agent-org` (quản lý nhân viên, hồ sơ, Nickname bác sĩ) kết hợp với `be-agent-auth` (quản lý phân quyền theo Bộ phận/Phòng ban).
    *   **Frontend Agent**: `fe-agent-org` (UI thêm/sửa nhân sự có Nickname, quản lý danh mục phòng ban) và `fe-agent-auth` (UI gán vai trò theo Phòng ban).
*   **Phần 3: Lịch làm việc & Ca trực (Schedules & Shifts)**
    *   **Backend Agent**: `be-agent-engine`.
    *   **Frontend Agent**: `fe-agent-engine`.

