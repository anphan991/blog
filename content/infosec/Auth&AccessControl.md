---

title: "Auth & Access Control: Phân chia bằng niềm tin và hy vọng"
date: "2026-05-21"
description: "Set Role = Admin"
tags: ["InfoSec", "Authentication", "Access Control", "Cybersecurity"]
level: "JUST_CHANGE_THE_ROLE"

---

> Nghĩ mình đặt password 20 ký tự cộng thêm ký tự đặc biệt là vô đối? Tỉnh mộng đi baobei! Mọi thứ đều vô nghĩa nếu thằng ất ơ nào đó chả thèm biết pass của bạn nhưng lại đang cầm quyền Admin. 🛡️💀

## 1. Mở Bát: Bộ 3 Quyền Lực AAA 

Trước khi đi sâu vào các "tuyệt kỹ" hack hay thủ thuật cấu hình phức tạp, chúng ta phải làm quen với những người gác cổng khó tính nhất của hệ thống mạng a.k.a khung kiến trúc AAA (AAA architectural framework).  Hãy tưởng tượng AAA giống hệt như một đội dân phòng kiêm bảo kê. Nhiệm vụ của nó là cấu hình và kiểm soát ba thứ cốt lõi: 


### 🎫 1.1 Authentication (Xác thực): "Nổ cái tên cái tuổi ra!"

Ngay khi bạn vừa thò mặt gõ cửa hệ thống, câu hỏi đầu tiên dội thẳng vào mặt là: *"Who is allowed access?"* (Đứa nào được phép vào?).

* **Bản chất:** Hệ thống sẽ ép bạn phải chứng minh bộ nhận diện (credentials) của bạn là hàng auth hay hàng pha-ke. Giống như lúc bạn login vào Linux, gõ sai pass `root` là màn hình terminal chửi bạn té tát. Qua được cửa này mới tính tiếp, không thì... "cook"!

### 👑 1.2 Authorization (Phân quyền): "Bố Đời hay Culi?"

Ok, cho mày vào nhà rồi đấy, nhưng *"What are they allowed to do?"* (Chúng nó được phép làm cái trò gì?).

* **Bản chất:** Đây là lúc hệ thống ban phát quyền hạn  để bạn được phép "chạm" vào một tài nguyên cụ thể. Đăng nhập thành công chưa chắc đã ngon! Hệ thống phân giai cấp cực kỳ tàn khốc. Bạn là VIP thì được quyền `rwx` (Read/Write/Execute) thả ga, còn phận dân thường thì chỉ được đứng nhìn (`r--`).

### 📓 1.3 Accounting (Kiểm toán): "Ghim tất!"

Đừng tưởng múa phím tung chảo, quậy nát server rồi nhấn `rm -rf` xóa log là thoát. Câu hỏi thứ 3 là: *"What did they do?"* (Chúng nó vừa làm cái quái gì?).

* **Bản chất:** Đây là quá trình soi xét lại toàn bộ các bản ghi hệ thống và các hoạt động. Mục đích là để test xem hệ thống kiểm soát có đủ đô không, và check xem các chính sách có bị lách luật hay không.


---

### 💳 Ví dụ:

Nghe như vậy thì lú, nhưng hãy nhìn vào cái thẻ tín dụng để đơn giản hóa:

* **Authentication:** Nhập mã PIN rẹt rẹt để trả lời hệ thống: *"Tôi là ai?"* (Who are you?).


* **Authorization:** Hệ thống load mất 3 giây để check xem hạn mức của bạn còn bao nhiêu, có đủ tiền thanh toán bill không (*How much can you spend?*).


* **Accounting:** Cuối tháng, bạn khóc thét khi nhìn tờ sao kê liệt kê từng đồng bạn đã nướng vào game hay đi đu idol (*What did you spend it on?*).

![NovMeme](/images/NovMeme.jpg)

---

### 🚀 Tại sao Server lớn nào cũng "Cuồng" kiến trúc AAA?

Giang cư mận không rảnh để vẽ chuyện. Việc ốp mô hình AAA mang lại những lợi ích cực kỳ mups:

