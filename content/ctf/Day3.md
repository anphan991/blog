---
title: "Buổi 3: Kiến Trúc Máy Tính & OS — Chào Mừng Đến Địa Ngục"
date: "2026-03-29"
description: "Hành trình đi từ những thanh ghi nhỏ bé của CPU đến đến cách kernel kiểm soát mọi thứ phía sau hậu trường. (')>"
tags: ["Computer Architecture", "OS", "Memory Management"]
---

> "Hệ điều hành giống như một gã bảo vệ giữ trẻ bị stress. Nó phải liên tục dỗ dành các phần mềm (Process), chia kẹo (CPU Scheduling) và đảm bảo chúng không oánh nhau giành đồ chơi (RAM)." 🍼🖥️

Chào mừng anh em xuống tầng hầm của thế giới máy tính. Hôm nay sẽ không còn giao diện Web giao diện bóng bẩy nữa, mà sẽ đi tháo tung cục CPU và xem Hệ điều hành (OS) đang giấu giếm chúng ta những bí mật gì.

---

## 1. Kiến Trúc Máy Tính: Giải Phẫu Trái Tim Của Hệ Thống

Trước khi gõ những dòng code "bay bổng", chúng ta phải hiểu được cái đống sắt vụn bên dưới đang làm việc quần quật như thế nào. Máy tính được xây dựng trên một triết lý bất diệt: **CPU tính toán, RAM chứa đồ, và Bus làm shipper chở hàng.**



Bây giờ, hãy cầm dao mổ lên và rạch bụng con CPU (Central Processing Unit) ra xem bên trong có gì. Nó không phải là một khối phép thuật, mà là một đại công xưởng chia làm 3 phân khu rõ rệt:

### 🏭 1.1. Bộ Ba Quyền Lực Trong CPU

1.  **CU (Control Unit - Bộ điều khiển):** Đây là "Ông quản đốc" khét tiếng. CU không thèm nhúng tay vào tính toán, nó chỉ đứng chỉ tay năm ngón. Nó nhận luồng lệnh (Control flow), giải mã xem câu lệnh đó muốn làm gì, sau đó điều phối các bộ phận khác (bật/tắt các công tắc điện tử) để thực thi.
2.  **ALU (Arithmetic Logic Unit - Bộ số học và logic):** "Anh thợ bậc 7" cơ bắp nhất xưởng. Mọi tính toán phức tạp nhất trên đời, từ render game 3D đến mã hóa RSA, đều bị anh thợ này quy về các phép toán cấp 1:
    * **Số học (Arithmetic):** `ADD` (+), `SUB` (-), `MUL` (*), `DIV` (/).
    * **Logic:** `AND`, `OR`, `XOR`, `NOT` (chuyên trị thao tác bit).
3.  **Registers (Thanh ghi):** Đây là cái "túi quần" của CPU. RAM có thể nhanh, nhưng so với tốc độ của CPU thì RAM vẫn chậm như rùa bò. Thế nên CPU cần một nơi chứa dữ liệu ngay bên trong lõi của nó để xài ngay lập tức.
    * *Đặc điểm:* Cực kỳ nhỏ (chỉ chứa được vài chục đến vài trăm Byte), tốc độ bàn thờ, nhưng **bay hơi (Volatile)**. Cúp điện một phát là mất sạch sành sanh không để lại dấu vết.

---

### 🎒 1.2. Dàn "Harem" Thanh Ghi (Registers) Trọng Yếu

* **PC (Program Counter - Bộ đếm chương trình):**
    Đây là "Cuốn sổ Nam Tào". Nó **luôn lưu địa chỉ của câu lệnh TIẾP THEO** sẽ được thực thi. CPU cứ làm xong một việc là lại ngó vào PC để xem: "Tiếp theo tao phải chạy đi đâu?".
    > **Góc CTF/Pwnable:** Trong kiến trúc x86/x64, thanh ghi này được gọi là `EIP` hoặc `RIP`. Lỗi bảo mật kinh điển **Buffer Overflow (Tràn bộ đệm)** chính là kỹ thuật hacker tuồn rác vào bộ nhớ cho đến khi ghi đè được thanh ghi `PC` này, ép CPU phải nhảy đến đoạn Shellcode (mã độc) mà chúng đã chuẩn bị sẵn.
* **MAR (Memory Address Register - Thanh ghi địa chỉ):**
    "Tờ giấy ghi địa chỉ giao hàng". Khi CPU muốn lấy dữ liệu từ RAM, nó phải ném địa chỉ của ô RAM đó vào MAR. Ví dụ: "Tìm cho tao dữ liệu ở ô số `0x1A2B`".
* **MDR (Memory Data Register - Thanh ghi dữ liệu):**
    "Cái hộp thư trung gian". Dữ liệu từ RAM trả về (hoặc dữ liệu chuẩn bị ghi xuống RAM) sẽ được nhét tạm vào đây.
* **CIR (Current Instruction Register - Thanh ghi lệnh hiện tại):**
    Đây mới chính là nơi lưu giữ **câu lệnh ĐANG được thực thi**. Ví dụ: Lệnh `ADD 5` sau khi được lôi từ RAM lên sẽ nằm chễm chệ ở CIR chờ ông quản đốc CU giải mã.
