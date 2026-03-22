---
title: "Buổi 1: Nền tảng Mạng - Nhập môn OSI & TCP/IP"
date: "2026-03-15"
description: "Take-note buổi học đầu tiên về mô hình OSI, TCP/IP, Socket và cách phân lô bán nền IP."
tags: ["Networking", "OSI", "TCP/IP",]
---

> "Muốn hack được hệ thống, trước tiên phải hiểu cách dữ liệu đi từ máy mình sang máy nạn nhân như thế nào."

Dưới đây là tổng hợp những kiến thức cốt lõi nhất từ buổi học mạng đầu tiên.

## 1. Mô hình OSI (7 Lớp)
Đây là mô hình lý thuyết kinh điển để hiểu cách mạng máy tính hoạt động:

1. **Lớp 1 - Physical (Vật lý):** Truyền tải dữ liệu ở dạng bit (0 và 1) qua môi trường truyền dẫn (cáp cáp quang, cáp đồng, sóng wifi). Giao thức tiêu biểu: Ethernet.
2. **Lớp 2 - Data Link (Liên kết dữ liệu):** Hoạt động dựa trên địa chỉ MAC (Media Access Control). Thiết bị tiêu biểu là Switch.
3. **Lớp 3 - Network (Mạng):** Chịu trách nhiệm định tuyến (Routing) đường đi cho gói tin thông qua địa chỉ IP (Public/Private). Thiết bị tiêu biểu: Router. Luồng đi cơ bản: `PC -> Router -> Router -> Laptop (Endpoint)`.
4. **Lớp 4 - Transport (Giao vận):** Đảm bảo truyền tải dữ liệu.
   * **TCP (Transmission Control Protocol):** Đảm bảo uy tín, bắt tay 3 bước (3-way handshake) trước khi truyền, giống như gửi thư bảo đảm.
   * **UDP (User Datagram Protocol):** Không cần xin phép, truyền cực nhanh nhưng dễ rớt gói (packet lost), dùng cho livestream, game.
   * **MTCP:** Kết hợp đặc tính của cả TCP và UDP.
5. **Lớp 5 - Session (Phiên):** Thiết lập, duy trì và đóng các phiên giao tiếp giữa các ứng dụng.
6. **Lớp 6 - Presentation (Trình diễn):** Chịu trách nhiệm mã hóa (Encode/Encrypt) và giải mã (Decrypt với Key) dữ liệu, nén dữ liệu.
7. **Lớp 7 - Application (Ứng dụng):** Cung cấp các dịch vụ mạng cho người dùng cuối (HTTP, FTP, SSH...).

---

### 🛡️ Góc tấn công & Cơ chế ở Lớp 2/3
* **Đóng gói Frame:** Dữ liệu khi đi xuống lớp 2 sẽ được đóng thành Frame với cấu trúc cơ bản: `[MAC Sender/Receiver | IP Sender/Receiver | Data]`.
* **Giao thức ARP:** Dùng để ánh xạ (tìm kiếm) địa chỉ MAC khi chỉ biết địa chỉ IP đích.
* **MAC Flooding:** Kỹ thuật tấn công gửi hàng loạt địa chỉ MAC giả mạo để làm tràn bộ nhớ của Switch, ép Switch biến thành một Hub (gửi dữ liệu ra tất cả các cổng), từ đó Hacker có thể sniff được gói tin.

---

## 2. Mô hình TCP/IP & Socket
Thực tế, thế giới dùng mô hình TCP/IP (nhỏ gọn hơn OSI):
* Lớp 4: Application *(Gộp Lớp 5, 6, 7 của OSI)*
* Lớp 3: Transport *(Tương đương Lớp 4 OSI)*
* Lớp 2: Internet *(Tương đương Lớp 3 OSI)*
* Lớp 1: Network Access *(Gộp Lớp 1, 2 của OSI)*

**Phiên bản IP:**
* **IPv4:** Dài 32-bit (Cung cấp khoảng 2^32 địa chỉ).
* **IPv6:** Dài 128-bit (Cung cấp khoảng 2^128 địa chỉ - cực kỳ khổng lồ).

**Socket là gì?**
Socket chính là sự kết hợp giữa **IP + Port** (Ví dụ: `192.168.1.5:80`). Nó định danh chính xác một tiến trình (ứng dụng) đang chạy trên một máy tính cụ thể.

---

## 3. Các dải IP Private (Mạng nội bộ)
Đây là các dải IP được quy định không bao giờ định tuyến ra môi trường Internet public:
* **Lớp A:** `10.0.0.0/8` (Dùng 8 bit cho Network, còn lại 24 bit cho Host).
* **Lớp B:** `172.16.0.0/12`
* **Lớp C:** `192.168.0.0/16`

---

## 4. Ba loại địa chỉ trong một mạng (Subnet)
Lấy ví dụ với dải mạng `/24` (như `192.168.1.0/24`):

### 1. Network IP (Địa chỉ mạng)
* Là địa chỉ **đầu tiên** của dải mạng. 
* Dùng để định danh cả một phân đoạn mạng, không thể gán cho bất kỳ thiết bị nào.
* **Đặc điểm:** Tất cả các bit phần Host đều bằng `0`.
* **Ví dụ:** `192.168.1.0`

### 2. Host IP (Địa chỉ thiết bị)
* Là các địa chỉ nằm giữa địa chỉ Mạng và địa chỉ Broadcast. Dùng để cấp cho PC, điện thoại, máy in, camera...
* **Quy tắc:** Trong dải `/24`, có 8 bit dành cho host. Số địa chỉ sử dụng được tính bằng công thức: 256 - 2 = 254 địa chỉ.
* **Ví dụ:** Từ `192.168.1.1` đến `192.168.1.254`.

### 3. Broadcast IP (Địa chỉ quảng bá)
* Là địa chỉ **cuối cùng** của dải mạng. Khi gửi gói tin vào địa chỉ này, mọi thiết bị trong mạng LAN đều sẽ nhận được.
* **Đặc điểm:** Tất cả các bit phần Host đều bằng `1`.
* **Ứng dụng:** Dùng trong DHCP (cấp IP tự động), tìm kiếm thiết bị LAN (như dò tìm máy in), hoặc giao thức ARP.
* **Ví dụ:** `192.168.1.255`