---
title: "Buổi 2: Hiểu Web — Hoặc Giả Vờ Hiểu "
date: "2026-03-22"
description: "Đằng Sau Một Trang Web Là Gì — Spoiler: Không Ổn Lắm :)"
tags: ["Web Architecture", "System Design", "Backend Mems", "OWASP"]
---

> Web Development là nghệ thuật dán băng keo vào một cái ống nước đang rỉ, trong khi người dùng đang cố gắng lấy búa đập vỡ nó. 🛠️💥

Đây là bản nâng cấp "full HD không che", giải thích cặn kẽ từng ngóc ngách của hạ tầng Web kèm ví dụ thực tế. Đọc xong đảm bảo anh em nhìn cái thanh địa chỉ trình duyệt bằng một ánh mắt khác hoặc ko 🤡!

---

## 1. Sự Tiến Hóa Của Các Đời Web (Web Generations)
Web không tự nhiên sinh ra, nó tiến hóa để hút máu... à nhầm, để phục vụ người dùng tốt hơn:

* **Web 1.0 (Web Tĩnh):** Thời kỳ đồ đá. Web chỉ là các trang tài liệu. Người dùng chỉ có thể **đọc**. Giống như bạn ra phường đọc bảng tin, không được phép cầm bút viết bậy lên đó. (Thành phần: Chỉ có HTML thuần).
* **Web 2.0 (Web Ứng dụng - Web App):** Kỷ nguyên mạng xã hội. Bạn có thể **đọc và ghi**. Bạn tạo ra nội dung (đăng status, upload video), nhưng dữ liệu nằm trên Server của các "tư bản" (Facebook, Google).
* **Web 3.0 (Web + Blockchain):** Đỉnh cao của sự "phi tập trung" (Decentralized). Bạn **đọc, ghi và SỞ HỮU**. Dữ liệu không nằm ở một máy chủ trung tâm mà phân tán trên mạng lưới Blockchain. (Ví dụ: Các dApp, dùng ví Metamask để đăng nhập thay vì email/password).

---

## 2. Web App vs. Native OS App: Cuộc Chiến Đa Nền Tảng

Nhiều lúc anh em tự hỏi: "Tại sao phải tải App về máy trong khi lướt Web cũng được?" Đây là câu trả lời:

### 🥊 Kèo Đấu: Web App vs. Native OS App

| Tính năng | Web App (Chrome, Firefox,...) | Native OS App (Cài trực tiếp) |
| :--- | :--- | :--- |
| **Độ "Chảnh" (OS)** | **Yêu tất cả.** Windows, macOS, hay Kali Linux đều chơi tuốt, chỉ cần có trình duyệt. | **Phân biệt đối xử.** File `.exe` không chạy được trên iOS. App nào chỉ chạy trên OS đó. |
| **Sức mạnh & Tốc độ** | **Sống tầm gửi.** Chạy gián tiếp qua trình duyệt nên bị giới hạn hiệu năng (ăn RAM). | **Độc quyền phần cứng.** Gọi trực tiếp thư viện OS, húp trọn GPU/CPU. Load game 3D mượt như nhung. |
| **Giao diện (Layout)** | **Co giãn như kẹo cao su.** Phải dùng CSS (Responsive) để tính toán cho mọi loại màn hình. | **Thiết kế "đo ni đóng giày".** Tối ưu cứng cho thiết bị đó, không bao giờ lo "vỡ trận". |

---

## 3. Hạ Tầng & Cấu Trúc Đội Hình (Infrastructure)

Để chịu tải được lượng người dùng từ vài chục đến vài triệu, hạ tầng phải "tiến hóa" theo 4 cấp bậc:

1. **Client - Server (Mô hình thủy tổ):** Khách (Client) gửi yêu cầu (Request) -> Máy chủ (Server) trả lời (Response). Hết.
2. **One Server (Mô hình sinh viên nghèo):** 1 máy chủ vật lý gánh còng lưng TẤT CẢ (Web Server, Code Logic, Database). 
   * *Ví dụ:* Chạy đồ án trên localhost.
   * *Rủi ro:* Quá tải một phát là Database nghẽn cổ chai, sập toàn tập.