* **ACC (Accumulator - Thanh ghi tích lũy):**
    Cái "màn hình máy tính bỏ túi". Chuyên hứng kết quả tính toán của ALU. Tính xong 5 + 3, số 8 sẽ nằm ở ACC.

---

### 🔄 1.3. Vòng Lặp Bất Tử (Instruction Cycle)



Bắt đầu từ lúc bật máy tính lên cho đến lúc tắt đi, CPU chỉ làm duy nhất một việc: Lặp đi lặp lại 4 bước này hàng tỷ lần mỗi giây (Clock Speed). 

Hãy thử tưởng tượng ông chạy đoạn code C++: 
`for (int i = 0; i < 5; i++) { i += 1; }`. Dưới tầng CPU, một lệnh `ADD 1` (Cộng 1 vào i) sẽ trải qua đọa đày 4 kiếp:

1.  **Fetch (Nạp lệnh): Lấy đồ nghề**
    * `PC` chỉ điểm: "Lệnh tiếp theo nằm ở địa chỉ `0x100`".
    * Chuyển số `0x100` vào `MAR`.
    * CPU chọc xuống RAM ở địa chỉ `0x100`, lấy được dòng lệnh `ADD 1`.
    * Dòng lệnh `ADD 1` bơi ngược lên, chui vào `MDR`, sau đó được chuyển sang `CIR`.
    * *Quan trọng:* Lúc này `PC` tự động nhảy số (`PC = PC + 1`) để trỏ sẵn sang lệnh tiếp theo.
2.  **Decode (Giải mã): Đọc hiểu tài liệu**
    * Quản đốc `CU` đọc cái lệnh `ADD 1` đang nằm trong `CIR`.
    * Nó dịch luồng nhị phân và hiểu rằng: "À, đây là phép cộng. Cần bật công tắc của ALU lên và chuẩn bị sẵn dữ liệu".
3.  **Execute (Thực thi): Đập búa**
    * `ALU` nhận lệnh, lôi giá trị hiện tại của `i` ra và tiến hành cộng thêm 1.
4.  **Store (Lưu trữ): Cất thành quả**
    * Kết quả vừa tính xong được ném vào thanh ghi `ACC` hoặc ghi ngược lại thẳng vào bộ nhớ RAM. 
    * Xong việc, CPU lại quay lại dòm ngó thanh ghi `PC` để bắt đầu một vòng lặp mới.

![process-cpu-fetch-decode-execute-store](/images/process-cpu-fetch-decode-execute-store.avif)

## 2. Hệ Sinh Thái Bộ Nhớ: "Kim Tự Tháp Phân Lô Bán Nền" (Memory Hierarchy)

> "Quy luật bất biến của giới phần cứng: Cái gì càng nhanh thì càng đắt, mà càng đắt thì dung lượng càng hẻo." 💸



Nếu CPU là một gã siêu bếp trưởng thái được hàng tỷ củ hành mỗi giây, thì **Bộ nhớ (Memory)** chính là cái tủ lạnh và nhà kho. Vấn đề là gã bếp trưởng chạy quá nhanh, trong khi tốc độ lấy đồ từ kho (RAM) lại quá chậm. Trong giới học thuật, thảm họa này gọi là **Nghẽn cổ chai Von Neumann (Von Neumann Bottleneck)**. 

Để bếp trưởng không phải đứng ngáp ruồi chờ shipper giao hành, các kỹ sư thiết kế bộ nhớ thành một kim tự tháp phân cấp xã hội cực kỳ thực dụng:

### ⚡ Level 0: Thanh ghi (CPU Registers) - Giới tinh hoa
Nằm ngay trong lõi silicon của CPU. Đây là cái "túi quần" của gã bếp trưởng.
* **Đặc điểm:** Tốc độ vận tốc ánh sáng (chỉ tốn **0 - 1 chu kỳ clock** để truy cập). Dung lượng siêu nghèo nàn (chỉ vài chục KB).
* **Nhiệm vụ:** Chứa câu lệnh và dữ liệu ĐANG bị đem ra xử lý (như lệnh `ADD`, địa chỉ `0xA`...). Vì không gian chật hẹp, CPU xài xong thằng nào là phải đá đít thằng đó ra ngay để nhường chỗ cho thằng khác.

### 🚀 Level 1: Cache (Bộ nhớ đệm) - Tầng lớp trung lưu
Thay vì mỗi lần khát nước phải chạy ra tận siêu thị (RAM) mất hàng trăm chu kỳ, CPU sắm một cái tủ lạnh mini đặt ngay cạnh bàn làm việc. Đó là Cache. 

Sự tồn tại của Cache dựa trên một phép thuật tối thượng gọi là **Nguyên lý cục bộ (Locality of Reference)**:
1.  **Cục bộ thời gian (Temporal Locality):** Cái gì vừa xài xong, khả năng cao tí nữa xài lại (ví dụ: biến chạy `i` trong vòng lặp `for`).
2.  **Cục bộ không gian (Spatial Locality):** Xài cái này thì chắc chắn sẽ xài mấy cái nằm cạnh nó (ví dụ: vừa gọi phần tử `Array[0]`, CPU sẽ tự hiểu ý bế luôn cả `Array[1]`, `Array[2]` nhét sẵn vào Cache).

