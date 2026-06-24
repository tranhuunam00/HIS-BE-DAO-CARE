# VTTech Module Cache: Auth

Phạm vi: user, đăng nhập, bảo mật, phân quyền, phạm vi chi nhánh, audit.

Nguồn: `https://vttechsolution.com/documentation`, `ProjectID=1` - Hệ thống quản lý.

## Rule Tổng Hợp Cần Bám

- User là tài khoản đăng nhập cho nhân viên, không thay thế hồ sơ nhân viên.
- User có `chi nhánh mặc định` và `phạm vi chi nhánh sử dụng`.
- Chi nhánh mặc định chỉ được chọn một và bắt buộc nằm trong phạm vi chi nhánh sử dụng.
- Khi đăng nhập, hệ thống vào chi nhánh mặc định trước.
- Khi đổi chi nhánh, danh sách chọn chỉ gồm các chi nhánh user được phép sử dụng.
- IP login dựa trên IP cấu hình của chi nhánh và cờ `Bỏ qua xác thực IP` của user.
- Nếu bật `Bỏ qua xác thực IP`, user được đăng nhập từ bất kỳ IP nào.
- Nếu tắt `Bỏ qua xác thực IP`, user chỉ đăng nhập được từ IP đã cấu hình cho chi nhánh.
- Login time window là tùy chọn; không gán thì user được đăng nhập 24/7.
- Nếu đăng nhập ngoài khung giờ được gán, hệ thống từ chối truy cập.
- Nếu cơ sở không cấu hình số lần sai mật khẩu, mặc định dùng 15 lần.
- Khóa user không xóa tài khoản và không xóa lịch sử.
- User đang đăng nhập mà bị khóa phải bị chặn ở thao tác tiếp theo và chuyển về màn hình đăng nhập.
- Reset mật khẩu do Admin thực hiện; mật khẩu tối thiểu 6 ký tự theo tài liệu VTTech.
- Phân quyền Menu, Chỉnh sửa, Report thiết lập theo nhóm user.
- Sau khi thay đổi phân quyền, user cần đăng nhập lại để áp dụng.

## Bài Đã Đọc

### [143] Tạo mới User

- Slug: `tao-moi-user`
- Created: `2025-12-29T09:54:52.817`
- Tags: `86,158`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/tao_moi_user(20250321115107).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/tao_moi_user2(20250321115109).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/tao_moi_user3(20250321115111).png`
- Nội dung nghiệp vụ:
  - Nhân viên cần có user để đăng nhập và sử dụng hệ thống.
  - Khi tạo/cập nhật user có phần cấu hình phạm vi sử dụng.
  - User có tùy chọn `Bỏ qua xác thực - IP`.
  - User có cấu hình `Giới hạn đăng nhập`, gồm giới hạn thời gian đăng nhập và giới hạn số lần sai mật khẩu.
  - Nếu cơ sở không quy định số lần sai mật khẩu, mặc định phần mềm là 15 lần.
- Gợi ý model/API:
  - User nên liên kết với staff profile.
  - Thêm field/policy: `bypassIpRestriction`, `loginTimeWindowId`, `failedLoginLimit`, `failedLoginCount`, `lockedAt` hoặc status tương đương.
  - Tạo API quản trị user riêng, không chỉ có auth register public.

### [330] Phạm vi chi nhánh & Cách đổi chi nhánh

- Slug: `pham-vi-chi-nhanh--cach-doi-chi-nhanh`
- Created: `2025-11-13T14:25:55.853`
- Tags: `175,212,158`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_1%20(1)(20251113142237).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_2(20251113141031).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_3(20251113141033).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_4(20251113141036).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_5(20251113141038).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_6(20251113141040).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_chi_nhanh_cua_user_7(20251113141042).png`
- Nội dung nghiệp vụ:
  - Chức năng quản lý quyền truy cập và thao tác dữ liệu của từng user theo từng chi nhánh.
  - Mỗi user có 2 cấu hình chi nhánh:
    - `Chi nhánh mặc định`: chi nhánh làm việc chính.
    - `Phạm vi chi nhánh sử dụng`: danh sách chi nhánh user được phép truy cập.
  - Chi nhánh mặc định chỉ được chọn một.
  - Phạm vi chi nhánh có 2 chế độ:
    - Tất cả chi nhánh.
    - Chọn một hoặc nhiều chi nhánh cụ thể.
  - Rule quan trọng: chi nhánh mặc định phải nằm trong danh sách chi nhánh được phép truy cập.
  - Khi đăng nhập, hệ thống tự động vào chi nhánh mặc định.
  - Khi đổi chi nhánh trong quá trình sử dụng, danh sách hiển thị chính là phạm vi chi nhánh sử dụng của user.
  - Sau khi chọn chi nhánh khác và lưu, hệ thống hiển thị dữ liệu của chi nhánh được chọn.
