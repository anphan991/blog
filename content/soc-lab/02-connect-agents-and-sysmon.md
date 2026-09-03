# Phần 2: Connect Agents & Sysmon Configuration

Sau khi hoàn tất cấu hình Wazuh Server ở Phần 1, bước tiếp theo là provision các máy ảo endpoint và cài đặt Wazuh Agent để thu thập log.

## 1. Provisioning Endpoint VMs

Để thiết lập môi trường giả lập, chúng ta cần tạo thêm hai máy ảo trên VMware Workstation.

### 1.1 Ubuntu Server (Agent / Attacker)
- **Memory:** 4GB
- **Disk Capacity:** 30GB
- **OS:** Ubuntu Server 24.04 (Cài đặt OpenSSH server tương tự Part 1)
- **IP Address:** `192.168.203.139`

### 1.2 Windows 10 (Target Endpoint)
- **Memory:** 4GB
- **Disk Capacity:** 60GB
- **OS Edition:** Ưu tiên sử dụng bản **Windows 10 Pro**, **Enterprise**, **Education** hoặc **Pro for Workstations**. Tuyệt đối không dùng bản Home vì phiên bản này không hỗ trợ tính năng Remote Desktop (RDP).
- **Authentication:** Máy ảo Windows bắt buộc phải setup mật khẩu cho user account để có thể sử dụng RDP.

---

## 2. Windows Endpoint Configuration & RDP

Để thuận tiện cho việc thao tác mượt mà hơn chúng ta sẽ thiết lập kết nối Remote Desktop từ máy vật lý (Host Machine) vào máy ảo Windows.

### 2.1 Enable Remote Desktop
Trên máy ảo Windows 10, truy cập **Settings** -> **System** -> **Remote Desktop** và bật trạng thái sang **On**.

![Enable Remote Desktop](/soc-lab/02/02-enable-rdp.png)

### 2.2 Get IP Address
Mở Command Prompt (`cmd`) trên máy ảo và chạy lệnh sau để lấy địa chỉ IPv4:
```cmd
ipconfig
```
> Trong môi trường lab này, IP cấp cho máy Windows là `192.168.203.140`.

![Check IP Config](/soc-lab/02/02-ipconfig.png)

### 2.3 Connect via RDP
Từ máy Host (máy thật), mở ứng dụng **Remote Desktop Connection** (mstsc):
1. Nhập IP vừa lấy: `192.168.203.140`.
2. Bấm **Connect**.
3. Cung cấp User name (VD: `PC`) và Password của máy ảo Windows để xác thực đăng nhập.

![Connect RDP](/soc-lab/02/02-rdp-connect.png)

---

## 3. Deploy Wazuh Agent (Windows)

> **💡 Tại sao cần Wazuh Agent?**
> Wazuh Agent là một phần mềm (daemon/service) nhỏ gọn được cài đặt trực tiếp trên các máy trạm (endpoint) hoặc server cần giám sát. Chức năng chính của nó là theo dõi các hoạt động nội bộ của máy (đọc file log cục bộ, giám sát tính toàn vẹn của file - FIM, kiểm kê phần cứng/phần mềm) và forward các telemetry này về Wazuh Manager một cách an toàn, theo thời gian thực. Nếu không có Agent, Server sẽ hoàn toàn "bị mù" và không thể phát hiện các mối đe dọa đang diễn ra bên trong thiết bị.

Sau khi RDP thành công vào máy ảo Windows, tiến hành cài đặt Wazuh Agent để endpoint có thể giao tiếp với Manager.

### 3.1 Generate Installation Command
Truy cập vào Wazuh Dashboard trên trình duyệt web, điều hướng đến **Agents** -> **Deploy new agent** và thiết lập các thông số:

- **OS:** Windows (MSI 32/64 bits)
- **Server address:** Nhập IP của Wazuh Server (`192.168.203.136`).
- **Assign an agent name:** Đặt tên định danh cho endpoint (VD: `anphan-Windows`).

Wazuh WUI sẽ tự động generate một đoạn mã PowerShell dùng để tải xuống và cài đặt agent một cách silent (không hiện giao diện đồ họa).

![Deploy New Agent](/soc-lab/02/02-deploy-agent-dashboard.png)

### 3.2 Execute Installation
Quay trở lại phiên RDP của máy ảo Windows 10, mở ứng dụng **PowerShell** bằng quyền **Administrator** (Run as Administrator) và thực thi đoạn lệnh vừa copy:

```powershell
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.14.7-1.msi -OutFile $env:tmp\wazuh-agent; msiexec.exe /i $env:tmp\wazuh-agent /q WAZUH_MANAGER='192.168.203.136' WAZUH_AGENT_NAME='anphan-Windows'
```

Chờ khoảng vài chục giây để quá trình cài đặt nền hoàn tất. Sau đó khởi động service của agent bằng lệnh:
```cmd
NET START Wazuh
```
![Start Wazuh Service](/soc-lab/02/02-start-agent.png)