* **L1 Cache:** Nằm sát vách lõi CPU, nhanh nhất, đắt nhất (Tốn khoảng **4 chu kỳ**).
* **L2, L3 Cache:** To hơn một tí, dùng chung cho các lõi, chậm hơn L1 (Tốn khoảng **10-40 chu kỳ**) nhưng vẫn ăn đứt RAM.

> **Trầm cảm mang tên "Cache Miss":** Khi CPU cần tìm data, nó sẽ ngó vào Cache trước. Có thì gọi là **Cache Hit** (Bingo!). Không có thì gọi là **Cache Miss**, lúc này CPU phải ngậm đắng nuốt cay lội ra tận RAM để tìm, tốn xấp xỉ **200 chu kỳ**. Viết code xịn là phải biết cách sắp xếp dữ liệu để tối đa hóa Cache Hit!

### 🚗 Level 2: RAM (Random Access Memory) - Tầng lớp bình dân
Đây là cái siêu thị tổng hợp. Mọi App từ Chrome, game, đến cả cái hệ điều hành đều phải được nạp lên RAM thì mới chạy được. RAM chia bộ nhớ thành hàng tỷ cái "ngăn kéo" (Cells), mỗi ngăn có một địa chỉ độc nhất. 

Nhưng RAM có một căn bệnh trầm kha: **Não cá vàng (Volatile)**. Cúp điện một phát là trắng tay!

Trong giới RAM, có một cuộc chiến giai cấp cực gắt giữa 2 anh em nhà nó. Tại sao SRAM đắt lòi kèn còn DRAM lại rẻ bèo? Hãy nhìn vào phần cứng:

| Kèo Đấu | SRAM (Static RAM - Tĩnh) 🤑 | DRAM (Dynamic RAM - Động) 🤕 |
| :--- | :--- | :--- |
| **Bản chất phần cứng** | Là "Rich kid". Cấu tạo phức tạp từ **6 con Transistor (6T)** ghép thành mạch chốt Flip-flop. Cần rất nhiều không gian trên bo mạch. | Là "Con nhà nghèo". Cấu tạo siêu đơn giản, chỉ gồm **1 Transistor + 1 Tụ điện (1T1C)**. Nhét được tỷ tỷ cái vào một thanh RAM. |
| **Độ ổn định** | Dữ liệu được chốt chặt, cực kỳ vững chắc, không bị suy hao chừng nào còn điện. | Tụ điện (Capacitor) bị bệnh rò rỉ điện. Bo mạch phải liên tục bơm điện vào (quá trình **Refresh**) cản trở việc đọc/ghi. |
| **Giá & Vị trí** | Cực đắt, cực nhanh. Được phong tước làm "vua" ở khu vực **Cache L1, L2, L3**. | Rẻ bèo, dung lượng khổng lồ nhưng chậm hơn nhiều. Chính là **thanh RAM** anh em hay cắm vào Mainboard. |

> **Góc lươn lẹo của Pwners:** Vì thanh DRAM (RAM máy tính) dùng tụ điện, nên khi rút điện, tụ điện không xả sạch ngay lập tức mà từ từ nguội đi. Dân chơi bảo mật có trò **Cold Boot Attack**: Vừa tắt máy tính là xịt thẳng nitơ lỏng đóng băng thanh RAM, rút ra cắm sang máy khác để trích xuất nguyên vẹn mật khẩu và khóa mã hóa (Encryption keys) vừa lưu trong đó. Đỉnh cao của vật lý! 🥶

### 🐢 Level 3: ROM (Read Only Memory) - Các cụ bô lão
Bộ nhớ "chỉ đọc" và bất tử (Non-volatile). Tắt máy vẫn còn nguyên. 

Nó sinh ra để giải bài toán "Con gà và quả trứng". Khi vừa nhấn nút nguồn, RAM đang trống rỗng không biết gì, CPU ngơ ngác như một đứa trẻ. Lúc này, CPU bắt buộc phải trỏ thanh ghi `PC` (Program Counter) vào một địa chỉ hardcode sẵn trong **ROM**.
ROM chứa các tập lệnh **BIOS/UEFI**, thực hiện test phần cứng (POST) và hướng dẫn CPU cách lội xuống ổ cứng (SSD/HDD) để gọi thằng Hệ điều hành (OS) dậy làm việc.

![computer_memory](/images/computer_memory.jpg)

## 4. Hệ Điều Hành (OS): Trò Chơi Vương Quyền (Game of Thrones)

> "Phần cứng là một cỗ xe ngựa kiêu ngạo, phần mềm là lũ ngựa hoang vô kỷ luật. Và Hệ điều hành (OS) chính là gã xà ích cầm roi da đứng giữa, chửi bới và ép tất cả phải đi đúng hàng." 🐴🏇