1. **Dễ mở rộng & Quản lý:** Thay vì mỗi con router lỏ phải tự ôm một cái database nội bộ cực kỳ cồng kềnh, người ta dựng hẳn một server ACS chuyên dụng (dedicated ACS server) làm tổng đài. Cần sửa pass hay ném ai ra đảo? Chỉ việc gõ lệnh một chỗ, cả hệ thống tự động đồng bộ răm rắp.


2. **"Trâu bò" đánh mãi không sập (Multiple backup systems):** Hệ thống có khả năng chịu lỗi (Fault Tolerance) cực khét nhờ cấu hình theo một trình tự ưu tiên (fallback sequence). Trình tự ra sao? Đầu tiên nó sẽ đi hỏi máy chủ bảo mật (security server). Nhỡ server chính lăn ra "ngủm" (error), nó tự động lùi về móc database cục bộ (local database) ra xài tạm. Bạn định DDoS nó á? Còn cái nịt!


---
---


> Lý thuyết thiết kế kiến trúc nghe thì vĩ mô thế thôi, nhưng khi xách máy lên thực chiến, mọi thứ đều bắt đầu từ một cái khung đăng nhập. Dù tài khoản của bạn có quyền `root` thao túng cả server, nhưng nếu gõ sai mật khẩu ở màn hình login, hệ thống vẫn sẽ lạnh lùng báo lỗi và đóng sập cửa. Chào mừng đến với vòng gửi xe!

## 2. Cửa Ải 1: Authentication (Chứng minh thân phận)

Để hệ thống tin bạn là người thật việc thật chứ không phải một kịch bản tự động đang lén lút dò pass, nó sẽ ép bạn phải chứng minh nhân thân. Các phương thức xác thực (Means of Authentication) được chia thành 3 hệ cơ bản tùy vào độ nhạy cảm của dữ liệu mà server sẽ làm khó người dùng theo các cấp độ khác nhau:

### 🧠 2.1 "Biết gì khai nấy" (Something you know)

Hệ thống sẽ hỏi một thứ mà lý thuyết là "chỉ mình bạn biết". Phổ biến nhất chính là Mật khẩu (Password), mã PIN, hoặc những câu hỏi bảo mật kinh điển.

* **Thực tế đau lòng:** Người dùng thường có xu hướng tự hủy khi đặt mật khẩu là `admin123` hay `123456`, sau đó tự thắc mắc tại sao bị tấn công Brute-force cạy cửa trong vài giây. Hoặc tày hơn là ghi luôn mật khẩu ra tờ giấy note rồi dán thẳng lên viền màn hình để chống quên.
* **Giải pháp của Sysadmin:** Quản trị viên thừa biết thói quen này, nên họ hiếm khi lưu mật khẩu ở dạng thô (plaintext). Họ sẽ đem mật khẩu đi băm (Hash) bằng các thuật toán, rồi rắc thêm chút "muối" (Salt) để tạo ra một chuỗi ký tự hỗn độn. Nhờ vậy, lỡ có ai đó kéo được file `/etc/shadow` về máy thì cũng chỉ ngồi nhìn mớ ký tự mã hóa mà trầm cảm.

### 💳 2.2 "Cầm nắm vật lý" (Something you have)

Sinh ra để cứu rỗi những bộ não hay quên. Thay vì bắt bạn nhớ một chuỗi ký tự phức tạp, hệ thống cấp cho bạn một món đồ để làm chìa khóa.

* **Công cụ:** Thẻ Smartcard, USB Token, thẻ khóa RFID, hay phổ biến nhất là chiếc điện thoại dùng để nhận mã OTP.
* **Lỗ hổng vật lý:** Phương pháp này cực kỳ an toàn cho đến khi... bạn đánh rơi đồ. Đang chạy xe qua ngã tư Thủ Đức rớt mất chiếc điện thoại, hoặc đi uống cafe để quên thẻ RFID tự chế trên bàn. Mất thiết bị vật lý đồng nghĩa với việc bạn tự nhốt mình ở ngoài, còn ai nhặt được thì nghiễm nhiên có chìa khóa bước thẳng vào hệ thống.