### 3.3 Verification
Trở lại giao diện Wazuh Dashboard, điều hướng về mục **Endpoints** (hoặc Agents) để kiểm tra danh sách agent đã enroll. Tại đây, agent `anphan-Windows` sẽ hiện trạng thái Active. 

![Agents List](/soc-lab/02/02-agent-list.png)

Bấm vào tên agent hoặc mục **View agent details** của thiết bị để inspect các thông số cấu hình phần cứng (System inventory), OS version, và các dashboard thống kê chi tiết như Security Configuration Assessment, Vulnerability Detection, v.v.

![Agent Details](/soc-lab/02/02-agent-details.png)

---

## 4. Deploy Wazuh Agent (Linux)

Tương tự như Windows, chúng ta tiếp tục cài đặt agent cho máy ảo Ubuntu (`192.168.203.139`) để mở rộng phạm vi giám sát.

### 4.1 Generate Installation Command
Trên Wazuh Dashboard -> **Deploy new agent**, thiết lập:
- **OS:** Linux (DEB amd64)
- **Server address:** `192.168.203.136`
- **Agent name:** `anphan-Linux`

![Deploy Linux Agent](/soc-lab/02/02-deploy-linux-agent.png)

### 4.2 Execute Installation
SSH vào máy ảo Ubuntu và chạy đoạn lệnh vừa copy:
```bash
wget https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.14.7-1_amd64.deb && sudo WAZUH_MANAGER='192.168.203.136' WAZUH_AGENT_NAME='anphan-Linux' dpkg -i ./wazuh-agent_4.14.7-1_amd64.deb
```
Tiến hành enable và start service (Các lệnh systemctl có thể sẽ tự chạy ngầm khi install deb, nhưng chạy lại để đảm bảo):
```bash
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```
![Install Linux Agent](/soc-lab/02/02-install-linux.png)

### 4.3 Verification
Truy cập **Discover**, chuyển sang index `wazuh-archives-*`. Tại cột Available fields, bạn thử filter theo field `agent.name` để confirm log từ thiết bị `anphan-Linux` đã bắt đầu đổ về.
![Verify Linux Logs](/soc-lab/02/02-verify-linux-logs.png)

---

## 5. Install & Configure Sysmon (Windows)

> **💡 Tại sao cần Sysmon khi đã có Wazuh Agent?**
> Wazuh Agent đóng vai trò là "người vận chuyển" log, nhưng bản thân Event Viewer mặc định của Windows không ghi nhận đủ độ sâu chi tiết để phục vụ điều tra bảo mật. Ví dụ: Windows mặc định không log lại đầy đủ các parameters của command-line, hash của file thực thi, hay các truy vấn DNS.
> 
> Để khắc phục điều đó, chúng ta cài đặt **Sysmon** (System Monitor) - một công cụ thuộc bộ Sysinternals của Microsoft. Sysmon chạy ngầm dưới dạng background service/device driver và đóng vai trò như "người khai thác". Nó sinh ra những telemetry cực kỳ chi tiết về process creation, network connections, file changes, registry modifications. Đây chính là "mỏ vàng" dữ liệu cho các SOC Analyst và Threat Hunters, và Wazuh Agent sẽ làm nhiệm vụ đóng gói mỏ vàng này gửi về trung tâm.

### 5.1 Download Sysmon & Configuration File
Thao tác bên trong RDP session của máy ảo Windows:
1. Tải **Sysmon** từ trang chủ Microsoft Sysinternals (Tìm kiếm Google: `sysmon`).
   ![Search Sysmon](/soc-lab/02/02-search-sysmon.png)
   ![Download Sysmon](/soc-lab/02/02-download-sysmon.png)
2. Tải file cấu hình chuẩn **sysmonconfig.xml** từ repo GitHub của Olaf Hartong (`https://github.com/olafhartong/sysmon-modular`). File này định nghĩa sẵn các rule lọc nhiễu cực kỳ hiệu quả cho Sysmon.
   ![Olaf Sysmon Config](/soc-lab/02/02-olaf-github.png)
3. Giải nén Sysmon và copy file `sysmonconfig.xml` vào chung thư mục vừa giải nén (VD: `C:\Users\PC\Desktop\Sysmon`).
   ![Sysmon Folder](/soc-lab/02/02-sysmon-folder.png)

### 5.2 Install Sysmon
Mở **PowerShell (Administrator)**, di chuyển tới thư mục chứa file và tiến hành cài đặt:
```powershell
cd C:\Users\PC\Desktop\Sysmon
.\Sysmon.exe -i .\sysmonconfig.xml
```
*(Lưu ý: Bấm Agree nếu có bảng EULA hiện lên).*

![Install Sysmon](/soc-lab/02/02-sysmon-install.png)

Sau khi tiến trình kết thúc, bạn có thể mở **Services** (`services.msc`) để check xem service `Sysmon` đã running hay chưa.

![Sysmon Service](/soc-lab/02/02-sysmon-service.png)

---

## 6. Forward Sysmon Logs to Wazuh (Windows)

Mặc dù Sysmon đã ghi log vào Event Viewer của Windows, nhưng Wazuh Agent hiện tại chưa biết cách lấy log này để gửi về Server. Ta cần cấu hình lại agent.