Nhiều anh em lầm tưởng OS chỉ là cái giao diện Windows đẹp đẽ hay cái màn hình terminal đen ngòm của Kali Linux. Không! Bên dưới lớp vỏ bọc đó, OS là một **Kẻ độc tài toàn trị**. Nó bao thầu mọi quyền lực: Đứa nào được ăn (cấp phát RAM), đứa nào được hít thở (chia giờ CPU), và đứa nào xấc xược thì đem ra chém đầu (Kill Process).

Để duy trì chế độ độc tài này, OS thiết lập một hệ thống phân biệt giai cấp cực kỳ tàn khốc:



### 🛡️ 4.1. Hệ Sinh Thái "Ring": Đẳng Cấp Xã Hội Lõi

Kiến trúc máy tính (như x86) chia quyền lực thành 4 vòng tròn đồng tâm, từ Ring 0 đến Ring 3. Nhưng trong thực tế, các OS hiện đại (Windows, Linux) lười biếng nên chỉ xài đúng 2 vòng: **Ring 0** và **Ring 3**.

* **Ring 3 (User Space - Khu Ổ Chuột):**
    * **Thành phần:** Nơi quần cư của đám "dân đen" như Chrome, Zalo, Game, và cả mấy đoạn code C++/Python ông vừa viết.
    * **Đặc quyền:** Số 0 tròn trĩnh. Không được đụng vào RAM thật, không được sờ vào ổ cứng, không được giao tiếp với Card đồ họa.
    * **Bảo mật:** Nhờ bị nhốt ở Ring 3 (Sandbox), nên nếu một tab Chrome bị lỗi (Crash), nó chỉ chết một mình nó. OS sẽ tặc lưỡi thu dọn xác nó đi và hệ thống vẫn chạy bình thường.
* **Ring 0 (Kernel Space - Tử Cấm Thành):**
    * **Thành phần:** Nơi ngự trị của "Hoàng đế" Kernel và các quan đại thần (Hardware Drivers).
    * **Đặc quyền:** Vô cực. Có toàn quyền sinh sát, chọc ngoáy vào bất kỳ ngóc ngách nào của CPU và RAM vật lý.
    * **Hậu quả:** Vì quyền lực quá lớn, nếu một dòng code trong Ring 0 bị lỗi (ví dụ cái driver card màn hình dỏm), toàn bộ hệ thống sẽ sụp đổ. Chào mừng bạn đến với hiện tượng **Màn hình xanh chết chóc (BSoD) trên Windows** hoặc **Kernel Panic trên Linux**! 💀

> **Góc Pwnable (CTF):** Mục tiêu tối thượng của giới Hacker không phải là ăn cắp cái nick Facebook. Mục tiêu của họ là **Leo thang đặc quyền (Privilege Escalation)**. Bằng cách lợi dụng một lỗ hổng (Exploit), hacker từ thân phận bần nông ở Ring 3 lén lút tiêm mã độc xuống Ring 0. Khi gõ lệnh `whoami` trên terminal mà hệ thống trả về chữ `root`, cảm giác đó nó phê hơn cả trúng số!

---

### 🌉 4.2. System Call: Hành Chính "Một Cửa" Của OS



Vì bị tước đoạt mọi quyền lực, đám dân đen Ring 3 sống rất khổ. Ví dụ: Phần mềm Notepad (Ring 3) muốn đọc một file văn bản từ ổ cứng. Nó KHÔNG THỂ tự lội xuống ổ cứng để lấy.

Nó bắt buộc phải vác đơn lên "Ủy ban nhân dân" OS để xin phép. Quá trình này gọi là **System Call (Lời gọi hệ thống)**.

**Quy trình "Hành con nhà bà Chính" diễn ra như sau:**
1.  **Nộp đơn:** Notepad gọi hàm `open()` hoặc `read()`. (Đây là các hàm API bọc ngoài).
2.  **Đánh kẻng (Interrupt/Trap):** Chuyển từ text sang mã máy. Trong Linux 32-bit cũ, nó dùng lệnh ngắt `int 0x80`. Ở thời 64-bit hiện đại, nó dùng lệnh siêu tốc `syscall`. Tiếng kẻng vang lên báo hiệu: *"Có thằng dân đen muốn nhờ vả!"*.
3.  **Chuyển đổi ngữ cảnh (Context Switch):** Khúc này cực kỳ tốn tài nguyên. CPU dừng ngay việc đang làm ở Ring 3, lưu trạng thái lại, và **nhảy "cái rụp" xuống Ring 0**.
4.  **Kiểm tra lý lịch:** Hoàng đế Kernel nhận đơn, liếc mắt kiểm tra: *"Thằng Notepad này có quyền đọc file này không? File có tồn tại không?"*. (Nếu ông không có quyền, OS quăng ra lỗi `Access Denied` hoặc `Permission denied` huyền thoại).
5.  **Trả kết quả:** Nếu hợp lệ, Kernel sai tài xế (Driver) chạy xuống ổ cứng lấy data lên, ném lại cho Notepad, rồi CPU lại **nhảy ngược từ Ring 0 về Ring 3** để Notepad chạy tiếp.

**Tóm tắt các System Call quốc dân hay gặp:**
* Hệ File: `open()`, `read()`, `write()`, `close()`.
* Hệ Tiến trình: `fork()` (đẻ ra tiến trình con), `execve()` (thay hồn đổi xác tiến trình), `exit()` (tự sát).
* Hệ Mạng: `socket()`, `listen()`, `accept()`.

