# Phần 4: Build a Dashboard 

Trong phần này, chúng ta sẽ thiết lập dashboard trên Wazuh nhằm trực quan hóa dữ liệu telemetry, hỗ trợ quá trình theo dõi và phản ứng trước các sự kiện an ninh. Việc tổ chức dashboard một cách có hệ thống sẽ tối ưu hóa khả năng nhận diện các chiến dịch tấn công, bắt đầu từ các kỹ thuật dò quét thông tin xác thực cho đến các hành vi thao túng tài khoản.

## 1. Giám sát Failed Logon

Giám sát các nỗ lực đăng nhập thất bại là phương pháp cơ bản để phát hiện sớm các chiến dịch tấn công brute-force hoặc password spraying.

Truy cập **Explore** -> **Dashboards** -> **Create new dashboard** -> **Create new**.
Thiết lập biểu đồ dạng **Metric** với nguồn dữ liệu `wazuh-archive*`.

Trên môi trường Windows, sự kiện đăng nhập thất bại được hệ thống ghi nhận qua Event ID 4625. Tiến hành nhập truy vấn `data.win.system.eventID: 4625` vào thanh tìm kiếm.

Trong trường hợp hệ thống chưa có dữ liệu, bạn có thể thực hiện giả lập hành vi bằng cách truy cập vào máy ảo Windows 10 và nhập sai thông tin xác thực vài lần.

Quay trở lại giao diện tạo Metric, hệ thống sẽ cập nhật và hiển thị số lượng sự kiện tương ứng với truy vấn. Nhấn **Save**, lưu biểu đồ với tên `Failed Windows Logon` và thêm vào dashboard.

![Save Dashboard](/soc-lab/04/04-save-dashboard.png)

## 2. Giám sát thay đổi tài khoản (Account Management)

Sau khi có được quyền truy cập bước đầu, hành vi tiếp theo của kẻ tấn công thường là tạo tài khoản mới hoặc can thiệp vào các nhóm đặc quyền nhằm thiết lập cơ chế duy trì quyền truy cập.

Trước khi tiến hành tạo biểu đồ, cần đảm bảo cấu trúc dữ liệu được cập nhật. Truy cập **Discover** -> **Dashboard management** -> **Index patterns**, chọn `wazuh-archives-*` và nhấn **Refresh field list**. Nếu các trường dữ liệu không còn biểu tượng cảnh báo, quá trình đồng bộ đã hoàn tất.

Tại giao diện cấu hình dashboard, chọn **Visualization** dạng **Line** từ nguồn `wazuh-archive*`.

Sử dụng truy vấn sau để tổng hợp các sự kiện liên quan đến quản lý tài khoản:
```text
data.win.system.eventID: ("4720" OR "4722" OR "4723" OR "4724" OR "4725" OR "4726" OR "4732" OR "4738")
```

Tại mục **Data**, thiết lập trục thời gian:
- **Buckets** -> **Add** -> **X-axis**
- **Aggregation:** `Date Histogram`
Nhấn **Update** để áp dụng bộ lọc.

![Line Chart Config](/soc-lab/04/04-line-chart-config.png)

Tiến hành phân loại dữ liệu dựa trên Event ID nhằm chi tiết hóa các hành vi:
- Nhấn **Add** -> **Split series**
- **Sub aggregation:** `Terms`
- **Field:** `data.win.system.eventID`

Lưu biểu đồ và tích hợp vào dashboard. Biểu đồ này sẽ làm nổi bật các biến động liên quan đến vòng đời của tài khoản trên hệ thống.

## 3. Giám sát truy cập SSH trên môi trường Linux

Tương tự Windows, môi trường Linux yêu cầu cơ chế giám sát độc lập đối với các dịch vụ xác thực. Cấu hình bảng dữ liệu sau sẽ hỗ trợ phân tích chi tiết các nỗ lực truy cập SSH bất hợp lệ. Thực hiện nhập sai mật khẩu SSH vài lần để tạo dữ liệu giả lập nếu chưa có.

Tại giao diện dashboard, khởi tạo thành phần mới dạng **Data Table**.

Cấu hình bộ lọc theo định danh máy chủ:
- **Field:** `agent.name`
- **Operator:** `is`
- **Value:** `anphan-Linux` (thay thế bằng tên agent thực tế)

Tại mục **Buckets**, thiết lập các cột hiển thị (Split row) theo thứ tự ưu tiên phân tích:

1. **Phân loại theo máy chủ:**
   - **Aggregation:** `Terms`
   - **Field:** `agent.name`

2. **Phân loại theo thời gian:** (Nhấn Add -> Split row)
   - **Aggregation:** `Date Histogram`
   - **Field:** `timestamp`

3. **Tài khoản thực thi:** 
   - **Aggregation:** `Terms`
   - **Field:** `data.srcuser`