- Gợi ý model/API:
  - `users.default_branch_id`.
  - `users.branch_scope_mode = ALL | SPECIFIC`.
  - `user_branch_scopes(user_id, branch_id)` cho chế độ specific.
  - API nên có `GET /users/:id/branch-scope`, `PUT /users/:id/branch-scope`.
  - API đổi chi nhánh hiện hành có thể là `PUT /auth/active-branch` hoặc xử lý ở frontend, nhưng backend vẫn phải guard bằng branch scope.

### [301] Giới hạn đăng nhập theo IP

- Slug: `gioi-han-dang-nhap-theo-ip`
- Created: `2025-10-02T09:48:52.603`
- Tags: `13,86,158,175,206,22`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_dang_nhap_1(20250818151552).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_dang_nhap_2(20250818151554).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_dang_nhap_3(20250818151556).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pham_vi_dang_nhap_4(20250818151558).png`
- Nội dung nghiệp vụ:
  - Cơ sở kiểm soát phạm vi đăng nhập user theo địa chỉ IP.
  - Nhân viên chỉ có thể đăng nhập tại các địa điểm/IP đã được cấu hình cho chi nhánh, trừ khi user được bỏ qua xác thực IP.
  - Hệ thống xác thực dựa trên:
    - Địa chỉ IP của chi nhánh.
    - Quyền `Bỏ qua xác thực IP` của từng user.
  - Chi nhánh có cấu hình địa chỉ IP wifi của cơ sở.
  - Tùy chọn user:
    - Bật nút: user đăng nhập từ bất kỳ IP nào, không bị giới hạn theo chi nhánh.
    - Tắt nút: user chỉ đăng nhập từ địa chỉ IP đã cấu hình cho chi nhánh.
- Gợi ý model/API:
  - `branch_allowed_ips(branch_id, ip_address_or_cidr, note, is_active)`.
  - `users.bypass_ip_restriction`.
  - Login use case cần lấy IP request, kiểm tra theo default branch hoặc active branch trong login context.
  - Nếu user có branch scope all nhưng không bypass IP, vẫn phải match một IP thuộc chi nhánh cho phiên đăng nhập.

### [271] Giới hạn thời gian đăng nhập

- Slug: `gioi-han-thoi-gian-dang-nhap`
- Created: `2025-08-18T15:19:01.393`
- Tags: `86,158,175,13,22`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/gioihanthoigiandangnhap(20250709150204).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/cau_hinh_thoi_gian_dang_nhap2(20250709150323).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/cau_hinh_thoi_gian_dang_nhap3(20250709150412).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/cau_hinh_thoi_gian_dang_nhap1(20250709151519).png`
- Nội dung nghiệp vụ:
  - Cho phép giới hạn thời gian đăng nhập của nhân viên trong ngày.
  - Mục tiêu là kiểm soát truy cập theo ca làm việc hoặc quy định nội bộ.
  - Nếu không thiết lập giới hạn cho user, hệ thống mặc định cho phép đăng nhập không giới hạn thời gian 24/7.
  - Người dùng chọn user rồi gán khung thời gian đăng nhập.
  - Nếu chưa có khung thời gian, phải tạo khung thời gian đăng nhập trước.
  - Nếu nhân viên đăng nhập ngoài khoảng thời gian được cấp phép, hệ thống từ chối truy cập.
  - Khung thời gian đăng nhập có thể chỉnh sửa hoặc xóa.
- Gợi ý model/API:
  - `login_time_windows(id, name, start_time, end_time, is_active)`.
  - `users.login_time_window_id` nullable.
  - Cần xử lý case khung giờ qua nửa đêm nếu sau này có ca đêm.
  - Login use case kiểm tra theo timezone cấu hình của organization.

### [166] Khóa / Mở khóa User