### 👁️ 2.3 "Đính kèm xác thịt" (Something you are)

Không cần nhớ mật khẩu, cũng chẳng sợ rơi rớt ngoài đường vì chìa khóa chính là cơ thể bạn.

* **Công cụ:** Nhận diện sinh trắc học (Biometrics) — vân tay, Face ID, quét mống mắt. Cảm giác mở khóa cực kỳ mượt mà, chỉ cần liếc nhìn  là tự động mở khóa.
* **Sự thật phũ phàng:** Hiện đại thì hại điện, sẽ có những ngày hệ thống từ chối nhận chủ. Sáng ngủ dậy mặt sưng vù Face ID báo lỗi, hoặc ấn vân tay chục lần thì hụt cả chục. Màn hình cứ liên tục hiện dòng chữ "Try again" trong vô vọng

### 🚀 2.4 Meta Hiện Tại: Đa Nghi Tột Độ

Vì cả 3 hệ trên đều có kẽ hở chí mạng, các kỹ sư bảo mật đã đẻ ra những biện pháp phòng thủ kín kẽ hơn:

* **MFA (Multi-factor Authentication):** Trò kết hợp các phương thức trên lại với nhau. Gõ đúng mật khẩu rồi vẫn chưa xong, hệ thống bắt mở điện thoại ra nhập thêm cái mã OTP thì mới cho vào. Hơi phiền phức một chút nhưng tối ngủ ngon.
* **Passwordless (FIDO2):** Tiêu chuẩn mới nhằm khai tử hoàn toàn mật khẩu. Sử dụng thẳng thiết bị phần cứng hoặc sinh trắc học để xác thực. Không có mật khẩu thì kẻ tấn công cũng chẳng có cơ sở nào để mà dò đoán.
* **Zero-Trust:** Tôn chỉ cao nhất của sự đa nghi — "Không tin một ai, luôn luôn xác minh" (Never trust, always verify). Cho dù bạn đang cắm cáp LAN ngồi ngay trong mạng nội bộ của công ty, hệ thống vẫn coi bạn là một mối đe dọa từ bên ngoài và liên tục đòi xác thực ở mọi ngóc ngách bạn chạm tới.

![auth](/images/image.png)

---
---

> Vượt qua được cái khung đăng nhập chỉ chứng minh bạn có "vé vào cổng", nhưng mua vé hạng bét (Guest) hay vé V.I.P (Admin) thì bây giờ hệ thống mới bắt đầu phân loại. Đây là lúc máy chủ lôi cái Ma trận Phân quyền (Access Control Matrix) ra để xem bạn được phép Đọc (Read), Ghi đè (Write) hay Thực thi (Execute) cái gì.

## 3. Cửa Ải 2: Access Control (Mày được làm trò gì ở đây?)

 Việc bạn được làm "Bố đời" hay chỉ là culi đứng nhìn màn hình phụ thuộc hoàn toàn vào 4 mô hình quản trị (AC Policies) sau đây:

### 🤝 3.1 DAC (Discretionary Access Control): Chủ nhà tự quyết, dân chủ quá trớn

* **Bản chất:** Ai là người "đẻ" ra cái file/thư mục đó, người đó làm cha. Người tạo (Owner) có toàn quyền sinh sát, thích cấp quyền cho ai thì cấp.
* **Skill issue điển hình:** Vì lười cấu hình từng chút một, bạn cấp quyền Edit một file tài liệu quan trọng cho một đồng nghiệp, và người đồng nghiệp đó vui tay ném luôn cái link chia sẻ công khai cho cả công ty. Dân chủ quá thành ra mất kiểm soát!

### 🪖 3.2 MAC (Mandatory Access Control): Quân luật thép

Dẹp bỏ sự dân chủ lỏng lẻo của DAC, hệ thống MAC sinh ra dành cho giới quân đội và tình báo. Bạn là ai không quan trọng, quan trọng là hệ thống gắn cho bạn cái "mác" (Label) gì: Từ Không phân loại (Unclassified) đến Tối mật (Top Secret).