> **Bài học rút ra:** Gọi System Call là một thủ tục rườm rà, nhảy qua nhảy lại giữa 2 Ring cực kỳ tốn thời gian CPU. Viết code xịn là phải biết gom data lại (Buffering) rồi gọi `write()` một lần thôi, thay vì in ra từng chữ một và gọi System Call hàng ngàn lần!

![fork](/images/fork.jpeg)

## 5. Process, Thread & Nghệ Thuật Tung Hứng Của OS

> "Máy tính của bạn giống như một công ty chỉ có đúng 1 nhân viên (CPU), nhưng lại nhận cùng lúc 100 dự án. Để khách hàng không chửi, gã nhân viên này phải chạy qua chạy lại giữa các dự án với tốc độ bàn thờ để lừa mọi người rằng gã đang làm 100 việc cùng lúc." 🤹‍♂️

![thread_vs_process](/images/thread_vs_process.webp)

### 🏭 5.1. Phân Biệt Process và Thread: Nhà Máy & Công Nhân

Để hiểu cách OS quản lý ứng dụng, hãy nắm vững sự khác biệt sinh tử này:

* **Process (Tiến trình - Cái nhà máy):**
    * Khi ông nháy đúp vào file `notepad.exe` nằm chết trên ổ cứng, OS nạp nó lên RAM, cấp cho nó một mảnh đất (Virtual Memory) và một mã số định danh độc nhất gọi là **PID** (Process ID). Chúc mừng, một Process vừa chào đời!
    * Mỗi Process là một vương quốc độc lập. Chết thằng nào thằng nấy chịu, hiếm khi lây sang thằng khác.
    * OS quản lý thằng này bằng một cuốn sổ bìa đen gọi là **PCB (Process Control Block)**. Sổ này ghi rõ: Thằng này tên gì? Đang ở địa chỉ RAM nào? Đang mở file gì?
* **Thread (Luồng - Thằng công nhân):**
    * Một nhà máy (Process) có thể mướn nhiều công nhân (Thread) để làm việc cho lẹ. Người ta gọi nó là *Lightweight Process* (Tiến trình nhẹ).
    * **Cực kỳ quan trọng:** Các Thread trong cùng một Process **XÀI CHUNG** bộ nhớ RAM của Process đó. Nghĩa là Thread A có thể thò tay sửa biến của Thread B. (Đây chính là nguồn cơn của thảm họa lỗi `Race Condition` làm đau đầu bao thế hệ Dev).

### 🎫 5.2. Đồ Chơi Của OS: Handle & Token (Đặc sản Windows)

Nếu lặn sâu vào hệ thống (đặc biệt là Windows), ông sẽ thấy OS quản lý tài nguyên bằng 2 thứ mang tính sát thương cao:

* **Handle (Thẻ gửi xe):** Khi ông mở một file txt, OS không quăng nguyên cái file vào mặt ông. Nó giấu file đó đi và đưa cho Process một cái mã số (Handle). Lần sau muốn ghi thêm chữ, Process chỉ cần chìa cái Handle ra: *"Ê OS, ghi chữ vào cái Handle số 15 này cho tao!"*.
* **Token (Căn cước công dân):**
    * **Primary Token:** Chứng minh thân phận thực sự của Process. Thằng `Zalo.exe` chạy bằng quyền User cùi bắp thì Primary Token của nó là User.
    * **Impersonation Token (Thẻ ngành giả mạo):** Trò ảo thuật của giới Pwners! Cho phép một Thread "đeo mặt nạ" để mượn danh nghĩa kẻ khác (ví dụ: mượn quyền `SYSTEM` hoặc `Administrator`) để chạy lén lút mã độc mà OS vẫn tưởng người nhà đang làm việc.

---

### 🔀 5.3. Context Switching (Chuyển đổi ngữ cảnh)

![context_switch](/images/context-switch.jpg)

Nhân viên (CPU) thì ít mà dự án (Process) thì nhiều. Để máy tính trông có vẻ mượt mà, OS dùng tuyệt chiêu **Context Switching** (Chuyển đổi ngữ cảnh).

**Kịch bản: CPU đang chạy App A (chơi game) thì bị OS ép chuyển sang App B (tải file).**
1. CPU phanh gấp.
2. Nó phải "chụp ảnh" trạng thái hiện tại của App A: thanh ghi `PC` đang trỏ đi đâu, biến tính toán đang dở dở ương ương thế nào... đem tất cả nhét vào cuốn sổ **PCB của A**.
3. CPU lục cuốn sổ **PCB của B**, lôi các thông số cũ ra, nạp lại vào thanh ghi.
4. Chạy tiếp App B từ đoạn đang bị đứt gánh.

> **Sự thật mất lòng:** Trò "tung hứng" này diễn ra hàng ngàn lần mỗi giây. Việc lưu ra nạp vào tốn một lượng tài nguyên **CỰC KỲ KHỦNG KHIẾP** (Overhead). Nó còn làm "ô nhiễm" bộ nhớ Cache (vì data của App A trong Cache bị vứt đi để nhét data của App B vào). Thế nên máy tính càng chạy nhiều App ngầm thì càng giật lag là vậy!

