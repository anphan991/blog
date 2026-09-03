# Phần 3: Generate & Analyze Telemetry

Trong phần này, chúng ta sẽ thực hiện một số thao tác quản trị cơ bản trên máy ảo Windows để cố tình sinh ra dấu vết. Sau đó, chúng ta sẽ truy cập Wazuh Dashboard để phân tích các telemetry này, qua đó hiểu rõ hơn về cách Wazuh và Windows ghi nhận các sự kiện bảo mật.

## 1. Môi trường Thực hành
Đăng nhập vào máy ảo Windows 10 thông qua Remote Desktop (RDP).
Mở ứng dụng **Command Prompt** (cmd) với quyền **Administrator**.

Chạy các lệnh trinh sát cơ bản để kiểm tra thông tin định danh và network hiện tại của máy:
```cmd
whoami
ipconfig /all
```
![Whoami & IPConfig](/soc-lab/03/03-whoami-ipconfig.png)

Kiểm tra danh sách user hiện tại trên hệ thống và xem thành viên của nhóm Administrators:
```cmd
net user
net localgroup administrators
```
![Check Users](/soc-lab/03/03-check-users.png)

---

## 2. Thao tác Sinh Log 

Chúng ta sẽ thực hiện một chuỗi thao tác liên quan đến **Account Management**. Việc lén lút tạo user, cấp quyền admin hoặc kích hoạt user ẩn là những kỹ thuật cực kỳ phổ biến của kẻ tấn công khi muốn thiết lập Backdoor / Persistence duy trì quyền truy cập.

### 2.1 Kích hoạt tài khoản Guest
Mặc định, tài khoản Guest trên Windows luôn bị vô hiệu hóa. Bạn có thể kiểm chứng trực quan bằng cách mở **Computer Management** -> **Local Users and Groups** -> **Users** -> Nhấp chuột phải vào **Guest** chọn **Properties**.
![Guest Disabled 1](/soc-lab/03/03-guest-disabled-1.png)

Giao diện sẽ hiển thị ô checkbox "Account is disabled" đang được tích chọn.
![Guest Disabled 2](/soc-lab/03/03-guest-disabled-2.png)

Sử dụng lệnh sau trong cửa sổ CMD để ép kích hoạt lại tài khoản Guest và đặt mật khẩu mới cho nó:
```cmd
net user guest /active:yes
net user guest PCPASS
```

### 2.2 Tạo User mới và Cấp quyền Admin
Tiếp theo, hãy thử giả lập hành vi tạo một user ẩn danh tên là `test1` và cấp cho nó quyền cao nhất:
```cmd
net user test1 password /add
net localgroup administrators test1 /add
```
Kiểm tra lại xem `test1` đã vào danh sách Administrators thành công chưa:
```cmd
net localgroup administrators
```
![Enable & Create User](/soc-lab/03/03-create-user-cmd.png)

### 2.3 Xóa User để dọn dẹp dấu vết
Sau khi hoàn tất mục đích xấu, kẻ tấn công có thể xóa user `test1` đi để cố gắng phi tang dấu vết:
```cmd
net user test1 /delete
```

---

## 3. Phân tích Telemetry trên Wazuh 

Mọi thao tác quản trị bằng command-line ở trên đều đã bị Sysmon và hệ thống Windows Event Log ghi nhận. Hãy mở trình duyệt, đăng nhập vào Wazuh Dashboard để phân tích xem chúng ta thu được gì.

### 3.1 Truy tìm sự kiện "Xóa User" (Event ID 4726)
Truy cập Wazuh Dashboard -> Mở mục **Discover** (chọn index `wazuh-alerts-*` hoặc `wazuh-archives-*`).
Lọc theo agent của máy Windows, chỉnh bộ đếm thời gian về **Last 15 minutes** rồi nhấn Refresh.

Tìm kiếm log có field `data.win.system.eventID` là **4726**, đây là Event ID của Windows dành riêng cho sự kiện *A user account was deleted*.

![Event 4726 Search](/soc-lab/03/03-wazuh-event-4726-raw.png)

Mở rộng chi tiết log đọc trong field `data.win.system.message` hoặc `full_log`, bạn sẽ thu được thông tin cực kỳ giá trị:

![Event 4726 Details](/soc-lab/03/03-wazuh-event-4726-detail.png)
```text
A user account was deleted.

Subject:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1000
	Account Name:		PC
	Account Domain:		DESKTOP-R94B3SG
	Logon ID:		    0x4DE9A

Target Account:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1001
	Account Name:		test1
	Account Domain:		DESKTOP-R94B3SG

Additional Information:
	Privileges	-
```