**Mô hình Bell-LaPadula (BLP):** Sinh ra để bảo vệ độ "kín" của dữ liệu (Confidentiality). Hoạt động theo hai chân lý:
* *No read up:* Lính quèn thì đừng hòng ngó lên đọc tài liệu mật của cấp trên.
* *No write down:* Cấp trên có bí mật thì cấm tuyệt đối không được tuồn rò rỉ xuống cho lính, nội bất xuất ngoại bất nhập.


**Mô hình Biba:** Trái ngược với BLP, mô hình này bảo vệ tính toàn vẹn (Integrity). Chân lý ở đây là cấm tuyệt đối việc dữ liệu rác từ các cấp thấp trôi ngược lên làm vấy bẩn các tài liệu quan trọng ở thượng tầng.

### 👔 3.3 RBAC (Role-Based Access Control): Làm quan được húp

Đây là chân ái của các doanh nghiệp và là "bùa cứu sinh" cho mấy anh IT Support. Thay vì đi cấp quyền lắt nhắt cho từng cá nhân, hệ thống sẽ gán quyền theo Chức vụ (Roles).

* **Thực tế hoạt động:** Y hệt như việc xếp rank trong LoL. Bạn là thực tập sinh (Hạng Sắt), bạn chỉ được quyền xem tài liệu. Bạn cày cuốc lên làm Trưởng phòng (Thách Đấu), bạn được cấp quyền xóa và sửa.
* Khi có nhân viên mới hoặc ai đó chuyển phòng ban, Quản trị viên chỉ việc nhấc tên người đó thả vào đúng cái "Role" tương ứng là xong. Tiết kiệm công sức thao tác, setup 1 lần xài cả đời.

### 🎭 3.4 ABAC & Chinese Wall

* **ABAC (Attribute-Based Access Control):** Kẻ hủy diệt của sự cứng nhắc. Mô hình này xét duyệt quyền dựa trên một đống các thuộc tính: Thuộc tính của bạn (Bạn làm chức gì?) + Thuộc tính của file (File này có nhạy cảm không?) + Thuộc tính môi trường (Bây giờ là mấy giờ? Đang dùng wifi công ty hay mạng quán net?). Phải thỏa mãn đủ nguyên cái combo đó thì mới được cấp quyền.
* **Chinese Wall (Conflict of Interest):** Chính sách sinh ra để chống mấy thành phần "bắt cá hai tay". Luật rất đơn giản: Một khi bạn đã được cấp quyền truy cập vào dữ liệu của Dự án A, hệ thống sẽ tự động block ngay lập tức đường vào Dự án B (đối thủ của A). Đừng hòng làm gián điệp hai mang!

![Security-meme.png](/images/Security-meme-3.png)

---
---

> Lý thuyết "mõm" nãy giờ chắc mấy anh em chầm cảm hết rồi phải không? Mấy cái mô hình quân đội với tình báo nghe thì oách đấy, nhưng nếu không biết gõ phím thì cũng chỉ là chém gió qua ngày. Giờ là lúc vứt mớ giáo trình sang một bên, mở Terminal lên và chứng minh ai mới là "Bố đời" thực sự của cái server này.

## 4. Múa phím Time 💻

Dưới đây là sân nhà của ae đang cắm IuseArchbtw hay Linux nói chung, còn mấy dân chơi hệ Windows thì... ráng click chuột cho lẹ tay nhé.

### 🐧 4.1  Change Mode server production ko cần ủ tê

Trong Linux, `chmod` (Change Mode) chính là cây đũa phép. Bạn dùng nó để ban phát quyền Đọc (Read - `r`), Ghi (Write - `w`), Thực thi (Execute - `x`) cho 3 giai cấp: User (Chủ), Group (Băng đảng), và Others (Những thằng ất ơ còn lại).

```bash
chmod -R 777 /thu_muc_cua_cong_ty
```