---

### ⏱️ 5.4. Trọng Tài Lập Lịch (CPU Scheduling)



Trước khi được chia phần, mỗi Process phải trải qua một Vòng đời thăng trầm:
`New` (Vừa đẻ) ➡️ `Ready` (Đứng xếp hàng) ➡️ `Running` (Được CPU bú) ➡️ `Block/Wait` (Đứng chờ tải file/chờ người dùng gõ phím) ➡️ `Terminated` (Hóa kiếp).

Vậy khi có 100 thằng đang đứng ở hàng đợi `Ready`, OS sẽ chọn thằng nào vào `Running`? Chào mừng đến với các đạo luật phân chia:

1. **Phe Non-preemptive (Lỳ lợm - Không cho cắt ngang):** Một khi đã ôm được CPU thì chạy đến chết, hoặc đến khi tự nhả ra thì thôi. Đứa khác cấm có quyền xen vào.
2. **Phe Preemptive (Độc đoán - Cấp trên đè bẹp cấp dưới):** OS có quyền nhảy ra đá đít thằng đang chạy để nhường chỗ cho thằng khác VIP hơn.

**Các thuật toán chia kẹo kinh điển:**

* **FCFS (First Come First Serve):** Thằng nào xếp hàng trước thì được xài CPU trước. 
    * *Đánh giá:* Rất công bằng nhưng cực ngu. Lỡ thằng đầu hàng tải cái file mất 10 tiếng, thì 99 thằng đằng sau phải đứng ngáp ruồi (Hiệu ứng *Convoy Effect* - Tắc đường).
* **SJF (Shortest Job First):** Thằng nào việc nhẹ, tính xong nhanh thì cho lết lên làm trước.
    * *Đánh giá:* Tổng thời gian chờ siêu thấp. Nhưng lỡ cái máy cứ liên tục nhận việc nhẹ, thì mấy thằng có việc nặng (như render video) sẽ vĩnh viễn không bao giờ được chạy (Hiện tượng này gọi là **Starvation - Chết đói**).
* **Round Robin (RR - Xoay vòng):** Cắt bánh chia đều. OS quy định mỗi thằng chỉ được lên bảng 2 mili-giây (gọi là Time Quantum). Hết 2ms? Đá đít văng ra sau hàng đợi, thằng tiếp theo lên.
    * *Đánh giá:* Dân chủ nhất, các hệ điều hành hiện đại đều dùng thằng này trộn với các thuật toán khác.
* **Priority (Độ ưu tiên):** Đạo luật COCC. Mỗi Process có một cái mác ưu tiên. Thằng nào VIP chạy trước.
    * *Đánh giá:* Lại dính bệnh **Chết đói** cho dân đen. Để fix, OS dùng thủ thuật **Aging (Sống lâu lên lão làng)**: Thằng dân đen nào phải đứng chờ quá lâu, OS sẽ từ từ nâng độ VIP của nó lên để một ngày nào đó nó được chạy. Nghèo thì lâu chứ chờ lâu thì cũng thành VIP!

## 6. Ảo Thuật Gia Bộ Nhớ: "Ông trùm Phân Lô Bán Nền" 

> "Hệ điều hành là một gã cò đất lươn lẹo. Hắn bán cùng một mảnh đất 8GB cho 100 thằng Process, nhưng thằng nào cũng đinh ninh mình đang sở hữu một cái biệt thự rộng 4GB riêng biệt." 🏘️💸

Câu hỏi triệu đô: Máy tính anh em có 8GB RAM, nhưng anh em vừa bật cái game AAA nặng 6GB, vừa mở 50 tab Chrome tốn 4GB, thêm vài cái giả lập Android... Tính sơ sơ cũng mười mấy GB. Tại sao máy không nổ tung mà vẫn chạy (dù hơi giật)? 

Câu trả lời nằm ở "Cú lừa thế kỷ" mang tên: **Bộ Nhớ Ảo (Virtual Memory)** và **Phân Trang (Paging)**.

### 🪄 6.1. Thuật Phân Trang (Paging): Cò Đất OS

OS không bao giờ giao chìa khóa RAM thật (Physical Memory) cho các Process. Vì lỡ thằng Zalo bị ngáo đá, nó thọc tay sang vùng RAM của thằng Chrome mà xóa bậy thì toang cả hệ thống.

Thay vào đó, OS phát cho mỗi App một cái "Sổ đỏ ảo" (Virtual Address Space). 
* Trong mắt thằng Process: *"Ôi tuyệt quá, mình có cả một dải đất rộng thênh thang, liền mạch từ đầu đến cuối!"*
* Sự thật phũ phàng: OS băm nát cái RAM thật ra thành hàng vạn mảnh nhỏ đều nhau (gọi là **Frame**). Đồng thời băm cái sổ đỏ ảo ra thành các mảnh tương ứng (gọi là **Page**).



Khi Process thực sự muốn ghi dữ liệu vào một địa chỉ ảo (Virtual Address - VA), OS mới lén lút lôi cuốn sổ bìa đen **Page Table (Bảng phân trang)** ra để tra cứu xem cái VA này đang được giấu ở cái xó nào dưới RAM vật lý (Physical Address - PA).

