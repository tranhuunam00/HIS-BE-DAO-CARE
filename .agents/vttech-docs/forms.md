# VTTech Module Cache: Forms

Phạm vi: mẫu nội dung, form builder, clinical/admin templates, mẫu in.

## Bài Đã Đọc

### [326] Mẫu nội dung

- Slug: `mau-noi-dung`
- Ý chính:
  - Cho phép cấu hình mẫu nội dung dùng chung để tự động điền ở các chức năng có hỗ trợ.
  - Có nhóm mẫu, loại chức năng áp dụng, tên nội dung, mô tả/nội dung mẫu.
  - Mục tiêu là giảm nhập liệu lặp lại và thống nhất dữ liệu.
- Gợi ý model HIS:
  - Có thể dùng cho clinical template, administrative template, SMS/email template.
  - Nên tách `TemplateGroup` và `ContentTemplate`.

## Bài Ưu Tiên Đọc Tiếp

- Mẫu in header/footer theo chi nhánh.
- Phiếu chỉ định cận lâm sàng/thủ thuật.
- Phiếu kết quả cận lâm sàng.
- Mẫu đơn thuốc y tế.
- Phiếu thu/phiếu chi, hóa đơn/biên lai.

