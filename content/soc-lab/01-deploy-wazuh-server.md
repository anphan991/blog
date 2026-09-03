# Phần 1: Triển khai Wazuh server

Tài liệu này ghi chép lại các bước setup ban đầu cho Wazuh server, thành phần core trong môi trường home SOC lab này. Server được host local thông qua VMware Workstation.

## 1. Virtual machine provisioning

Một máy ảo mới được khởi tạo với các thông số phần cứng dưới đây, nhằm đảm bảo hiệu năng ổn định cho việc ingest và phân tích log:

- **Hostname:** `Wazuh-Server`
- **Vị trí lưu trữ:** `D:\Wazuh`
- **Hệ điều hành:** Ubuntu 64-bit
- **CPU:** 2 cores
- **RAM:** 8 GB (8192 MB)
- **Storage:** 100 GB (SCSI, split)
- **Network adapter:** NAT (để cho phép kết nối SSH từ máy host)

![VM Hardware Configuration](/soc-lab/01/01-vm-hardware.png)

---

## 2. Cài đặt hệ điều hành (Ubuntu Server)

Máy ảo được cài đặt Ubuntu Server. Cấu hình profile cơ bản bao gồm:

- **Tên người dùng:** `anphan`
- **Server name:** `wazuh`
- **Gói bổ sung:** `OpenSSH Server` được tick chọn trong quá trình cài đặt nhằm hỗ trợ truy cập terminal từ xa.

![Ubuntu Profile Setup](/soc-lab/01/01-ubuntu-profile.png)

Sau khi trình cài đặt thông báo hoàn tất, hệ thống được reboot một cách an toàn.

![Installation Complete](/soc-lab/01/01-ubuntu-complete.png)

---

## 3. Network configuration và remote access

Sau lần boot đầu tiên, địa chỉ IP được cấp phát sẽ được check thông qua console.
- **IPv4:** `192.168.203.136`

Để tối ưu workflow, các bước config tiếp theo được thực hiện qua SSH từ terminal của máy host:

```bash
ssh anphan@192.168.203.136
```

![SSH Login Terminal](/soc-lab/01/01-ssh-login.png)

---

## 4. Cài đặt Wazuh

Sau khi thiết lập kết nối từ xa, môi trường Wazuh được deploy thông qua quick-start script chính thức:

```bash
curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh && sudo bash ./wazuh-install.sh -a
```

---

## 5. Post-installation và giao diện web

Sau khi script chạy xong, credential mặc định được cung cấp dưới dạng một file nén. Việc giải nén được thực hiện để extract mật khẩu:

```bash
sudo tar -xf wazuh-install-files.tar
sudo su -
cd /home/anphan/wazuh-install-files
cat wazuh-passwords.txt
```

![Wazuh Password Extraction](/soc-lab/01/01-extract-password.png)

Tiếp theo, giao diện web của Wazuh (WUI) được truy cập qua trình duyệt tại địa chỉ `https://192.168.203.136`. 

> **Lưu ý:** Cảnh báo "Not secure" xuất hiện ở bước này là điều bình thường, do Wazuh sử dụng chứng chỉ SSL self-signed trong quá trình cài đặt. Có thể bỏ qua cảnh báo này một cách an toàn trong môi trường lab.

![Wazuh Login Screen](/soc-lab/01/01-wazuh-login.png)

Sau khi xác thực bằng tài khoản `admin` và mật khẩu vừa extract, dashboard đã khởi tạo thành công. Bảng tóm tắt agents hiện hiển thị số 0, đây là trạng thái dự kiến trước khi deploy agent lên các endpoint.

![Wazuh Dashboard Overview](/soc-lab/01/01-wazuh-dashboard.png)

---

## 6. System Configuration & Log Archiving

Mục đích của phase này là cấu hình Wazuh để thu thập và lưu trữ toàn bộ raw log. Mặc định, Wazuh chỉ lưu và hiển thị những log vi phạm rule (tạo ra alert). Tuy nhiên, đối với một SOC Lab chuẩn chỉnh, việc lưu trữ toàn bộ event là bắt buộc để phục vụ cho công tác Threat Hunting và điều tra truy vết Forensics sau này.

### 6.1 Config Wazuh Manager
Truy cập quyền root và edit file cấu hình chính của Wazuh Manager:
```bash
sudo su -
nano /var/ossec/etc/ossec.conf
```
Tìm section `<global>` và update 2 giá trị sau thành `yes`:
```xml
<logall>yes</logall>
<logall_json>yes</logall_json>
```
**Tác dụng:** Ép Wazuh manager ghi lại toàn bộ sự kiện nhận được từ agent vào file `archives.log` và `archives.json` trên local disk, bất kể sự kiện đó có trigger alert hay không.

![Wazuh ossec.conf Configuration](/soc-lab/01/01-ossec-conf.png)

> **Lưu ý quan trọng:** Mỗi khi modify file `ossec.conf`, bắt buộc phải restart service của manager để apply cấu hình mới:
```bash
systemctl restart wazuh-manager.service
```

### 6.2 Config Filebeat
Dù manager đã lưu raw log ở bước trên, Filebeat mới là thành phần chịu trách nhiệm đẩy log sang Wazuh Indexer. Do đó, cần bật module archives trên Filebeat:
```bash
nano /etc/filebeat/filebeat.yml
```
Tìm block `filebeat.modules` và đổi `enabled: false` thành `true` tại mục `archives`:
```yaml
filebeat.modules:
  - module: wazuh
    alerts:
      enabled: true
    archives:
      enabled: true
```
**Tác dụng:** Cho phép Filebeat đọc các file archive vừa được tạo ra ở bước 6.1 và forward toàn bộ dữ liệu này sang Indexer để user có thể search và visualize trên giao diện WUI.

![Filebeat Configuration](/soc-lab/01/01-filebeat-yml.png)

Restart service Filebeat:
```bash
systemctl restart filebeat.service
```

### 6.3 Create Index Pattern
Trên giao diện WUI, điều hướng đến **Dashboards Management** -> **Index patterns** để create index pattern cho kho lưu trữ log (thường là `wazuh-archives-*`).
![Dashboards Management](/soc-lab/01/01-index-pattern.png)

Sau khi thiết lập thành công, dữ liệu thô sẽ bắt đầu được ingest. Có thể verify luồng log tại tab **Discover**.
![Wazuh Discover Logs](/soc-lab/01/01-discover-logs.png)

---

## 7. VM Snapshot

Bước chốt sổ của quá trình setup hạ tầng là take snapshot máy ảo Wazuh-Server trên VMware. Thao tác này tạo ra một restore point an toàn (clean state), cho phép dễ dàng rollback server về trạng thái hoàn hảo ban đầu nếu xảy ra lỗi trong các phase cấu hình tiếp theo.