- Slug: `khoa-mo-khoa-user`
- Created: `2026-04-09T15:22:04.75`
- Tags: `86,159,158`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/khoa_user_1(20260327115607).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/khoa_user_2(20260327115610).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/khoa_user_3(20260327120118).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/khoa_user_4(20260327115623).png`
- Nội dung nghiệp vụ:
  - Khóa user là tạm ngưng quyền truy cập hệ thống của tài khoản.
  - Khi bị khóa, user không thể đăng nhập và thao tác trên phần mềm cho đến khi mở khóa.
  - Mở khóa khôi phục quyền truy cập theo phân quyền hiện tại.
  - Khóa user không làm mất tài khoản; toàn bộ dữ liệu và lịch sử phát sinh vẫn được giữ.
  - Nếu user đang đăng nhập mà bị khóa, user đó không thể tiếp tục thao tác. Khi phát sinh thao tác, hệ thống tự động chuyển về màn hình đăng nhập.
  - Có thể lọc trạng thái `Đã khóa` để xem và mở khóa user.
- Gợi ý model/API:
  - `users.status = ACTIVE | LOCKED` hoặc tiếp tục `is_active` kèm `locked_at`, `locked_by`, `lock_reason`.
  - `PATCH /users/:id/lock`, `PATCH /users/:id/unlock`.
  - JWT guard nên kiểm tra trạng thái user mỗi request hoặc dùng token version/session version để revoke.
  - Khi khóa user, nên xóa/invalid refresh token để chặn refresh.

### [84] Reset mật khẩu

- Slug: `reset-mat-khau`
- Created: `2025-12-29T09:53:17.5`
- Tags: `47,86,158,176`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/reset_mat_khau1(20250321113043).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/reset_mat_khau2(20250321113121).png`
- Nội dung nghiệp vụ:
  - Admin reset mật khẩu khi nhân viên quên mật khẩu, không đăng nhập được hoặc vì lý do vận hành khác.
  - Mật khẩu cần nhập tối thiểu 6 ký tự.
- Gợi ý model/API:
  - `PATCH /users/:id/reset-password`.
  - Validate tối thiểu 6 ký tự theo VTTech; có thể để cấu hình nâng cao sau.
  - Sau reset nên clear refresh token để user đăng nhập lại.
  - Cần audit log: ai reset, reset cho user nào, thời điểm.

### [338] Phân quyền Menu

- Slug: `phan-quyen-menu`
- Created: `2026-05-25T16:00:36.347`
- Tags: `239,44`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20menu%201(20251126102420).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20menu%202(20251126102422).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pqmenu2(20251126154501).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pqmenu(20251126154620).png`
- Nội dung nghiệp vụ:
  - Phân quyền menu kiểm soát quyền truy cập menu trong phần mềm theo từng nhóm user.
  - Mục tiêu: đúng phạm vi nghiệp vụ, hạn chế truy cập sai chức năng, tăng bảo mật dữ liệu.
  - Danh sách nhóm user lấy từ chức năng `Danh sách User`.
  - Bật/tắt quyền truy cập từng chức năng rồi lưu.
  - Bật: tất cả user trong nhóm được sử dụng menu chức năng.
  - Tắt: tất cả user trong nhóm không được sử dụng menu chức năng.
  - Sau khi thay đổi phân quyền, user cần đăng nhập lại để áp dụng.
  - Ví dụ nhóm Marketing chỉ hiển thị chức năng đúng nghiệp vụ marketing.
- Gợi ý model/API:
  - Permission hiện tại có thể mở rộng thêm `type = MENU | ACTION | REPORT | EDIT_RULE`.
  - Cần group/user role management UI sau; backend trước mắt có thể dùng role như nhóm user.
  - Token nên chứa permission snapshot hoặc permission version.

### [339] Phân quyền Chỉnh sửa

- Slug: `phan-quyen-chinh-sua`
- Created: `2025-11-26T14:57:47.87`
- Tags: `205,44`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20ch%E1%BB%89nh%20s%E1%BB%ADa%201(20251126145707).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20ch%E1%BB%89nh%20s%E1%BB%ADa%202(20251126145710).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/screenshot_24(20251126145716).png`
- Nội dung nghiệp vụ:
  - Phân quyền chỉnh sửa kiểm soát user được can thiệp dữ liệu ở từng thời điểm/trường hợp.
  - Thiết lập theo nhóm user.
  - Sau khi thay đổi phân quyền, user cần đăng nhập lại để áp dụng.
  - Các loại phân quyền chỉnh sửa trong bài:
    - Chỉnh sửa ngày tạo: cho phép điều chỉnh ngày tạo ngay tại thời điểm phát sinh dữ liệu.
    - Chỉnh sửa dữ liệu cũ đã qua ngày: cho phép chỉnh dữ liệu đã tạo trước đó.
    - Mở dịch vụ bị disable bởi user khác: cho phép mở lại dịch vụ đã bị user khác disable.