4. **Tài khoản mục tiêu:**
   - **Aggregation:** `Terms`
   - **Field:** `data.dstuser`
   - *Bật tính năng Show missing values để đảm bảo tính toàn vẹn của dữ liệu hiển thị.*

5. **Nguồn kết nối:**
   - **Aggregation:** `Terms`
   - **Field:** `data.srcip`

Lưu cấu hình và đặt tên phù hợp. Bảng dữ liệu này cung cấp thông tin ngữ cảnh đầy đủ về địa chỉ IP, thời gian và tài khoản đang bị nhắm mục tiêu.

![Failed SSH Data Table](/soc-lab/04/04-failed-ssh-datatable.png)

## 4. Các biểu đồ phân tích và đối chiếu khác

### 4.1. Windows Successful Logons by Type 
Mục đích: Xác định các phiên kết nối từ xa RDP hoặc qua mạng nội bộ.

- **Loại biểu đồ:** Pie Chart.
- **Truy vấn DQL:** `data.win.system.eventID: 4624` (Ghi nhận đăng nhập thành công).
- **Phân tách (Split Slices):** Lựa chọn Term `data.win.eventdata.logonType`.

 Biểu đồ thể hiện tỷ trọng của từng phương thức xác thực. Sự gia tăng đột biến của Logon Type 10 (RDP) hoặc Type 3 (Network) là chỉ báo quan trọng cảnh báo nguy cơ lateral movement trong mạng nội bộ.

![Successful Logons by Type](/soc-lab/04/04-windows-successful-logons.png)

### 4.2. Top Executed Commands / Process Creation
Mục đích: Giám sát các tệp lệnh và tiến trình được khởi tạo trên hệ thống, khai thác tối đa dữ liệu từ Sysmon.

- **Loại biểu đồ:** Data Table.
- **Truy vấn DQL:** `data.win.system.eventID: 1` (Sự kiện Process Creation từ Sysmon).
- **Trường hiển thị (Split Rows):** `agent.name`, `data.win.eventdata.user` và `data.win.eventdata.commandLine`.

 Bảng dữ liệu hỗ trợ phát hiện các tệp lệnh thực thi rủi ro cao (như `whoami`, `net user`, PowerShell scripts) hoặc dấu hiệu của payload độc hại.

![Top Executed Commands](/soc-lab/04/04-top-executed-commands.png)

### 4.3. Linux Successful SSH Logins
Mục đích: Đối chiếu với bảng dữ liệu Failed SSH nhằm xác định các trường hợp tấn công brute-force thành công.

- **Loại biểu đồ:** Data Table.
- **Truy vấn DQL:** `rule.description: "sshd: authentication success."` (hoặc sử dụng từ khóa *accepted*).
- **Trường hiển thị:** `timestamp`, `data.dstuser`, `data.srcip`.

Khi một địa chỉ IP xuất hiện đồng thời ở cả bản ghi đăng nhập thất bại và thành công, hệ thống đã bị thỏa hiệp.

![Linux Successful SSH](/soc-lab/04/04-linux-successful-ssh.png)

### 4.4. Cảnh báo leo thang đặc quyền: Privilege Escalation Events
Mục đích: Giám sát các hành vi thay đổi quyền hạn của tài khoản cục bộ.

- **Loại biểu đồ:** Metric hoặc Data Table.
- **Truy vấn DQL:** `data.win.system.eventID: 4732` (Sự kiện thêm thành viên vào local group).
- **Trường hiển thị:** `data.win.eventdata.subjectUserName` (Tài khoản thực hiện) và `data.win.eventdata.targetSid` (Định danh của tài khoản được cấp quyền).

Bất kỳ thao tác thêm tài khoản vào nhóm Administrators nào cũng mang rủi ro cao. Biểu đồ này phục vụ mục đích phát hiện ngay lập tức kỹ thuật leo thang đặc quyền.

![Privilege Escalation](/soc-lab/04/04-privilege-escalation.png)

### 4.5. Alerts by Severity Level
Mục đích: Tổng hợp tình trạng an ninh và phân loại các sự kiện dựa trên mức độ rủi ro.

- **Loại biểu đồ:** Bar Chart hoặc Pie Chart.
- **Truy vấn DQL:** Lọc theo mức độ ưu tiên `rule.level >= 5` hoặc để trống để hiển thị toàn bộ.
- **Phân tách (Buckets):** Lựa chọn Term `rule.level` hoặc `rule.description`.

Cung cấp góc nhìn tổng thể về số lượng và phân loại các cảnh báo mức độ cao, hỗ trợ người quản trị xác định nhanh xu hướng an ninh của toàn bộ hệ thống.

![Alerts by Severity](/soc-lab/04/04-alerts-by-severity.png)
