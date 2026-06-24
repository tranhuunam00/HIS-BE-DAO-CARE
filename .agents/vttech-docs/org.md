# VTTech Module Cache: Org

Phạm vi: tổ chức, cơ sở/chi nhánh, phòng/tài nguyên, nhân sự, bộ phận, lịch làm việc nhân sự.

## Bài Đã Đọc

### [99] Cập nhật thông tin chi nhánh

- Slug: `cap-nhat-thong-tin-chi-nhanh`
- Ý chính:
  - Người dùng chọn chi nhánh cần sửa, nhập đủ thông tin và lưu.
  - Nếu đổi địa chỉ chi nhánh, địa chỉ trên form in hóa đơn thay đổi theo.
  - Chi nhánh có cấu hình mã QR thanh toán ngân hàng.
- Gợi ý model HIS:
  - `Branch` cần chứa thông tin liên hệ, địa chỉ, trạng thái, giờ mở cửa.
  - Nên có nhóm field thanh toán ngân hàng/VietQR theo chi nhánh.
  - Form in hóa đơn nên lấy địa chỉ từ branch hiện hành.
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/chinhanh1(20250804140126).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/chinhanh2(20250804140612).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/chinhanh3(20250804140130).png`
- Ảnh đã capture thử:
  - `C:\tmp\vttech_chinhanh1.png`

### [71] Cấu trúc các loại mã trong hệ thống

- Slug: `cau-truc-cac-loai-ma-trong-he-thong`
- Ý chính:
  - Hệ thống dùng cấu trúc mã để tự sinh mã khách hàng, hồ sơ, hóa đơn, phiếu thu/chi, dịch vụ.
  - Mục tiêu: đồng nhất, không trùng, dễ đối soát.
  - Xóa dữ liệu cũ không làm lùi sequence; mã đã xóa không được tái sử dụng.
- Gợi ý model HIS:
  - Cần bảng cấu hình `code_sequences` hoặc tương đương.
  - Sequence phải monotonic theo scope đã chọn, không phụ thuộc bản ghi hiện còn.
  - Nên hỗ trợ format cho MRN, Patient Code, Visit Code, Invoice, Receipt, Service.

### [316] Thay đổi múi giờ

- Slug: `thay-doi-mui-gio`
- Ý chính:
  - Múi giờ áp dụng để dữ liệu thời gian đúng theo thực tế vùng lãnh thổ.
  - Chỉ VTTech có quyền cấu hình thay đổi múi giờ.
  - Thay đổi múi giờ áp dụng toàn cơ sở, không theo từng chi nhánh.
- Gợi ý model HIS:
  - Organization/System config nên có timezone cấp tenant/organization.
  - Không thiết kế timezone riêng per branch ở phase 1 nếu muốn bám VTTech.

### [250] Cấu hình và chuyển trạng thái phòng

- Slug: `cau-hinh-va-chuyen-trang-thai-phong`
- Ý chính:
  - Trạng thái phòng được quản lý thông qua trạng thái lịch hẹn.
  - Có cấu hình `Chọn phòng` theo từng trạng thái lịch hẹn.
  - Khi chuyển đến trạng thái đã bật `Chọn phòng`, bắt buộc chọn phòng.
  - Một số trạng thái mặc định như `Chưa đến`, `Đã đến`, `Ra về` không được chỉnh cấu hình chọn phòng.
  - Có màn hình tổng quan `Trạng thái phòng`.
- Gợi ý model HIS:
  - `AppointmentStatus` nên có config `requiresRoomSelection`.
  - `RoomStatus` có thể là trạng thái tính toán từ lịch hẹn/visit hiện hành.

### [276] Tạo bộ phận

- Slug: `tao-bo-phan`
- Ý chính:
  - Bộ phận dùng để phân nhóm nhân viên theo phòng ban/vai trò.
  - Khi tạo bộ phận cần nhập tên và cài đặt vai trò tương ứng.
  - Vai trò giúp nhân viên thuộc bộ phận hiển thị ở các trường chọn người theo vai trò.
  - Chỉ xóa được bộ phận khi không còn nhân viên thuộc bộ phận đó.
- Gợi ý model HIS:
  - `Department` cần quan hệ với role/employee role.
  - Xóa department phải kiểm tra ràng buộc nhân viên.

### [144] Tạo mới nhân viên

- Slug: `tao-moi-nhan-vien`
- Ý chính:
  - Cần tạo hồ sơ nhân viên để tên hiển thị khi thao tác trong hệ thống.
  - Phải tạo bộ phận trước khi tạo nhân viên.
  - Với bác sĩ, cần điền `Nickname` để hiển thị trên màn hình lịch hẹn bác sĩ.
- Gợi ý model HIS:
  - `StaffProfile` cần thuộc department.
  - Bác sĩ nên có `displayName`/`nickname` riêng với tên pháp lý.

### [58] Vai trò nhân viên

- Slug: `vai-tro-nhan-vien`
- Ý chính:
  - Bộ phận/vai trò quyết định nhân viên xuất hiện ở các luồng nghiệp vụ.
  - Bác sĩ điều trị, phụ tá/KTV, hỗ trợ chuyên môn xuất hiện trong điều trị.
  - Người chịu trách nhiệm, tư vấn viên, telesale xuất hiện khi tạo dịch vụ cho khách hàng.
  - Thu ngân làm việc ở lịch sử thu chi.
  - Nhân viên Labo làm việc ở đơn hàng Labo.
- Gợi ý model HIS:
  - Không chỉ dùng role bảo mật; cần role nghiệp vụ/clinical role để lọc danh sách nhân sự theo ngữ cảnh.

### [167] Tổng quan về cập nhật lịch làm việc

- Slug: `tong-quan-ve-cap-nhat-lich-lam-viec`
- Ý chính:
  - Cần cấu hình ca làm việc trước khi cập nhật lịch làm việc.
  - Có 3 cách cập nhật lịch: từng nhân viên, nhiều nhân viên cùng lịch, theo file Excel.
- Gợi ý model HIS:
  - `Shift`, `StaffScheduleTemplate`, `StaffScheduleOverride`.

### [463] Cập nhật lịch làm việc cho từng nhân viên

- Slug: `cap-nhat-lich-lam-viec-cho-tung-nhan-vien`
- Ý chính:
  - Chọn nhân viên, chọn ngày trong tuần, ca làm việc và chi nhánh tương ứng.
  - Có thể tìm kiếm nhân viên và lọc theo chi nhánh, bộ phận.
  - Một ngày có thể có nhiều ca ở các chi nhánh khác nhau.
- Gợi ý model HIS:
  - Schedule entry cần hỗ trợ nhiều ca/ngày.
  - Mỗi ca có branch làm việc.

### [464] Cập nhật cho nhiều nhân viên có cùng lịch làm việc

- Slug: `cap-nhat-cho-nhieu-nhan-vien-co-cung-lich-lam-viec`
- Ý chính:
  - Cập nhật nhanh cho nhiều nhân viên có cùng lịch.
  - Chọn danh sách nhân viên, ngày, ca và chi nhánh.
  - Lịch áp dụng từ ngày bắt đầu và duy trì đến khi có thay đổi mới.
- Gợi ý model HIS:
  - Bulk schedule update cần tạo lịch áp dụng từ effective date.

### [372] Cập nhật lịch làm việc theo file

- Slug: `cap-nhat-lich-lam-viec-theo-file`
- Ý chính:
  - Import lịch làm việc qua Excel theo mẫu hệ thống.
  - Lọc mẫu theo chi nhánh, bộ phận, ngày bắt đầu, ca làm việc.
  - Lịch import có hiệu lực từ ngày bắt đầu đến khi được thay thế.
- Gợi ý model HIS:
  - Phase sau có thể cần import Excel; phase 1 nên chừa API/DTO phù hợp.

### [375] Điều chỉnh lịch làm việc theo ngày

- Slug: `dieu-chinh-lich-lam-viec-theo-ngay`
- Ý chính:
  - Dùng khi nhân viên đổi ca, chỉnh giờ làm, nghỉ phép từng ngày.
  - Chỉ áp dụng cho nhân viên đã có lịch làm việc.
  - Cần bật quyền `Cập nhật lịch làm việc 1 ngày`.
- Gợi ý model HIS:
  - Daily override không nên sửa template gốc.
  - Cần permission riêng cho chỉnh lịch một ngày.

## Bài Ưu Tiên Đọc Tiếp

- Cơ sở/chi nhánh: các bài có tag `chinhanh`, `coso`.
- Phòng: bài chi tiết về trạng thái phòng, đặt phòng trước lịch hẹn.
- Nhân sự: chỉnh sửa nhân viên, bộ phận, phân công theo cơ sở/chuyên khoa/phòng.

