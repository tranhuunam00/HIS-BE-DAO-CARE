# VTTech Detailed Requirement Specs: Schedules & Shifts

Tài liệu này ghi nhận chi tiết nghiệp vụ liên quan đến phân hệ **Lịch làm việc & Ca trực** được quét động từ VTTech Solution API vào ngày 2026-06-24.

## [442] Lịch làm việc cá nhân

*   **Slug**: `lich-lam-viec-ca-nhan`
*   **Nội dung nghiệp vụ chi tiết**:

* Chức năng &ldquo;Lịch làm việc cá nhân&rdquo; cho phép người dùng theo d&otilde;i toàn bộ lịch làm việc đ&atilde; được phân công cho chính mình trên hệ thống.
 


 


**Hướng dẫn thao tác:**
 

* Thao tác xem lịch làm việc cá nhân.
 



![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/lich_lam_viec_cua_toi_2(20260414115000).png)

---

## [167] Tổng quan về cập nhật lịch làm việc

*   **Slug**: `tong-quan-ve-cap-nhat-lich-lam-viec`
*   **Nội dung nghiệp vụ chi tiết**:

* Chức năng này hỗ trợ người dùng tạo mới, cập nhật và điều chỉnh lịch làm việc của nhân viên theo nhu cầu vận hành thực tế của cơ sở.

* Khi có phát sinh thay đổi về ca làm việc hoặc ngày làm việc, người dùng có thể điều chỉnh lịch làm việc bằng nhiều hình thức cập nhật khác nhau trên hệ thống.
 


 


**Hướng dẫn thao tác:**


**1. Cấu hình ca làm việc**
 

* Trước khi thực hiện cập nhật lịch làm việc, người dùng cần cấu hình ca làm việc để hệ thống có cơ sở phân chia ca cho nhân viên.
 


 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/cnllv(20260528151157).png)

---

## [372] Cập nhật lịch làm việc theo file

*   **Slug**: `cap-nhat-lich-lam-viec-theo-file`
*   **Nội dung nghiệp vụ chi tiết**:

* 


Chức năng này cho phép cơ sở cập nhật lịch làm việc cho nhân viên một cách nhanh chóng bằng cách tải lên tệp Excel đ&atilde; chuẩn bị sẵn theo đúng mẫu định dạng của hệ thống.


* 


 Lịch cập nhật sẽ có hiệu lực từ ngày bắt đầu áp dụng và duy trì cho đến khi được thay thế bằng lịch mới.

 


 


**Hướng dẫn thao tác:**
 

* 


Tại màn hình &ldquo;Lịch làm việc&rdquo; người dùng click chọn vào &ldquo;Tải tệp lên&rdquo; để thực hiện các bước tiếp theo.

 



![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/illv2(20251216160836).png)



 


 


**2. Tải tệp lên và kiểm tra thông tin **
 

* 


Sau khi điền đầy đủ dữ liệu vào file Excel mẫu, người dùng thực hiện:

 

* 


Chọn loại mẫu muốn nhập (theo hàng hoặc theo cột).


* 


Click vào dấu + để tải tệp lên.

 
 


**Lưu ý:** Người dùng lấy mẫu theo định dạng nào (theo hàng hoặc theo cột) thì cần nhập dữ liệu theo đúng định dạng tương ứng.



![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/llv%20b%E1%BB%99%20ph%E1%BA%ADn_2(20260615135759).png)

---

## [375] Điều chỉnh lịch làm việc theo ngày

*   **Slug**: `dieu-chinh-lich-lam-viec-theo-ngay`
*   **Nội dung nghiệp vụ chi tiết**:

* Trong quá trình vận hành, có thể phát sinh các trường hợp nhân viên cần đổi ca làm việc, điều chỉnh thời gian làm việc hoặc nghỉ phép sau khi lịch làm việc đ&atilde; được thiết lập.

* 


Chức năng này hỗ trợ người dùng cập nhật lịch làm việc của nhân viên theo từng ngày cụ thể nhằm phản ánh đúng tình trạng làm việc thực tế mà không cần thay đổi toàn bộ lịch làm việc đ&atilde; thiết lập trước đó.


* Chức năng chỉ áp dụng đối với nhân viên đ&atilde; có lịch làm việc trên hệ thống và hỗ trợ điều chỉnh lịch làm việc trong phạm vi từng ngày riêng lẻ.

