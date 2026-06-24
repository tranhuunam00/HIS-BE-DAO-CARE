# VTTech Module Cache: Engine

Phạm vi: lịch hẹn, workflow, routing, notification, thanh toán, tích hợp thiết bị.

## Bài Đã Đọc

### [34] Trạng thái lịch hẹn

- Slug: `trang-thai-lich-hen`
- Ý chính:
  - Trạng thái lịch hẹn phản ánh tiến trình thực tế của khách hàng.
  - Có thể cấu hình trạng thái kế tiếp.
  - Cho phép nhiều trạng thái kế tiếp, không ép workflow tuyến tính cứng.
- Gợi ý model HIS:
  - `AppointmentStatusTransition` dạng graph.
  - Không hard-code một flow duy nhất.

### [104] Ràng buộc chuyển trạng thái lịch hẹn

- Slug: `rang-buoc-chuyen-trang-thai-lich-hen`
- Ý chính:
  - Chỉ nhóm user được chỉ định mới có thể chuyển một số trạng thái lịch hẹn.
  - Giúp kiểm soát quy trình và hạn chế sai sót.
- Gợi ý model HIS:
  - Transition config cần allowed user groups/roles.

### [112] Cấu hình mã màu cho lịch hẹn

- Slug: `cau-hinh-ma-mau-cho-lich-hen`
- Ý chính:
  - Cấu hình màu theo trạng thái lịch hẹn và loại lịch hẹn.
  - Một lịch hẹn có thể hiển thị đồng thời màu trạng thái và màu loại lịch hẹn.
- Gợi ý model HIS:
  - `AppointmentStatus.color`, `AppointmentType.color`.

### [451] Thời gian dự kiến của lịch hẹn

- Slug: `thoi-gian-du-kien-cua-lich-hen`
- Ý chính:
  - Thời gian hẹn dự kiến là số phút cần để hoàn thành lịch hẹn.
  - Có thể tạo các mốc thời gian và chọn một mốc mặc định.
  - Hệ thống dùng để xác định thời gian bắt đầu/kết thúc dự kiến.
- Gợi ý model HIS:
  - `AppointmentDurationOption`, có `isDefault`.
  - Service cũng có thể có duration riêng.

### [262] Quy trình đặt lịch và xử lý lịch hẹn online (Booking online)

- Slug: `quy-trinh-dat-lich-va-xu-ly-lich-hen-online-booking-online`
- Ý chính:
  - Cơ sở cung cấp link hoặc QR để khách hàng đặt lịch.
  - Khách chọn dịch vụ quan tâm, chi nhánh, nhập thông tin đăng ký.
  - Cơ sở tiếp nhận và xử lý lịch hẹn.
  - Một số điện thoại chỉ được booking một lịch theo ràng buộc bài viết.
- Gợi ý model HIS:
  - Online booking cần chống trùng theo phone/time/business rule.
  - Booking public tạo appointment ở trạng thái chờ tiếp nhận/xác nhận.

### [399] Cấu hình thời gian đặt lịch trên trang Booking online

- Slug: `cau-hinh-thoi-gian-dat-lich-tren-trang-booking-online`
- Ý chính:
  - Có thể cấu hình khung giờ đặt lịch chung cho tất cả ngày trong tuần.
  - Có thể cấu hình khung giờ riêng theo từng ngày trong tuần.
- Gợi ý model HIS:
  - `OnlineBookingTimeWindow` hỗ trợ mode global và per weekday.

### [373] Điều kiện nhận thông báo

- Slug: `dieu-kien-nhan-thong-bao`
- Ý chính:
  - User nhận thông báo khi đồng thời thỏa:
    - Thuộc nhóm user được cấp quyền nhận thông báo.
    - Bật nhận thông báo cá nhân.
    - Trình duyệt cho phép hiển thị thông báo.
- Gợi ý model HIS:
  - Notification delivery cần kiểm tra group permission + user preference.

### [261] Thông báo realtime lịch hẹn

- Slug: `thong-bao-realtime-lich-hen`
- Ý chính:
  - Có chức năng nhận thông báo lịch hẹn theo thời gian thực.
  - Cấu hình nhóm user được phép nhận thông báo lịch hẹn.
- Gợi ý model HIS:
  - Appointment events nên phát notification realtime cho nhóm được cấu hình.

### [272] Phương thức thanh toán

- Slug: `phuong-thuc-thanh-toan`
- Ý chính:
  - Hệ thống cho phép cấu hình nhóm phương thức thanh toán và phương thức chi tiết.
  - Mục tiêu chuẩn hóa thu/chi và giảm thao tác nhập liệu.
- Gợi ý model HIS:
  - `PaymentMethodGroup` và `PaymentMethod`.
  - Branch có thể có thông tin QR ngân hàng riêng.

### [454] Đồng bộ hình ảnh từ thiết bị chẩn đoán

- Slug: `dong-bo-hinh-anh-tu-thiet-bi-chan-doan`
- Ý chính:
  - VTTech kết nối thiết bị chẩn đoán qua máy tính trung gian.
  - Thiết lập kết nối theo chuẩn DICOM.
  - Ảnh từ thiết bị được đồng bộ vào phần mềm để dùng trong chức năng trả kết quả.
- Gợi ý model HIS:
  - Integration PACS/DICOM nên là module riêng.
  - File ảnh y khoa nên đi qua storage như MinIO.

## Bài Ưu Tiên Đọc Tiếp

- [162] Tạo lịch hẹn - `tao-lich-hen`
- [165] Chỉnh sửa lịch hẹn - `chinh-sua-lich-hen`
- [35] Xóa / Hủy lịch hẹn - `xoa-/-huy-lich-hen`
- [251] Đặt phòng trước cho lịch hẹn - `dat-phong-truoc-cho-lich-hen`
- [229] Theo dõi lịch hẹn - `theo-doi-lich-hen`
- [248] Lịch sử của lịch hẹn - `lich-su-cua-lich-hen`
- [333] Khám bệnh - `kham-benh`
- [279] Chỉ định xét nghiệm - `chi-dinh-xet-nghiem`
- [283] Trả kết quả xét nghiệm - `tra-ket-qua-xet-nghiem`
- [285] Trả kết quả siêu âm - `tra-ket-qua-sieu-am`
- [447] Tra cứu phiếu trả kết quả trực tuyến - `tra-cuu-phieu-tra-ket-qua-truc-tuyen`