> Khối log được chia làm 2 phần rõ rệt giúp ta hình dung được ngữ cảnh:
> - **Subject / Source (Kẻ chủ mưu):** Là người thực hiện hành động xóa. Ở đây ta thấy rõ `Account Name: PC` chính là thủ phạm đã gõ lệnh xóa.
> - **Target / Destination (Nạn nhân):** Là đối tượng chịu tác động. Ở đây chính là user `test1` vừa bị xóa.

### 3.2 Tìm hiểu về Security Identifier (SID) và cơ chế cấp phát RID
Trong khối log trên, bạn có để ý thấy đi kèm với tên Account luôn là một chuỗi ký tự khá dài có tiền tố `S-` gọi là **Security ID (SID)**. 

Trong Windows, SID là một định danh duy nhất dùng để nhận dạng user, group, hoặc máy tính. Nếu kẻ tấn công tinh vi đổi tên user `test1` thành một tên khác để ngụy trang, tên Account Name sẽ thay đổi, nhưng mã **SID của user đó sẽ vĩnh viễn giữ nguyên**. Do vậy, SOC Analyst thường track theo SID chứ không chỉ tin vào tên user.

![SID Architecture](/soc-lab/03/03-sid-architecture.png)

Cấu trúc chuẩn của một SID có định dạng: `S-R-X-Y1-Y2-Yn-1-Yn`
- **S**: Khẳng định chuỗi này là một SID.
- **R**: Revision level (Phiên bản cấu trúc, thường luôn là 1).
- **X**: Identifier authority (Giá trị thẩm quyền định danh, ví dụ số 5 là thuộc về NT Authority).
- **Y**: Đại diện cho một loạt các Subauthority. Dãy số rất dài ở giữa là mã độc nhất của domain/máy cục bộ. 
- Phần quan trọng nhất nằm ở chuỗi số cuối cùng gọi là **RID (Relative ID)**. 

**Cơ chế cấp phát RID (RID Allocation):**
Khi một tài khoản hoặc group mới được tạo, hệ thống Local Security Accounts Manager (SAM) sẽ cấp phát cho nó một giá trị RID duy nhất và đảm bảo không bao giờ tái sử dụng lại RID đó để tránh xung đột.
- Các tài khoản mặc định (built-in) luôn có số RID cố định, phổ biến nhất là:
  - `Administrator`: Có RID là **500** (SID đuôi `...-500`).
  - `Guest`: Có RID là **501** (SID đuôi `...-501`).
- Các tài khoản người dùng tự tạo mới sẽ bắt đầu từ RID **1000** trở lên.

Quay lại log xóa user ở phần 3.1:
- Kẻ chủ mưu `PC` có SID đuôi `...-1000`: Chứng tỏ đây là tài khoản người dùng được tạo đầu tiên khi cài đặt Windows.
- Nạn nhân `test1` có SID đuôi `...-1001`: Khẳng định đây là tài khoản thứ hai được sinh ra và vừa bị xóa sổ.

**Một số Well-known SIDs (SID mặc định của Windows thường hay gặp):**
| Universal SID | Tên gọi (Name) | Ý nghĩa (Identifies) |
| :--- | :--- | :--- |
| **S-1-0-0** | Null SID | Nhóm không có thành viên, thường dùng khi giá trị SID không xác định hoặc trống. |
| **S-1-1-0** | World | Nhóm chứa tất cả mọi người (Everyone). |
| **S-1-2-0** | Local | User đăng nhập trực tiếp (vật lý) tại hệ thống. |
| **S-1-2-1** | Console Logon | Nhóm user đang đăng nhập vào console vật lý. |
| **S-1-5** | NT Authority | SID đại diện cho quyền lực hệ thống NT. |
| **S-1-5-80-0**| All Services | Nhóm bao gồm tất cả các service process cấu hình trên máy. HĐH tự quản lý membership của nhóm này. |
| **S-1-3-0** | Creator Owner ID | Dùng trong Access Control (ACEs), được gán cho user trực tiếp tạo ra object (file/thư mục). |

*(Để tra cứu đầy đủ danh sách, có thể tham khảo thêm tại: [Microsoft Documentation - Understand SIDs](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers))*

### 3.3 Phân tích sự kiện "Tạo User" (Event ID 4720)
Giống như hành động xóa, việc tạo user `test1` cũng sinh ra một event log tương ứng. Để truy vết lại, bạn có thể tìm kiếm nhanh trên thanh Search của Wazuh bằng câu query: `data.win.system.eventID: 4720`.

![Event 4720 Search](/soc-lab/03/03-wazuh-event-4720.png)
![Event 4720 Search](/soc-lab/03/03-wazuh-event-4720-2.png)
![Event 4720 Search](/soc-lab/03/03-wazuh-event-4720-3.png)