Công thức "định vị tọa độ" mà OS nhẩm trong đầu:

> PA=Base+ Offset

* **Base:** Số nhà của khu đất thật dưới RAM (Tìm được nhờ tra cứu cuốn Page Table).
* **Offset:** Tọa độ chính xác của cái "cây chổi" nằm cách cửa nhà bao nhiêu mét. (Offset của Virtual và Physical luôn giống nhau y đúc).

> **Góc "Nợ Xấu" (Swapping / Page Fault):** Lỡ RAM thật bị nhét đầy thì sao? OS giở trò bắt cóc bỏ dĩa. Nó nhìn xem thằng Process nào đang ngủ đông (ví dụ cái tab Chrome ông mở từ sáng mà không thèm đọc), nó sẽ "bế" toàn bộ data của thằng đó vứt tạm ra ngoài Ổ cứng (SSD/HDD - Khu chuồng gà). Quá trình này gọi là **Swapping**. Chỗ trống trong RAM sẽ nhường cho game ông đang chơi.
> Lúc ông bấm lại vào cái tab Chrome đó, nó sẽ bị đơ mất vài giây. Đó là vì OS đang cuống cuồng lội xuống ổ cứng lôi data về lại RAM (Hiện tượng này gọi là **Page Fault** - Tạm dịch: Lỗi hết hàng, chờ xíu đi lấy đồ).

---

### 🛡️ 6.2. Đặc Vụ OS: Kẻ Thù Không Đội Trời Chung Của Hacker

Nếu bộ nhớ cứ nằm tê hê ra đấy, giới Hacker (Pwners) sẽ phá nát cái máy tính của bạn trong vòng nửa nốt nhạc bằng kỹ thuật kinh điển: **Buffer Overflow (Tràn bộ đệm)**. 
Bằng cách nhồi data rác vào ô nhập Password cho đến khi nó tràn ra ngoài, hacker có thể ép thanh ghi `PC` nhảy đến địa chỉ của hàm `system()` để mở Terminal hoặc chạy mã độc (Shellcode).

Để ngăn chặn trò mèo này, OS tung ra 2 "Đặc vụ" gác cửa cực kỳ tàn bạo:



#### 🥷 1. ASLR (Address Space Layout Randomization): Kỹ năng "Độn Thổ"
Hồi xưa, các hàm hệ thống (như `printf`, `system`...) cứ mở máy lên là nằm chết dí ở một địa chỉ cố định (ví dụ `0x08048420`). Hacker cứ nhắm mắt ném đạn vào tọa độ đó là chết.

Giờ có **ASLR**, mỗi lần ông mở cái App lên, OS sẽ nhặt toàn bộ Code, Stack, Heap ném vào một vị trí **BẤT KỲ** trong không gian RAM.
* Hôm qua hàm `system()` nằm ở `0x12345678`.
* Hôm nay tắt bật lại, nó đã dọn nhà sang `0x7FFAC990`.
* **Hậu quả:** Hacker giống như một tay súng nhắm bắn vào cái toilet, nhưng OS thì liên tục bê cái toilet dịch chuyển tức thời đi chỗ khác. Khóc ròng! 😭 (Tất nhiên hacker xịn vẫn có trò *Memory Leak* để rò rỉ địa chỉ thật, nhưng đó là câu chuyện cho giải đấu CTF cấp thế giới rồi).

#### 🛑 2. DEP / NX bit (Data Execution Prevention / No-eXecute): "Cấm Mang Vũ Khí Vào Phòng Ăn"
Hacker có một trò siêu "chó má": Tự viết mã độc (Shellcode), nhét nó vào biến string (chỗ để người dùng nhập Tên/Tuổi), rồi ép CPU nhảy thẳng vào biến string đó để thực thi.

CPU hồi xưa cực kỳ ngây thơ, cứ trỏ tới đâu là nó nhắm mắt nhắm mũi chạy tới đó, không cần biết đó là Code hay là Data.

OS bèn ra mắt cờ bảo vệ **NX bit (No-eXecute)** gắn thẳng vào phần cứng. Nó chia bộ nhớ làm 2 khu vực rạch ròi:
* **Khu chứa Code (.text):** Được phép chạy, nhưng CẤM SỬA (Read & Execute).
* **Khu chứa Data (Stack, Heap):** Được phép ghi, nhưng **CẤM CHẠY (Read & Write)**.

* **Hậu quả:** Hacker nhét mã độc vào ô Tên thành công. Nhưng khi ép CPU chạy đoạn mã độc đó, cờ NX sẽ bật đèn đỏ gào lên: *"Mày dám thực thi code ở khu vực Data à?"*. Bùm! OS giáng thẳng một cái `Segmentation fault (core dumped)` vào mặt thằng App và tắt phụt chương trình để bảo vệ hệ thống. Game Over cho Hacker! ☠️

## 7. "Cơm thêm": Trò Chơi "Xếp Hình" Của OS (Memory Allocation)

