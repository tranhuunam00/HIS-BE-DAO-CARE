# VTTech Module Cache: Medical

Phạm vi: chuyên khoa, dịch vụ/sản phẩm, ICD-10, thuốc, đơn thuốc.

## Bài Đã Đọc

### [319] Cấu hình nhóm dịch vụ

- Slug: `cau-hinh-nhom-dich-vu`
- Ý chính:
  - Nhóm dịch vụ phân loại dịch vụ/sản phẩm theo nhóm lớn.
  - Nhóm có phân loại `Dịch vụ` hoặc `Sản phẩm`.
  - Mã và tên nhóm bắt buộc, không được trùng.
- Gợi ý model HIS:
  - `ServiceGroup` cần `type = SERVICE | PRODUCT`.

### [106] Cấu hình dịch vụ mới

- Slug: `cau-hinh-dich-vu-moi`
- Ý chính:
  - Trước khi tạo dịch vụ/sản phẩm cần có nhóm.
  - Khi tạo cần nhập tên, chọn loại dịch vụ/sản phẩm, chọn nhóm.
  - Không được trùng tên với dịch vụ/sản phẩm đã tồn tại.
  - Với nha khoa có đơn vị răng/hàm và giá min/max.
- Gợi ý model HIS:
  - `ServiceCatalogItem` có type, group, code, name, specialty, pricing.
  - Unique name/code trong phạm vi tenant.

### [49] Đơn vị tính của dịch vụ

- Slug: `don-vi-tinh-cua-dich-vu`
- Ý chính:
  - Đơn vị tính xác định cách đo số lượng dịch vụ/sản phẩm khi bán/sử dụng.
  - Tên đơn vị tính không được trùng.
  - Ví dụ phòng khám: lần, buổi, ca; thuốc/sản phẩm: viên, vỉ, hộp, lọ.
- Gợi ý model HIS:
  - `UnitOfMeasure` dùng chung cho service/product/medicine.

### [57] Min, Max trong giá của dịch vụ

- Slug: `min-max-trong-gia-cua-dich-vu`
- Ý chính:
  - Cho phép cấu hình giá nhỏ nhất/lớn nhất.
  - Khi tạo đơn hàng, người dùng có thể chỉnh giá trong khoảng đã cấu hình.
- Gợi ý model HIS:
  - Pricing cần `minPrice`, `maxPrice`, `listPrice`.
  - Validate khi nhập giá bán thực tế.

### [312] Phí VAT

- Slug: `phi-vat`
- Ý chính:
  - Dịch vụ/sản phẩm có thể cấu hình tỷ lệ VAT.
  - Tỷ lệ VAT được VTTech cấu hình sẵn theo mức thuế quy định.
  - Giá dịch vụ/sản phẩm có thể bao gồm VAT.
- Gợi ý model HIS:
  - Catalog item cần `vatRateId` hoặc `vatRate`.
  - Tách cấu hình VAT rate khỏi item để dễ thay đổi.

### [342] Vô hiệu hóa dịch vụ

- Slug: `vo-hieu-hoa-dich-vu`
- Ý chính:
  - Vô hiệu hóa là tạm ngưng dịch vụ/sản phẩm, có thể kích hoạt lại.
  - Dịch vụ/sản phẩm vô hiệu hóa không xuất hiện ở các màn hình bán hàng.
- Gợi ý model HIS:
  - Dùng status `ACTIVE | DISABLED`.
  - Không hard delete catalog item đã phát sinh nghiệp vụ.

### [164] Danh mục ICD-10

- Slug: `danh-muc-icd-10`
- Ý chính:
  - ICD-10 là mã chẩn đoán chuẩn WHO; tại Việt Nam đơn thuốc/hồ sơ chẩn đoán phải có mã ICD-10 tương ứng.
  - VTTech có danh mục ICD-10 chuẩn, có thể chọn theo chuyên khoa.
  - Tích hợp vào màn hình kê đơn thuốc, chẩn đoán bệnh.
- Gợi ý model HIS:
  - `IcdCode` có mã, tên, mô tả, chương/nhóm, specialty mapping.
  - Use case kê đơn/chẩn đoán cần kiểm tra ICD khi bắt buộc.

### [87] Cấu hình đơn thuốc mẫu

- Slug: `cau-hinh-don-thuoc-mau`
- Ý chính:
  - Đơn thuốc mẫu giúp bác sĩ kê đơn nhanh.
  - Mã đơn thuốc mẫu không được trùng.
  - Mẫu gồm tên và danh sách thuốc; có thể chỉnh liều dùng chi tiết hoặc xóa thuốc khỏi mẫu.
- Gợi ý model HIS:
  - `PrescriptionTemplate`, `PrescriptionTemplateItem`.

### [304] Đồng bộ đơn thuốc quốc gia

- Slug: `dong-bo-don-thuoc-quoc-gia`
- Ý chính:
  - Cơ sở phải đồng bộ đơn thuốc lên Cổng Đơn thuốc quốc gia theo quy định Bộ Y tế.
  - Điều kiện: đơn thuốc đủ thông tin chuẩn, cơ sở có tài khoản/mã liên thông, mỗi chi nhánh có mã liên thông riêng.
  - Bác sĩ cần tài khoản và mã định danh y tế.
- Gợi ý model HIS:
  - Branch cần `nationalPrescriptionFacilityCode`.
  - Doctor/staff cần mã định danh y tế.
  - Prescription cần trạng thái đồng bộ và log lỗi đồng bộ.

## Bài Ưu Tiên Đọc Tiếp

- [210] Kê đơn thuốc mới - `ke-don-thuoc-moi`
- [435] Kê đơn thuốc từ đơn thuốc có sẵn - `ke-don-thuoc-tu-don-thuoc-co-san`
- [212] Chỉnh sửa / Xóa đơn thuốc - `chinh-sua-/-xoa-don-thuoc`
- [217] Thanh toán đơn thuốc - `thanh-toan-don-thuoc`
- [434] Gợi ý thuốc thay thế theo thành phần - `goi-y-thuoc-thay-the-theo-thanh-phan`
- [453] Quy trình xử lý đơn thuốc tại quầy dược - `quy-trinh-xu-ly-don-thuoc-tai-quay-duoc`