* **Dịch sang tiếng Việt:** "Vào đi các anh em cõi mạng, cửa server nhà em mở toang, két sắt không khóa, data dọn sẵn trên mâm mời xơi!".
* **Kết cục:** Nó ban phát full quyền `rwx` cho toàn bộ sinh vật trên Trái Đất. Cứ mạnh dạn gõ thử lệnh này trên server Production của công ty đi, tôi hứa sáng mai bạn sẽ được HR gọi lên uống trà và nhận đơn đuổi việc thẳng tay. Nhanh gọn, không đau đớn, "cook" ngay lập tức!

Nếu muốn thể hiện mình là dân pro, hãy nhìn vào cái lệnh : `chmod 4762 myfile`. Trông như mã nạp thẻ Garena đúng không? Thật ra nó là combo kẹp chả của các quyền đặc biệt:

* **SetUID (số 4):** Cho phép một thằng culi chạy file dưới tư cách của chủ nhân (Kiểu mượn oai hùm, cầm ấn tín của sếp đi thị uy).
* **Sticky Bit:** Áp cái này lên thư mục thì dù người ta có quyền ghi (write), họ cũng **không thể xóa** file của thằng khác. Khắc tinh cứng của mấy thành phần "tao ghét mày nên tao xóa file của mày cho bõ tức".

### ✂️ 4.2 Cắt Mịn Phân Quyền Bằng ACL (Access Control List)

Dùng `chmod` thì hơi "chóp bu" vì nó chỉ cấp quyền theo cục to. Lúc này ta cần `setfacl` (cài quyền) và `getfacl` (check quyền) để tỉa tót mượt mà hơn.

**Ví dụ:** Bạn có một thư mục `tai_lieu_hoc_tap_210_chap_FHD` (chứa gì thì tự hiểu). Bạn muốn cấp quyền cho thằng cốt của bạn (user:abc) vào xem, nhưng muốn block thẳng cổ ông sếp tính hay hóng hớt tên user là `sep_ngu`.
Gõ ngay dòng lệnh này:

```bash
setfacl -m u:sep_ngu:--- /tai_lieu_hoc_tap_210_chap_FHD
```

Bùm! User Sếp đẹp zai sẽ nhận ngay cú tát "Access Denied" siêu to khổng lồ vào mặt. Tham vọng tọc mạch bị bóp nghẹt, còn bạn thì chui vào góc tủ hú hí với mớ tài liệu của mình an toàn tuyệt đối!

### 🪟 4.3 Windows thì sao?

 Hầu hết dân tình sẽ chọn lối đi bình yên: Click chuột phải -> `Properties` -> `Security` -> Bấm `Edit` rồi check/uncheck mấy cái ô tick box như mấy bà thím đi siêu thị lựa rau. Hoặc có thể mở Command Prompt hay PowerShell lên và múa các lệnh `net` (như `net user`, `net localgroup`) để thao túng ACL. Vẫn là cấp quyền thôi, nhưng màn hình chạy ra một đống chữ trắng trên nền đen nhìn nó vẫn cứ là hacker lỏ hơn hẳn việc kéo thả con chuột.


![chmod777](/images/chmod777.jpg)
---

## 🏁 Chốt Sổ: đừng tin bố con thằng nào
1. Đừng bao giờ đẻ ra cái pass `admin123` rồi tự hỏi tại sao tiền điện tử trong máy bay màu.
2. Từ bỏ ngay tư tưởng `chmod 777` để gánh lỗi lười biếng.
3. Luôn luôn bật mode **Zero-Trust**: Không tin bố con thằng nào hết, kể cả khi thằng đó tự xưng là "Support IT xịn".

## END BLOG

Baobei à, tới đây hiểu được bao nhiêu rồi… hay vẫn đang loading vậy? 🤡

Không sao, tôi cũng không hiểu hết — chỉ là giả vờ bình tĩnh thôi.

Lý thuyết thì rườm rà nhưng lơ ngơ một phát là dữ liệu bốc hơi. Hãy tự khóa chặt cửa nhà mình trước khi để cuộc đời phải dạy e bài học về "Skill Issue" nhé!

Anyways cya in the next chaos 💀