> "Cấp phát bộ nhớ giống như việc bạn chạy xe vào hầm Vincom tìm chỗ đỗ. Có đứa lười thấy chỗ nào chui lọt là tấp vào luôn (First Fit), có đứa mắc hội chứng hoàn hảo phải lượn chục vòng tìm đúng cái ô vừa khít xe mình (Best Fit)." 🚗🅿️

Để anh em hiểu rõ lúc OS đi tuần tra và nhét các Process vào RAM trống trông như thế nào, hãy lấy thuật toán cơ bản nhất ra mổ xẻ: **First Fit (Vừa miếng là đớp)**.

* **Luật chơi:** Khi một App há mồm xin RAM, OS lười biếng sẽ lướt từ đầu đến cuối thanh RAM. Thấy cái "lỗ hổng" nào đầu tiên mà kích thước của nó lớn hơn hoặc bằng mức App yêu cầu ➡️ Nhét thẳng App vào đó luôn! Không cần quan tâm cái lỗ đó to đùng và việc nhét vào sẽ gây lãng phí bộ nhớ.

Dưới đây là đoạn code C++ mô phỏng lại cảnh tượng OS gồng mình nhét 4 thằng Process "to xác" vào 5 cái Block RAM đang trống:

```cpp
#include <iostream>
using namespace std;

// Demo thuật toán First Fit: Gã bảo vệ lười biếng, thấy lỗ nào chui lọt là cho chui luôn!
void FirstFit(int blockSize[], int m, int processSize[], int n) {
    // Mảng lưu vết để biết thằng Process nào đang nằm ở Block RAM nào
    int allocation[n];
    for (int i = 0; i < n; i++) {
        allocation[i] = -1; 
        // Ban đầu khởi tạo -1 (Tức là vô gia cư, chưa được cấp RAM)
    }

    // OS bắt đầu cầm sổ đi tìm nhà cho từng thằng Process
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            // Nếu kích thước Block RAM >= kích thước Process -> Nhét vào luôn!
            if (blockSize[j] >= processSize[i]) {
                allocation[i] = j; // Ghi sổ: Process thứ i đã chui vào Block thứ j
                
                // Trừ đi phần RAM đã bị Process chiếm dụng (Phần còn thừa gọi là Phân mảnh)
                blockSize[j] -= processSize[i]; 
                
                break; // Xong việc của thằng này, break để qua tìm nhà cho Process tiếp theo
            }
        }
    }

    // In bảng phong thần báo cáo kết quả
    cout << "\nProcess No.\tProcess Size\tBlock no.\n";
    for (int i = 0; i < n; i++) {
        cout << " " << i + 1 << "\t\t" << processSize[i] << "\t\t";
        if (allocation[i] != -1) 
            cout << allocation[i] + 1;
        else 
            cout << "Not Allocated (Thiếu RAM, ra gầm cầu!)";
        cout << endl;
    }
}

int main() {
    // Giả sử OS đang có 5 mảnh RAM trống với kích thước (MB) lần lượt là:
    int blockSize[] = {100, 500, 200, 300, 600}; 
    // Có 4 thằng App (Process) đang đòi cấp RAM:
    int processSize[] = {212, 417, 112, 426};    

    int m = sizeof(blockSize) / sizeof(blockSize[0]);
    int n = sizeof(processSize) / sizeof(processSize[0]);

    cout << "--- HỆ THỐNG BẮT ĐẦU CẤP PHÁT RAM (FIRST FIT) ---\n";
    FirstFit(blockSize, m, processSize, n);
    
    return 0;
}
```

#### 💣 Bài Học Xương Máu (Sự tàn khốc của First Fit)
Nếu anh em chạy thử đoạn code trên, sẽ thấy thuật toán này chạy cực nhanh. Nhưng nhược điểm của nó là sinh ra hiện tượng Phân mảnh ngoại vi (External Fragmentation).

Ví dụ: Ông nhét một Process 112MB vào một Block 200MB. Block đó sẽ bị dư ra một khúc 88MB. Nếu cứ cắt vụn RAM ra như vậy, một lúc sau thanh RAM của ông sẽ đầy rẫy những "mảnh vỡ" 50MB, 88MB, 10MB vứt lay lắt khắp nơi. Cộng tổng lại thì rất nhiều (có khi lên tới vài GB), nhưng chả có mảnh nào đủ to để nhét vừa một cái Process 300MB đang cần chạy cả!

➡️ Đó chính là lý do các hệ điều hành hiện đại phải vứt bỏ cách cấp phát nguyên cục này, và chuyển sang dùng thuật toán Phân trang (Paging) (đã phân tích ở Phần 6) để băm RAM ra thành các trang nhỏ bằng nhau, tận dụng triệt để từng Byte bộ nhớ.

> Xem thêm demo tại đây (works on my machine)🤡:
https://drive.google.com/drive/folders/1FdLTy96eUl7zpPTVc2G61N1zpQPsvD0B?usp=sharing

## END BLOG
“Baobei à, tới đây hiểu được bao nhiêu rồi… hay vẫn đang loading vậy? 🤡

Không sao, tôi cũng không hiểu hết — chỉ là giả vờ bình tĩnh thôi.

Anyways, cya in the next chaos 💀