* **Lưu ý:** cần bật phân quyền "Cập nhật lịch làm việc 1 ngày" để có thể thực sử dụng chức năng này.
 
 
 
 **Hướng dẫn thao tác:** 
 


**1. Cập nhật lịch làm việc theo từng ngày.**
 

* 


Chọn nhân viên &rarr; click vào ngày làm việc muốn điều chỉnh &rarr; thực hiện thao tác phù hợp theo nhu cầu:
 

* 


Chọn &ldquo;Nhân viên nghỉ phép&rdquo;: nếu muốn chuyển ngày làm việc thành ngày nghỉ phép. 


* 


Chọn &ldquo;Chỉnh sửa&rdquo;: nếu muốn thay đổi ca làm việc. 

 

 
**** 
 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/cnllv!n(20260528160742).png)

---

## [463] Cập nhật lịch làm việc cho từng nhân viên

*   **Slug**: `cap-nhat-lich-lam-viec-cho-tung-nhan-vien`
*   **Nội dung nghiệp vụ chi tiết**:

* Chức năng này hỗ trợ cơ sở cập nhật lịch làm việc cho từng nhân viên bằng cách thiết lập ca làm việc theo các ngày trong tuần và xác định ngày bắt đầu áp dụng.
 


 


**Hướng dẫn thao tác:**
 

* 


Click chọn nhân viên cần cập nhật lịch &rarr; sau đó bấm &ldquo;Cập nhật&rdquo; để thực hiện các bước tiếp theo. 

 


** Lưu ý:** Người dùng có thể tìm kiếm nhân viên bằng cách search tên nhân viên và lọc theo chi nhánh, bộ phận.


 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/c%E1%BA%ADp%20nh%E1%BA%ADt%20llv%20t%E1%BB%ABng%20nh%C3%A2n%20vi%C3%AAn_2(20260528153016).png)



 


 


 **Lưu ý: **Trong trường hợp một ngày làm việc có nhiều ca tại các chi nhánh khác nhau, người dùng có thể nhấn vào biểu tượng &ldquo;+&rdquo; tại ngày tương ứng để bổ sung thêm ca làm việc cho chi nhánh khác.


 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/c%E1%BA%ADp%20nh%E1%BA%ADt%20llv%20t%E1%BB%ABng%20nh%C3%A2n%20vi%C3%AAn_5(20260528153023).png)

---

## [464] Cập nhật cho nhiều nhân viên có cùng lịch làm việc

*   **Slug**: `cap-nhat-cho-nhieu-nhan-vien-co-cung-lich-lam-viec`
*   **Nội dung nghiệp vụ chi tiết**:

* Chức năng này hỗ trợ cơ sở cập nhật lịch làm việc cho nhiều nhân viên có cùng lịch bằng cách chọn danh sách nhân viên, thiết lập lịch làm việc chung và xác định ngày bắt đầu áp dụng.

* Sau khi cập nhật, hệ thống sẽ tự động áp dụng lịch làm việc cho toàn bộ nhân viên đ&atilde; chọn kể từ ngày bắt đầu và duy trì cho đến khi có thay đổi mới.
 


 


**Hướng dẫn thao tác:**
 

* 


Click chọn &ldquo;Cập nhật nhanh&rdquo; để tiến hành cập nhật lịch làm việc. 

 


 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/c%E1%BA%ADp%20nh%E1%BA%ADt%20llv%20nhi%E1%BB%81u%20nh%C3%A2n%20vi%C3%AAn_2(20260528155332).png)



 


 


**Lưu ý:**
 

* 


Khi chọn &ldquo;Tất cả&rdquo;, ca làm việc và chi nhánh được thiết lập tại ô &ldquo;Tất cả&rdquo; sẽ được áp dụng đồng loạt cho các ngày trong tuần. Sau khi áp dụng, người dùng vẫn có thể chỉnh sửa lại từng ngày riêng lẻ theo nhu cầu.


* 


Trong trường hợp một ngày làm việc có nhiều ca thuộc các chi nhánh khác nhau, người dùng có thể nhấn vào biểu tượng &ldquo;+&rdquo; tại ngày tương ứng để thêm ca làm việc cho chi nhánh khác.

 


 
![Image](https://cdnvttimg.vttechsolution.com/ImageDocsys/_Library/c%E1%BA%ADp%20nh%E1%BA%ADt%20llv%20nhi%E1%BB%81u%20nh%C3%A2n%20vi%C3%AAn_5(20260528155339).png)

---