3. **Many Servers, 1 Database (Mô hình nhà giàu mới nổi):** Có nhiều Server để tiếp khách (tránh sập web), nhưng đằng sau chỉ có 1 cục Database duy nhất. Đỡ lag hơn, nhưng Database vẫn là điểm yếu (Single point of failure).
4. **Many Servers, Many Databases (Mô hình tài phiệt):** Đỉnh cao của System Design. Hàng trăm máy chủ, Database cũng được băm nhỏ ra (Sharding) hoặc nhân bản (Replication). Máy chủ ở Mỹ cháy thì máy ở Việt Nam tự động gánh.

---

## 4. Kiến Trúc Hệ Thống (Architecture)

### 🍔 Kiến trúc 3 Lớp (3-Tier Architecture)
Giống như một nhà hàng:
* **Presentation Layer (Frontend):** Bàn ăn, menu, tiếp tân. Nơi khách hàng nhìn thấy và click chuột.
* **Application Layer (Backend):** Nhà bếp. Nhận order, nấu nướng, tính toán hóa đơn.
* **Data Layer (Database):** Kho nguyên liệu. Nơi lưu trữ thịt, cá, rau củ (Dữ liệu người dùng).

### 🔪 Phân tách Kiến Trúc Backend
* **Microservices:** Thay vì xây 1 cái bếp khổng lồ (Monolithic), ta xây 10 cái bếp nhỏ. Bếp 1 chuyên luộc, bếp 2 chuyên nướng. Lỡ bếp nướng cháy, bếp luộc vẫn hoạt động bình thường! (Chia nhỏ các chức năng thành các dịch vụ độc lập).
* **Serverless:** Nghĩa là "không dùng server"... à thực ra là xài server của mấy ông lớn (Cloud). Cứ ném code lên đó, người dùng xài bao nhiêu giây thì trả tiền bấy nhiêu. Cực kỳ nhàn!

---

## 5. Frontend: Bộ Ba Sát Thủ Hào Nhoáng
Trình duyệt chỉ hiểu đúng 3 thứ này:
* **HTML (Xương cốt):** Định nghĩa các thành phần. Thẻ `<head>` chứa tiêu đề (`title`), thẻ `<body>` chứa nội dung.
   * *Note:* **URL Encoding.** Trình duyệt bị "dị ứng" với khoảng trắng. Nếu bạn truyền chữ `Hello World` lên thanh địa chỉ, nó sẽ tự động bị băm thành `Hello%20World` để máy tính có thể đọc được.
* **CSS (Da thịt):** Tô màu, thêm hiệu ứng bo góc, đổ bóng.
* **Javascript / JS (Linh hồn):** Bắt sự kiện click chuột, cuộn chuột, tạo pop-up chửi thẳng vào mặt người dùng khi họ nhập sai password.

---

## 6. Backend: Nơi Những Lời Nói Dối Bắt Đầu
Để Backend chạy được, nó cần một "Stack" (tổ hợp các thành phần đi chung với nhau).

### 🖥️ Máy chủ cứng & Web Server
* **Backend Server (Máy chủ cứng):** Là cục sắt xài CPU bự, RAM to cắm trong trung tâm dữ liệu.
* **Web Server (Phần mềm):** Cài trên máy chủ cứng để xử lý các gói tin HTTP. Nhận Request vào, định tuyến đến đúng file code, và ném Response ra ngoài.
* **HTTP Status Codes (Thái độ của Web Server):**
   * **200 OK:** Giao dịch thành công, tiền trao cháo múc.
   * **300 Redirect:** Chuyển hướng. "Đường này đang thi công, vui lòng đi đường khác".
   * **400 Client Error:** Lỗi tại bạn. Cố tình gửi tham số tào lao lên Server.
   * **500 Server Error:** Lỗi tại Server. "Cứu tao, tao không kết nối được với Database!".