- Gợi ý model/API:
  - Tách quyền CRUD thông thường khỏi quyền chỉnh sửa đặc biệt.
  - Có thể seed permission dạng:
    - `edit:created-date`
    - `edit:past-data`
    - `service:enable-disabled-by-other`
  - Các use case nhạy cảm cần check permission riêng, không chỉ `*:write`.

### [340] Phân quyền Report

- Slug: `phan-quyen-report`
- Created: `2025-11-27T09:23:46.82`
- Tags: `205,220,44`
- Ảnh hướng dẫn:
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20report%201(20251127090453).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/ph%C3%A2n%20quy%E1%BB%81n%20report%202(20251127090456).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pqreport2%20(2)(20251127090835).png`
  - `https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/pqreport(20251127090832).png`
- Nội dung nghiệp vụ:
  - Thiết lập quyền xem báo cáo theo từng nhóm user.
  - Admin quy định nhóm user được xem loại báo cáo nào để người dùng chỉ truy cập thông tin phù hợp nghiệp vụ.
  - Danh sách nhóm user lấy từ `Danh sách User`.
  - Bật: tất cả user trong nhóm được quyền xem báo cáo đó.
  - Tắt: tất cả user trong nhóm không được phép xem báo cáo đó.
  - Sau khi thay đổi phân quyền, user cần đăng nhập lại để áp dụng.
  - Ví dụ nhóm Marketing chỉ xem báo cáo khách hàng, chiến dịch, lịch hẹn; không xem kế toán, tài chính, doanh thu.
- Gợi ý model/API:
  - Report permissions nên độc lập với menu permissions.
  - Có thể seed dạng `report:<code>:read`.
  - FE menu report và API report đều cần check permission, không chỉ ẩn UI.

## Contract Đề Xuất Cho Bước Code Tiếp Theo

### Database

- `users`
  - thêm `staff_id` hoặc giữ liên kết từ `staff.user_id` hiện có, nhưng API quản trị user cần trả thông tin staff.
  - thêm `default_branch_id uuid null`.
  - thêm `branch_scope_mode varchar default 'SPECIFIC'`.
  - thêm `bypass_ip_restriction boolean default false`.
  - thêm `login_time_window_id uuid null`.
  - thêm `failed_login_count int default 0`.
  - thêm `failed_login_limit int null` hoặc lấy từ org config, default runtime là 15.
  - thêm `locked_at timestamp null`, `locked_by uuid null`, `lock_reason text null`.
- `user_branch_scopes`
  - `user_id`, `branch_id`, unique pair.
- `branch_allowed_ips`
  - `branch_id`, `ip_address`, `description`, `is_active`.
- `login_time_windows`
  - `name`, `start_time`, `end_time`, `is_active`.

### API Backend

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id/lock`
- `PATCH /users/:id/unlock`
- `PATCH /users/:id/reset-password`
- `PUT /users/:id/branch-scope`
- `GET /login-time-windows`
- `POST /login-time-windows`
- `PUT /login-time-windows/:id`
- `DELETE /login-time-windows/:id` hoặc soft disable
- `GET /branches/:id/allowed-ips`
- `PUT /branches/:id/allowed-ips`

### Guard / Use Case Rules

- Login:
  - kiểm user active/not locked.
  - kiểm password.
  - tăng failed count khi sai; khóa khi vượt limit nếu có policy.
  - kiểm login time window nếu có.
  - kiểm IP nếu `bypass_ip_restriction=false`.
  - reset failed count khi login thành công.
- Authenticated request:
  - JWT guard kiểm user còn active/not locked.
  - branch guard kiểm `activeBranchId` nằm trong scope user.
- Permission:
  - giữ permission action hiện tại.
  - bổ sung nhóm permission đặc biệt cho menu/report/edit sau nếu cần làm UI phân quyền sát VTTech.

## Bài Ưu Tiên Đọc Tiếp

- [142] Đổi mật khẩu - `doi-mat-khau`
- Bài nhóm user nếu có trong VTTech.
- Bài audit log nếu có trong nhóm user/permission.
- Quyền dữ liệu theo khách hàng/chuyên khoa/phòng khi bắt đầu module tương ứng.

