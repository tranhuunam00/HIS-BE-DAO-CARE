# VTTech Docs Cache

> Cache nghiệp vụ VTTech cho backend agents. Đọc đến đâu lưu đến đó, tách theo module nghiệp vụ để mỗi agent chỉ nạp đúng context cần thiết.

## Trạng Thái

- Cập nhật lần đầu: 2026-06-24, Asia/Saigon.
- Nguồn chính: https://vttechsolution.com/documentation
- Phạm vi đã đọc sâu: `ProjectID=1` - `Hệ thống quản lý`, các bài liên quan trực tiếp `structure.phase1.md`.
- Ảnh hướng dẫn đã test tải được từ CDN VTTech.

## Cách VTTech Load Tài Liệu

Trang tài liệu tải dữ liệu động bằng API nội bộ:

- Danh sách bài:
  - `POST https://vttechsolution.com/api/Guide/Getlist`
  - Body mẫu: `{"ProjectID":1,"PackageID":0}`
- Chi tiết bài:
  - `POST https://vttechsolution.com/api/Guide/GetDetail`
  - Body mẫu: `{"DetailID":99,"Slug":"cap-nhat-thong-tin-chi-nhanh"}`

Project:

- `1`: Hệ thống quản lý
- `2`: Mobile app
- `3`: Zalo mini app
- `5`: App manage

Package:

- `0`: Package
- `2`: Tiêu chuẩn
- `3`: Chuyên nghiệp
- `4`: Cao cấp

## Module Files

- `org.md`: tổ chức, cơ sở/chi nhánh, phòng/tài nguyên, nhân sự, lịch làm việc nhân sự.
- `auth.md`: user, đăng nhập, bảo mật, phân quyền, audit.
- `medical.md`: dịch vụ/sản phẩm, ICD-10, thuốc, đơn thuốc.
- `engine.md`: lịch hẹn, workflow, routing, notification, thanh toán, tích hợp thiết bị.
- `forms.md`: mẫu nội dung, form builder, mẫu in.

## Mapping Với Backend Agents

- `be-agent-org`: đọc `org.md`.
- `be-agent-auth`: đọc `auth.md`.
- `be-agent-medical`: đọc `medical.md`.
- `be-agent-engine`: đọc `engine.md`.
- `be-agent-forms`: đọc `forms.md`.

## Quy Ước Cập Nhật

1. Đọc bài VTTech nào thì ghi vào đúng file module nghiệp vụ.
2. Mỗi bài cần có `ID`, `Title`, `Slug`, ý chính, gợi ý model/API/UI.
3. Nếu có ảnh, ghi URL ảnh trong bài.
4. Nếu đã tải/capture ảnh local, ghi local path hoặc path trong repo.
5. Bài chưa đọc hết đưa vào phần `Bài Ưu Tiên Đọc Tiếp` của module tương ứng.