### 🗄️ Database (Cơ sở dữ liệu)
* **Relational (SQL):** Dữ liệu có cấu trúc cực kỳ nghiêm ngặt. Phải vẽ ERD rõ ràng, chia bảng (Table), dòng, cột. Có **Khóa chính (Primary Key)** để xác định danh tính từng dòng. Rất uy tín cho việc tính toán tiền bạc.
* **Non-Relational (NoSQL):** Freestyle, không cấu trúc. Thích nhét dữ liệu gì vào cũng được, lưu dưới dạng Document (JSON). Phù hợp cho các dự án linh hoạt, thay đổi liên tục.

---

## 7. API & Framework: Cầu Nối Của Những Kẻ Xa Lạ
**API** là cách để 2 phần mềm không quen biết gì nhau có thể trao đổi dữ liệu.
* **Query Parameter:** Gắn thẳng dữ liệu lên URL (Ví dụ: `facebook.com/search?q=gai+xinh`). Trực quan nhưng kém bảo mật.

### Cuộc chiến định dạng API:
* **SOAP:** Đời Tống. Dùng XML cực kỳ loằng ngoằng. Xử lý dữ liệu siêu lớn rất trâu bò và bảo mật cao (thường dùng ở các ngân hàng).
* **REST (RESTful API):** Tiêu chuẩn hiện đại, nhẹ nhàng, dùng định dạng JSON. Hoạt động trên 4 phép thuật cơ bản:
   * `GET`: Xin dữ liệu về xem.
   * `POST`: Gửi dữ liệu lên để tạo mới.
   * `PUT`: Gửi dữ liệu lên để đè/cập nhật.
   * `DELETE`: "Thiên thạch rơi", xóa sạch dữ liệu.

---

## 8. Bảo Mật Web (Góc Cảnh Giác) 🚨
Học Web mà không lo bảo mật thì coi như đang mở toang cửa nhà mời trộm vào:
* **OWASP (Open Web Application Security Project):** Một cuốn "Kinh thánh" tổng hợp 10 lỗ hổng Web trí mạng nhất (Top 10 OWASP). Đọc cái này để biết tại sao người ta có thể chèn vài dòng mã độc mà biến thành RCE (Remote Code Execution) nắm nguyên quyền điều khiển máy chủ của bạn.
* **CVSS (Common Vulnerability Scoring System):** Bảng điểm phong thần của các lỗ hổng (CVE). Thang điểm 10. Lỗ hổng nào bị đánh giá 9.0 - 10.0 (Critical) thì xác định là cả hệ thống IT đêm nay không cần ngủ.

> **CVSS\_Score = 10.0 x Impact x Exploitability**

-----

## 9\. Hành trình đi thỉnh kinh của một Request (DNS & Routing) 🐒

> "Internet là một bộ máy quan liêu, bạn muốn xin tải một file ảnh, bạn phải hỏi thăm đủ 7749 ông cán bộ."

Câu hỏi phỏng vấn kinh điển nhất mọi thời đại: **"Chuyện quái gì xảy ra khi bạn gõ một URL vào trình duyệt và nhấn Enter?"**

**Bước 1: Bệnh mất trí nhớ cục bộ.** Trình duyệt và hệ điều hành chỉ hiểu **địa chỉ IP** (kiểu `157.240.22.35`), chứ nó mù tịt mấy chữ như `google.com`. Thế là nó phải đi hỏi đường.
Đầu tiên nó lục lọi file `/etc/hosts` trong máy tính (anh em hay vọc vạch hệ điều hành như Linux chắc quá rành cái file này, chuyên dùng để trỏ IP bậy bạ). Nếu không có thì...

**Bước 2: Hệ thống DNS (Domain Name System) - Cuốn bạ 1080 của Internet.**

  * Máy tính của bạn sẽ chạy ra ngoài hỏi cục Router nhà mạng (ISP): "Anh ơi https://www.google.com/url?sa=E\&source=gmail\&q=google.com IP bao nhiêu?"
  * ISP không biết thì lên hỏi ông nội **Root DNS** (Trùm cuối Internet).
  * Root DNS chỉ tay xuống ông **TLD** (Top-Level Domain - quản lý các đuôi `.com`, `.net`).
  * Ông TLD mới chỉ đích danh cái máy chủ DNS của Google. "Ê, nhà thằng https://www.google.com/url?sa=E\&source=gmail\&q=google.com IP là gì?". Lúc này trình duyệt mới cầm được cục IP chạy về.