Khi mở rộng field `data.win.system.message` của log này, ta có thể thấy một số **Attributes** cực kỳ thú vị được ghi nhận ở thời điểm tài khoản vừa khởi tạo:
```text
A user account was created.

Subject:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1000
	Account Name:		PC
	...

New Account:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1001
	Account Name:		test1
	...

Attributes:
	SAM Account Name:	test1
	...
	Primary Group ID:	513
	...
	Old UAC Value:		0x0
	New UAC Value:		0x15
	User Account Control:	
		Account Disabled
		'Password Not Required' - Enabled
		'Normal Account' - Enabled
```

> **💡 Giải mã các Attributes quan trọng:**
> - **Primary Group ID (513):** Đây là mã RID cho nhóm `Domain Users`. Đối với local account, ID 513 đơn giản mang ý nghĩa là nhóm `Users` mặc định.
> - **Old UAC Value (0x0):** Chữ UAC ở đây là viết tắt của *User Account Control* quy định các flag trạng thái của tài khoản trong database SAM, khác với UAC prompt của Windows. Vì đây là account mới hoàn toàn, giá trị cũ luôn luôn bằng `0x0`.
> - **New UAC Value (0x15):** Là mã Hex tổng hợp các flag trạng thái tài khoản. Cụ thể mã `0x15` chính là kết quả của việc Windows bật đồng thời các thuộc tính `Account Disabled`, `Password Not Required` và `Normal Account`. Tóm lại, khi ta gõ lệnh tạo user, Windows lúc sơ khởi ban đầu sẽ tạo nó dưới trạng thái disable và không yêu cầu pass. Các bước thiết lập sau đó mới enable nó lên hoàn chỉnh.

*(Tham khảo thêm chi tiết tại: [Microsoft Docs - Event 4720](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4720) & [MS-SAMR User Account Codes](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-samr/b10cfda1-f24f-441b-8f43-80cb93e786ec))*

### 3.4 Phân tích sự kiện "Thêm User vào Group" (Event ID 4732)
Khi bạn chạy lệnh `net localgroup administrators test1 /add`, Windows lập tức ghi nhận hành vi leo thang đặc quyền này thông qua **Event ID 4732** (*A member was added to a security-enabled local group*).

![Event 4732 - Add to Group](/soc-lab/03/03-wazuh-event-4732.png)

Mở chi tiết log, ta sẽ thấy một điểm cực kỳ thú vị của Windows:
```text
A member was added to a security-enabled local group.

Subject:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1000
	Account Name:		PC
	...

Member:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1001
	Account Name:		-

Group:
	Security ID:		S-1-5-32-544
	Group Name:		Administrators
	Group Domain:		Builtin
```
> **💡 Tầm quan trọng của SID:**
> Ở phần `Member`, bạn sẽ thấy `Account Name` lại hiển thị trống (`-`). Nếu một chỉ search theo tên user `test1`, họ chắc chắn sẽ bỏ lọt cảnh báo leo thang đặc quyền này! 
> Tuy nhiên, nhờ cấu trúc **SID**, ta thấy `Security ID` của Member kết thúc bằng `...-1001`. Chỉ cần đem chuỗi SID này vào thanh Search của Wazuh, hệ thống sẽ correlate toàn bộ các event lại với nhau và ta dễ dàng xác định ID `1001` chính là user `test1`.

![SID Correlation Search](/soc-lab/03/03-wazuh-event-sid-search.png)

### 3.5 Phân tích sự kiện "Đăng nhập" (Event ID 4624)
Sự kiện đăng nhập thành công (Event 4624) là một trong những log mang lại nhiều giá trị nhất. Mỗi khi có session mới được tạo ra, log 4624 sẽ ghi nhận:
```text
An account was successfully logged on.

Subject:
	Security ID:		S-1-5-18
	Account Name:		DESKTOP-R94B3SG$
	...
Logon Information:
	Logon Type:		2
	...
New Logon:
	Security ID:		S-1-5-21-1914195376-796412011-908869958-1000
	Account Name:		PC
	...
Network Information:
	Source Network Address:	127.0.0.1
```
Như đã giải thích trước đó, `Subject` (S-1-5-18 tức Local System) là người đứng ra yêu cầu mở phiên đăng nhập, còn `New Logon` (PC) mới là người dùng thực sự. 