### 6.1 Understanding `ossec.conf`
Mở **Notepad** với quyền Administrator (File -> Open -> This PC -> `C:\Program Files (x86)\ossec-agent\ossec.conf`). *Lưu ý: Đổi bộ lọc góc dưới cùng bên phải thành "All files (*.*)" để thấy được file ossec.conf.*

![Open ossec.conf](/soc-lab/02/02-notepad-open.png)

Bên trong file, block `<client>` có tác dụng quy định địa chỉ và port của Wazuh Manager mà agent sẽ gửi log tới:
```xml
  <client>
    <server>
      <address>192.168.203.136</address>
      <port>1514</port>
      <protocol>tcp</protocol>
    </server>
  </client>
```
![ossec.conf Client Block](/soc-lab/02/02-ossec-client.png)

Tiếp theo là các block `<localfile>`. Đây là nơi agent khai báo các Windows Event Channel cần thu thập log. Ví dụ, block dưới đây thu thập log Security và dùng `<query>` để loại bỏ (filter out) một số EventID gây nhiễu:
```xml
  <localfile>
    <location>Security</location>
    <log_format>eventchannel</log_format>
    <query>Event/System[EventID != 5145 and EventID != ...]</query>
  </localfile>
```

### 6.2 Add Sysmon Channel
Để biết tên chính xác của channel Sysmon, bạn có thể mở **Event Viewer** -> **Applications and Services Logs** -> **Microsoft** -> **Windows** -> **Sysmon** -> **Operational**, 

![Event Viewer Sysmon](/soc-lab/02/02-event-viewer.png)

chuột phải chọn **Properties** và copy giá trị ở ô **Full Name** (`Microsoft-Windows-Sysmon/Operational`).

![Sysmon Log Properties](/soc-lab/02/02-sysmon-properties.png)

Thêm block sau vào file `ossec.conf` (ngay dưới các block localfile khác):
```xml
  <localfile>
    <location>Microsoft-Windows-Sysmon/Operational</location>
    <log_format>eventchannel</log_format>
  </localfile>
```
![Add Sysmon to ossec.conf](/soc-lab/02/02-ossec-add-sysmon.png)

Lưu file lại. Mở **Services**, tìm service `Wazuh` và chọn **Restart** (Hoặc dùng lệnh `NET STOP Wazuh` và `NET START Wazuh`).

![Restart Wazuh Service](/soc-lab/02/02-wazuh-service-restart.png)

### 6.3 Verify Sysmon Logs
Quay lại Wazuh Dashboard -> **Discover** (đang chọn index `wazuh-archives-*`). Filter data theo field `data.win.system.channel`. 
Nếu bạn thấy value **Microsoft-Windows-Sysmon/Operational** xuất hiện (hoặc search text `sysmon`), hệ thống đã bắt đầu ingest thành công telemetry chi tiết từ Sysmon.

![Verify Sysmon in Wazuh](/soc-lab/02/02-sysmon-verify-wazuh.png)

---

## 7. Install & Configure Sysmon (Linux)

Để đồng bộ khả năng giám sát chuyên sâu (process, network, file creation...) cho cả hai môi trường, chúng ta sẽ cài đặt thêm **Sysmon for Linux** trên máy ảo Ubuntu.

### 7.1 Install Sysmon for Linux
Quay lại phiên SSH của máy Ubuntu, thực hiện tải repo package của Microsoft và cài đặt Sysmon:
```bash
wget -q https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

sudo apt-get update
sudo apt-get install sysmonforlinux
```
![Install Sysmon Linux](/soc-lab/02/02-sysmon-linux-install.png)

### 7.2 Download Configuration & Start Sysmon
Tương tự Windows, Sysmon trên Linux cũng cần một file cấu hình lọc nhiễu. Tải file `collect-all.xml` từ repo MSTIC-Sysmon của Microsoft:
```bash
wget https://raw.githubusercontent.com/microsoft/MSTIC-Sysmon/refs/heads/main/linux/configs/collect-all.xml
```
Khởi chạy Sysmon với file cấu hình vừa tải:
```bash
sudo sysmon -i collect-all.xml
```

### 7.3 Verify Sysmon Logs (Linux)
Sysmon trên Linux mặc định ghi log thẳng vào file `/var/log/syslog`. Tin vui là Wazuh Agent (đã cài ở bước 4) theo cấu hình mặc định luôn tự động đọc file `syslog` này, do đó chúng ta **không cần** phải cấu hình thêm `ossec.conf` như trên Windows.

Để kiểm tra Sysmon đã hoạt động và ghi log thành công hay chưa, hãy đọc những dòng cuối của file syslog:
```bash
cd /var/log
tail syslog
```
Nếu bạn nhìn thấy tag `<Provider Name="Linux-Sysmon"` trong output XML, quá trình cài đặt đã hoàn tất! Wazuh Agent sẽ tự động parse và đẩy các telemetry này về Manager.

![Verify Sysmon Linux](/soc-lab/02/02-sysmon-linux-verify.png)