**Bước 3: Tìm đường cứu nước (Routing).** Có IP rồi, gói tin (Packet) của bạn sẽ bắt đầu chuyến phiêu lưu ở Lớp 3 (Network Layer). Nó sẽ nhảy qua nhảy lại giữa hàng chục cái Router khác nhau, bơi qua cáp quang biển, né hàm cá mập, rồi mới lết tới được Server đích.

**Bước 4: Bắt tay 3 bước (TCP Handshake).** Tới nơi rồi cũng không được xông vào luôn. Ở Lớp 4 (Transport Layer), TCP bắt buộc phải gõ cửa lịch sự:

  * **SYN:** "Anh Server ơi, anh rảnh không, em vào nhé?"
  * **SYN-ACK:** "Anh rảnh em ơi, vào đi."
  * **ACK:** "Ok em, mình bắt đầu truyền dữ liệu nha\!"

Sau 4 bước trầy da tróc vẩy trên, Request HTTP mới thực sự được gửi đi và giao diện web mới hiện ra cho bạn lướt\!

-----

## 10\. "Mày là ai?" - Câu chuyện về Authentication & Session 🕵️‍♂️

> "HTTP là một gã bảo vệ bị Alzheimer. Cứ 3 giây hắn lại quên bạn là ai."

Vấn đề chí mạng của giao thức HTTP là nó **Stateless (Không lưu trạng thái)**. Tức là mỗi lần bạn click qua một trang mới, Server lại nhìn bạn với ánh mắt xa lạ: "Ủa anh là ai, sao anh lại đòi vào trang quản trị mạng này?".

Để Server không bị "ngáo" và nhớ được người dùng đã đăng nhập, chúng ta có 2 bí kíp võ công:

**Cách 1: Session & Cookie (Vé gửi xe bằng giấy)**

  * Khi ông Login thành công, Server tạo ra một cái hộp lưu thông tin ở Backend (gọi là Session), đánh mã số là `ID: 69`.
  * Server ném cái số `69` này về cho trình duyệt, bảo: "Cất cái mã này vào **Cookie** cho tao".
  * Lần sau request bất cứ trang nào, trình duyệt sẽ tự động chìa cái Cookie `ID: 69` ra. Server lật sổ cái ra tra: "À, mã 69 là anh An, cho anh ấy vào\!".
  * **Rủi ro:** Server phải nhớ quá nhiều, hệ thống to là Database chứa Session phình to rất nhanh. Hơn nữa, nếu hacker chôm được cái Cookie này (lỗi Session Hijacking / XSS), nó cầm vé xe của ông vào xách luôn xe đi\!

**Cách 2: JWT - JSON Web Token (Hộ chiếu điện tử 4.0)**

  * Thay vì Server phải nhớ mọi thứ, khi login xong, Server sẽ tạo ra một cái mã Token dài ngoằng. Trên Token ghi rõ: "Ông An, quyền Admin", rồi Server đóng dấu mộc đỏ chót (Signature - Mã hóa) lên đó và đưa cho Client giữ.
  * Mỗi lần gọi API, trình duyệt kẹp cái Token này vào Header.
  * Server không cần tra sổ nữa\! Nó chỉ cần lấy thuật toán ra kiểm tra xem con dấu (Signature) kia có phải là hàng thật không. Hàng thật thì cho qua.
  * **Ưu điểm:** Nhanh, gọn, lẹ, cực kỳ phù hợp khi ông xây dựng kiến trúc Microservices hay làm hệ thống nhúng IoT (nơi mà mỗi request cần phản hồi siêu tốc độ mà không muốn phụ thuộc vào một Database trung tâm).

---

## Tới đây là hết cứu 🤡

*  Web thì dễ—cho đến khi chúng ta đụng vào.
* Học được một ít, phá được kha khá. 
* Chưa Tày, nhưng cũng đủ để làm mọi thứ… hỏng tạm thời 🤡
* Hẹn gặp lại ở blog tiếp theo.” 😈