Đặc biệt chú ý field **Logon Type (Loại đăng nhập)**. Dựa vào số ID này, ta biết chính xác đã đăng nhập vào bằng cách nào:
| Logon Type | Ý nghĩa (Description) |
| :---: | :--- |
| **2** | **Interactive:** Đăng nhập trực tiếp tại máy tính (gõ phím vật lý) hoặc qua console. |
| **3** | **Network:** Truy cập từ xa qua mạng (VD: Truy cập folder chia sẻ SMB, kết nối IPC). |
| **4** | **Batch:** Đăng nhập dưới dạng script chạy ngầm (VD: Scheduled Tasks). |
| **5** | **Service:** Đăng nhập của các Service startup. |
| **7** | **Unlock:** Mở khóa màn hình (Unlock screen saver). |
| **8** | **NetworkCleartext:** Đăng nhập gửi mật khẩu dạng clear-text (VD: IIS Basic Auth). |
| **9** | **NewCredentials:** Dùng thông tin đăng nhập khác cho kết nối mạng đi ra (VD: lệnh `RunAs` với switch /netonly). (Thường liên quan đến Event 4648). |
| **10** | **RemoteInteractive:** Đăng nhập từ xa có giao diện (RDP - Remote Desktop). |
| **11** | **CachedInteractive:** Đăng nhập bằng Cache khi không có kết nối mạng tới Domain Controller. |

*(Nguồn: [Ultimate Windows Security - Event 4624](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4624))*

---

## 4. Giám sát Telemetry trên Linux (Ubuntu)
Không chỉ riêng Windows, Wazuh Agent trên Linux cũng làm việc cực kỳ hiệu quả trong việc thu thập log xác thực và Command Audit.

Hãy thử thao tác vài lệnh cơ bản:
1. Mở PowerShell trên Windows, cố tình đăng nhập sai tài khoản SSH: `ssh fakeuser@192.168.203.139` (nhập sai pass vài lần).
![SSH Fakeuser](/soc-lab/03/03-ssh-fakeuser.png)
2. Đăng nhập thành công vào tài khoản thật: `ssh anphan@192.168.203.139`
3. Gõ lệnh kiểm tra IP: `ip a`
![SSH Success & Command](/soc-lab/03/03-ssh-anphan-ip.png)
4. Thoát phiên SSH: `exit`

Trở lại tab **Discover** của Wazuh, bạn có thể thực hiện các câu query DQL (Kibana Query) đơn giản để truy vết toàn bộ quá trình:
- **Truy vết đăng nhập thất bại (Brute-force / Enum):** Tìm `fakeuser`, Wazuh sẽ cảnh báo hành vi "Attempt to login using a non-existent user".
![Wazuh Fakeuser Log](/soc-lab/03/03-wazuh-fakeuser-log.png)
- **Truy vết đăng nhập hợp lệ:** Gõ `anphan AND accepted`.
![Wazuh Anphan Accepted](/soc-lab/03/03-wazuh-anphan-accepted.png)
- **Truy vết gõ lệnh:** Gõ `anphan AND "ip a"`. Bạn sẽ thấy log hệ thống được cung cấp bởi Sysmon for Linux bắt được chính xác lệnh bạn vừa gõ.
![Wazuh Anphan Command](/soc-lab/03/03-wazuh-anphan-ipa.png)
- **Truy vết toàn bộ phiên làm việc:** Gõ `anphan AND session`. Bạn sẽ theo dõi được toàn bộ vòng đời của phiên kết nối, từ lúc `session opened` cho tới khi `session closed` tương ứng với lúc gõ `exit`.
![Wazuh Anphan Session Opened](/soc-lab/03/03-wazuh-anphan-session-opened.png)
![Wazuh Anphan Session Closed](/soc-lab/03/03-wazuh-anphan-session-closed.png)

> *Mẹo: Tại một dòng log bất kỳ, bạn có thể bấm vào nút **View surrounding documents** để xem các sự kiện xảy ra ngay trước và sau đó, giúp dựng lại toàn bộ mốc thời gian hành động của user!*

---

## 5. Tóm tắt: Các Event ID quan trọng
Để thuận tiện dưới đây là bảng tóm tắt các Windows Event ID mang ý nghĩa quan trọng đã xuất hiện trong phần trên:

| Event ID | Phân loại (Category) | Mô tả (Description) | Điểm cần lưu ý |
| :---: | :--- | :--- | :--- |
| **4624** | Logon / Logoff | Đăng nhập thành công | Chú ý field **Logon Type** để biết user đăng nhập qua RDP, Network hay gõ phím trực tiếp. Phân biệt rõ **Subject** (tiến trình gọi log) và **New Logon** (người đăng nhập). |
| **4720** | Account Management | Tài khoản người dùng mới được tạo | Dấu hiệu kẻ tấn công tạo user ảo để Persistence. Soi kỹ các field **New UAC Value** và **Primary Group ID**. |
| **4726** | Account Management | Tài khoản người dùng bị xóa | Dấu hiệu Defense Evasion (phi tang). Có thể biết được chính xác **Subject** đã xóa tài khoản nào. |
| **4732** | Account Management | Thêm thành viên vào nhóm (Local Group) | Dấu hiệu Privilege Escalation đặc biệt khi add vào nhóm *Administrators*. Đôi khi tên user bị làm mờ, bắt buộc phải dùng **SID** để đối chiếu. |
