---
title: " Cryptography 101 - Brain.exe Has Been Encrypted"
date: "2026-05-06"
description: "Đọc cho vui, hiểu được là bonus."
tags: ["InfoSec", "Cryptography", "Cybersecurity"]
level: "BRAIN_ENCRYPTED"
---

> "Cryptography is like making a sandwich. You put the data in, add some math magic, and hope nobody else can figure out it's just plain text covered in spaghetti code." 🥪

Dưới đây là phần đầu tiên về Information Security - Introduction to Cryptography. Đọc kỹ để không bị trầm cảm khi nhìn thấy những đoạn mã dài như sớ táo quân nhé.

## 1.1 Mật mã học là cái quái gì? (The Basics)

Nếu bạn đã từng suy nhược cơ thể vì ngồi giải mã một đoạn text toàn ký tự ngoằn ngoèo thì chúc mừng, bạn đã chạm ngõ Cryptography. Về mặt học thuật, Mật mã học là kỹ thuật bảo vệ thông tin và giao tiếp thông qua việc sử dụng các bộ mã (codes). Mục đích tối thượng của nó là đảm bảo chỉ những "người có phận" (những ai được cấp quyền, hoặc là đối tượng mà thông tin muốn hướng tới) mới có thể hiểu và xử lý được đống dữ liệu đó. 

Nói một cách đơn giản: Mật mã học sinh ra để đấm vào mặt những kẻ tò mò, ngăn chặn triệt để các hành vi truy cập trái phép (preventing unauthorized access). Nó y hệt như cách bạn đặt pass điện thoại 69 lớp để giấu đi cái lịch sử tìm kiếm bất ổn của mình vậy.

Về mặt ngữ vựng, cái tên này bắt nguồn từ tiếng Hy Lạp: tiền tố "crypt" có nghĩa là giấu (hidden), còn hậu tố "graphy" có nghĩa là viết (writing). Viết mà phải giấu đi thì 1 là tài liệu mật quốc gia, 2 là lịch sử duyệt web lúc 12 giờ khuya, 3 là lịch sử hỏi chatgpt thôi 🐧.

### 📜 1.2 Lịch sử "tiến hóa" (Từ đồ đá đến thời đại số)
Bộ môn "giấu chữ" này không phải tự dưng từ trên trời rơi xuống mà đã tồn tại và hành hạ nhân loại hơn 3000 năm rồi.
*   **Mật mã cổ điển (Classical cryptography):** Thời xa xưa khi chưa có AI gánh code, đối tượng mã hóa chỉ là các chữ cái (characters). Việc mã hóa hay giải mã thời này toàn chạy bằng "cơm" (làm thủ công) hoặc bấu víu vào các nguyên lý cơ học (mechanical principles). Nó thường xuyên được ứng dụng trong quân sự (military). Một ví dụ uy tín nhất chính là cỗ máy Enigma (chứa một loạt các trục xoay - rotors) mà quân đội Đức đã xài mòn cả nút trong Thế chiến II.

![Enigma machine](/images/Enigma_machine_main.jpg)

*   **Mật mã hiện đại (Modern cryptography):** Mọi thứ sang trang từ những năm 1970, khi kỷ nguyên máy tính và công nghệ thông tin chính thức bùng nổ. Dữ liệu giờ đây không phải là ghép chữ nữa mà được xử lý bởi máy tính dưới dạng các bit (0 và 1). Bộ môn này len lỏi vào mọi ngóc ngách của đời sống, áp dụng siêu rộng rãi, đặc biệt là gánh còng lưng các giao dịch điện tử (electronic transactions). 

### 🔑 1.3 Cửu Âm Chân Kinh: 5 Thuật ngữ cốt lõi 
Đây là đồ nghề cơ bản, ra đường không thuộc mấy từ này thì... thôi vậy:

1.  **Plaintext (Bản rõ):** Là thông điệp gốc, phần dữ liệu nguyên thủy được đưa vào thuật toán để làm đầu vào (input). Thông điệp này là thứ mà con người đọc phát hiểu liền (intelligible message). Ví dụ: *"Bảo bối ăn cơm chưa?"*
2.  **Ciphertext (Bản mã):** Là mớ rác rưởi lộn xộn (scrambled message) được nhả ra ở đầu ra (output). Nó là kết quả oan trái sinh ra từ sự pha trộn giữa Plaintext và Secret Key. Nhìn vào chỉ thấy một bầu trời lú não, kiểu như "*$R#U%g@y^&*!*".
3.  **Secret key (Khóa bí mật):** "Chìa khóa vàng", nó cũng là một đầu vào thiết yếu của thuật toán mã hóa. Cái key này tự do tự tại, nó mang giá trị hoạt động hoàn toàn độc lập với Plaintext và bản thân thuật toán. Mất key thì coi như bạn mất tất cả.
4.  **Encryption algorithm (Thuật toán mã hóa):** Cỗ máy xay sinh tố tàn nhẫn. Nó nhận Plaintext và Key rồi thực hiện hàng loạt các phép thay thế (substitutions) và biến đổi (transformations). 
5.  **Decryption algorithm (Thuật toán giải mã):** Về cơ bản, nó chính là thuật toán mã hóa nhưng bị ép chạy tua ngược (run in reverse). Ném Ciphertext và Secret key vào, nó sẽ ma giáo khôi phục lại Plaintext gốc ban đầu. Tất nhiên, ném sai key thì kết quả nhận được vẫn là một bãi rác vô nghĩa.

### 🌍 1.4 Ứng dụng thực tế: Đấng cứu thế của Internet
Bạn tưởng học Cryptography chỉ để múa phím lòe thiên hạ cho ngầu? Không, nó đang âm thầm bảo vệ mớ tài khoản mạng xã hội và những tin nhắn "bất ổn" của bạn mỗi ngày thông qua các giao thức:
*   **IPSec (Internet Protocol Security):** Một tập hợp các giao thức hoạt động ở tầng Network (Network layer của OSI). Nó sinh ra để bảo vệ tính bảo mật (confidentiality) và toàn vẹn (integrity) của luồng dữ liệu khi băng qua mạng.
*   **PGP (Pretty Good Privacy):** Nghe tên "khá tốt" nhưng thực ra nó là trùm. Sử dụng mã hóa Public Key, đây là một trong những hệ thống mã hóa được nhận diện rộng rãi nhất thế giới. Giang hồ mạng thường dùng nó để bảo vệ quyền riêng tư cho E-mail và dữ liệu.
*   **SSL (Secure Sockets Layer):** Vị thần hộ mệnh do Netscape đẻ ra từ giữa những năm 1990. Nó nhanh chóng trở thành cơ chế tiêu chuẩn để trao đổi dữ liệu an toàn trên các kênh đầy rẫy cạm bẫy (insecure channels) như Internet. Không có nó thì thông tin thẻ tín dụng của bạn khi chốt đơn Shopee đã bay màu trong 1 nốt nhạc.
*   **Ngoài ra còn có:** PKI (Cơ sở hạ tầng khóa công khai), Digital certificates (Chứng chỉ số), Authentication (Xác thực), E-commerce (Thương mại điện tử), thuật toán RSA, MD-5, SHA (Secure Hash Algorithm) và SSH. Nghe 1 nùi học thuật vậy thôi chứ đi sâu vào thì... nó còn khó hiểu hơn nữa 🤡.

---

---

> Tiếp nối phần 1 sặc mùi lý thuyết hàn lâm, phần này chúng ta sẽ chuyển kênh sang chế độ "Dảrk Dảrk". Chúng ta sẽ đi tim hiểu cách mà các pháp sư mạng bẻ khóa (Break a cipher) và các loại "võ công" trong ngành mật mã. Chuẩn bị tinh thần để não nhảy số nha cục cưng !


## 2.1 Mục tiêu tối thượng của việc "Phá mã" (Break a cipher)
Hacker rảnh rỗi sinh nông nổi đi phá mã của bạn để làm gì?
*   **Mục tiêu 1:** Tìm cho ra cái Plaintext (văn bản gốc) từ đống Ciphertext (văn bản mã hóa) lộn xộn đó.
*   **Mục tiêu 2 (Trùm cuối):** Khui ra được cái Secret Key (Khóa bí mật). Vì một khi đã vớ được cái key này, attacker có thể ngồi rung đùi giải mã **TOÀN BỘ** dữ liệu mà bạn đã từng (hoặc sẽ) mã hóa bằng cái key đó. Mất key là mất cả chì lẫn chài.

## 2.2 Tứ Đại Môn Phái Tấn Công (Attack types on Encryption)
Để đạt được 2 mục tiêu trên, giang hồ thường chia làm 4 hệ phái chính:

1.  **Hệ Trâu Bò (Brute-force attack):** Phương châm là "Cần cù bù thông minh". Attacker sẽ đem **TẤT CẢ** các key có thể ra để thử từng cái một cho đến khi nào ra chữ đọc được thì thôi. *Sự thật phũ phàng:* Theo toán học, trung bình bạn sẽ phải thử ít nhất một nửa (half of all possible keys) thì mới trúng số. Đợi thử xong chắc server mọc rêu.
2.  **Hệ Não To (Cryptanalysis - Thám mã):** Phái này không dùng sức, họ dùng não. Họ sẽ ngồi soi mói, phân tích đặc điểm của thuật toán (algorithm) và các đặc tính của dữ liệu (data characteristics) để tìm ra lỗ hổng. Dựa vào đó, họ sẽ đoán được Plaintext hoặc mò ra được Key mà không cần thử mù quáng.
3.  **Hệ Ăn Vạ (Implementation attacks):** Không đánh trực diện vào thuật toán vì thuật toán quá hoàn hảo. Phái này đánh vào **lúc triển khai thuật toán**. *Ví dụ:* Phân tích kênh kề (Side channel analysis) - đo xem máy tính của bạn tiêu thụ bao nhiêu điện, tản ra bao nhiêu nhiệt, hay mất bao lâu để mã hóa. Từ các thông số vật lý đó, hacker lôi ra được cái Key. Ảo ma chưa?
4.  **Hệ Lùa Gà (Social-engineering attacks):** Đây mới là kỹ năng đáng sợ nhất. Hacker chẳng thèm gõ dòng code nào. Họ "hack bằng mồm". Gọi điện bảo: *"Alo Vũ à Vũ, anh D bên bộ công an đây, hệ thống em đang bị tấn công, vui lòng cung cấp mật khẩu để bảo vệ..."* Thế là xong.

---

## 2.3 Các "Kĩ lăng" của phái Não To (Types of Cryptanalytic attacks)
Nếu attacker chọn theo phái Cryptanalysis (Thám mã), họ sẽ có 5 mode chơi từ Dễ đến Địa Ngục. Điểm chung của cả 5 mode này là: **Hacker mặc định đã biết trước Thuật toán mã hóa (Encryption algorithm) và đang cầm trong tay bản mã (Ciphertext)**.

*   **Mode 1: Ciphertext Only (Chỉ có bản mã):** Chế độ Hardcore. Attacker chỉ có mỗi cái văn bản rác rưởi (Ciphertext) và phải tự bơi để tìm ra bản rõ.
*   **Mode 2: Known Plaintext (Biết trước một ít bản rõ):** Mode này dễ thở hơn. Nạn nhân vô tình rò rỉ một hoặc nhiều cặp thông điệp (Plaintext - Ciphertext) được tạo ra bởi cùng một Key. Từ dữ liệu đối chiếu đó, hacker tìm ra Key. *(Ví dụ: Biết thừa mail nào của sếp cũng kết thúc bằng chữ "Trân trọng," nên lấy đó làm mỏ neo để giải mã)*.
*   **Mode 3: Chosen Plaintext (Plaintext được chọn):** Mode này hacker chủ động gài bẫy. Hacker đưa cho nạn nhân một thông điệp do chính hacker soạn (Plaintext) và dụ nạn nhân mã hóa nó bằng Secret key của họ, sau đó trả lại bản mã (Ciphertext) cho hacker. Dựa vào đầu vào tự chọn và đầu ra nhận được, hacker mò ra Key.
*   **Mode 4: Chosen Ciphertext (Ciphertext được chọn):** Ngược lại với Mode 3. Hacker có một đoạn mã (Ciphertext) tự chế, dụ dỗ hệ thống của nạn nhân giải mã nó ra Plaintext bằng Secret key của nạn nhân. Hệ thống trả về Plaintext, và bùm, hacker phân tích ngược lại để lấy Key.
*   **Mode 5: Chosen Text (Tất tay):** Là combo của Mode 3 và Mode 4. Hacker được quyền ném vào hệ thống cả Plaintext lẫn Ciphertext tự chọn và bắt hệ thống xử lý. Lỗ hổng sẽ bị phơi bày.

---

## 2.4 Lớp giáp thế nào thì gọi là "Trâu"? (Cipher Strength)
Sự thật là không có cái mã nào bất bại vĩnh viễn trước thời gian và sự tiến hóa của máy tính. Một thuật toán được đánh giá là "mạnh" (Strong algorithm) khi nó đáp ứng được ít nhất 1 trong 2 tiêu chí cảm lạnh sau:

1.  **Phí hack đắt hơn giá trị dữ liệu:** Chi phí (tiền bạc, máy móc, điện năng) bỏ ra để bẻ khóa vượt quá giá trị của thông tin lấy được. *(Ví dụ: Bỏ ra 1 tỷ mua siêu máy tính để hack cái tài khoản ngân hàng... còn đúng 50 cành)*.
2.  **Hack xong thì dữ liệu đã hết date:** Thời gian cần thiết để phá mã lâu hơn tuổi thọ hữu ích của thông tin đó. *(Ví dụ: Mất 1 năm để giải mã tin nhắn của crush... trong khi ngày hôm sau khi bắt đầu giải thì crush đã đi lấy chống và tin nhắn có nghĩa là "e chỉ xem a là bạn")*.

### 💪 Flex sức mạnh: Lớp giáp nào là "Bất tử"?
Giả sử bạn cướp được một siêu máy tính của NASA, có tốc độ test key bàn thờ là 1 triệu lượt giải mã mỗi micro-giây (`10^6 decryptions/μs`). Hãy xem sự khác biệt:

*   **Hệ "Giẻ rách" - Key 56-bit (Thuật toán DES):** 
    *   Không gian khóa có khoảng `7.2 x 10^16` keys (72 triệu tỷ keys). 
    *   Trông số to thì có vẻ nguy hiểm, nhưng với siêu máy tính trên, nó quét sạch sành sanh chỉ trong vỏn vẹn **10.01 giờ**. Sáng cắm máy, chiều đi làm về ăn 3 tô cơm là lụm được data. Quá lởm!
*   **Hệ "Kẻ hủy diệt" - Key 128-bit (Thuật toán AES):** 
    *   Không gian khóa phình to lên mức `3.4 x 10^38` keys. 
    *   Khúc này ảo ma này: muốn Brute-force vét cạn đống này, siêu máy tính của bạn phải chạy liên tục 100% công suất trong **5.4 x 10<sup>18</sup> NĂM** (5.4 tỷ tỷ năm). Tức là Mặt Trời nổ tung, vũ trụ sụp đổ rồi reset lại thêm mấy chục vòng nữa thì cái máy tính vẫn đang ngồi báo `Loading 1%...`.

  ![Cipher-Strength](/images/cipher_strength.png)

---

## 2.5 Gia phả nhà Mật mã học (Taxonomy of Cryptography)
Để tránh bị lú trước muôn vàn loại mã hóa, giới học thuật đã phân loại chúng theo 3 "hệ tư tưởng" chính:

### Theo phép toán (Type of operations): 
*   **Substitution (Thay thế):** Là kỹ thuật lấy cái này thay bằng cái kia. (Ví dụ: Chữ 'A' đổi thành số '1', chữ 'B' đổi thành icon '💀').
*   **Transposition (Hoán vị):** Chữ cái không bị thay đổi, chỉ bị tráo đổi vị trí đứng lộn xộn lên (kiểu như xào bài).

### Theo số lượng Khóa (Number of keys):
*   **Symmetric (Đối xứng):** Còn gọi là single-key, secret-key hay conventional encryption. Dùng đúng 1 cái chìa khóa chung (Secret key) để vừa khóa cửa vừa mở cửa.
*   **Asymmetric (Bất đối xứng):** Còn gọi là two-key hay public-key encryption. Hệ này dùng 1 cặp chìa khóa (Public key và Private key) như đã nói ở phần 1.

### Theo cách nhai dữ liệu (Way in which plaintext is processed):
*   **Block cipher (Mã hóa khối):** Thuật toán chia Plaintext ra thành từng "cục" (block) có kích thước cố định rồi mới nhai từng cục một.
*   **Stream cipher (Mã hóa luồng):** Dữ liệu tuôn ra như dòng nước thì thuật toán xử lý mã hóa liên tục từng bit/byte một ngay tại thời gian thực.

---
---

>"Mã hóa cổ điển giống như việc bạn cố giấu quỹ đen dưới gầm giường. Bạn tưởng nó an toàn, cho đến khi 'nóc nhà' dùng chổi quét nhà và lôi nó ra trong 1 nốt nhạc. 🧹💸

## 3.1 Kỹ thuật Thay Thế (Substitution) - Môn phái "Treo Đầu Dê Bán Thịt Chó"
Nguyên lý của môn phái này cực kỳ giang hồ: Chữ gốc (Plaintext) sẽ bị "bắt cóc" và thay thế bằng một chữ cái khác, hoặc bằng số, hoặc bằng một ký hiệu ất ơ nào đó. Tóm lại là đánh tráo khái niệm hoàn toàn.

### 1. Caesar Cipher (Mật mã quốc dân thời La Mã)
*   **Tiểu sử:** Do cụ Julius Caesar phát minh, đây là hệ mã hóa thay thế lâu đời nhất và... "lỏ" nhất được biết đến.
*   **Cách hoạt động:** Lấy từng chữ cái trong thông điệp gốc rồi dịch chuyển (shift) nó đi một khoảng `k` bước trong bảng chữ cái (với `k` chính là Key).
    *   *Ví dụ:* Nếu Key `k = 3`, thì chữ `A` sẽ bị thay bằng chữ `D`, chữ `B` biến thành chữ `E`.
    *   *Công thức học thuật:* Mã hóa là `C = (p + k) mod 26`, Giải mã là `p = (C - k) mod 26`. (Cái chữ "mod 26" ý bảo là dịch quá chữ Z thì xoay vòng lại chữ A).
*   **Cách phá giải (Cryptanalysis):** Bị vả sấp mặt bởi hệ Trâu Bò (Brute-Force). Vì bảng chữ cái tiếng Anh chỉ có 26 chữ, nên thuật toán này chỉ có đúng vỏn vẹn **25 keys** để thử. Nhập bừa từ 1 đến 25, chưa đầy 1 phút là lộ nguyên hình đoạn chat gốc.

![Caesar](/images/caesarcipher.png) 

### 2. Monoalphabetic Ciphers (Độc Bảng - Tưởng trâu mà phế)
*   **Cách hoạt động:** Khắc phục sự lởm của Caesar, hệ này không dịch chuyển tịnh tiến nữa mà gán một cách hoàn toàn random (ngẫu nhiên). Chữ A thích thì đổi thành chữ Z, chữ B đổi thành chữ Q, không theo quy luật khoảng cách nào cả. 
*   **Độ "Ảo tưởng":** Nhờ trò gán random này, không gian khóa (key space) nổ tung lên con số **26!** (tương đương `4 x 10^26` keys). Có thách kẹo hacker cũng không dám dùng Brute-Force để thử.
*   **Cách phá giải:** Tưởng mình là trùm cuối cho đến khi đụng độ **Thầy Phong Thủy (Phân tích tần suất - Frequency Data)**. 
    *   Ngôn ngữ nào cũng có thói quen. Trong tiếng Anh, chữ `e`, `t`, `a` xuất hiện nhan nhản như deadline cuối tháng vậy.
    *   Các cụm 2 chữ (diagram) như `th`, `an`, `ed` hay cụm 3 chữ (trigram) như `the`, `ing`, `est` cũng lặp lại liên tục.
    *   Hacker chỉ cần đếm xem ký tự ma giáo nào xuất hiện nhiều nhất trong bản mã, rồi ốp nó vào chữ `e` hoặc `th`. Suy luận một lúc là rụng sạch.

![Monoalphabetic](/images/Monoalphabetic.png) 

### 3. Playfair Cipher (Ma trận tình yêu 5x5)
Phát minh bởi cụ Sir Charles Wheatstone (nhưng lại lấy tên bạn ổng là Baron Playfair). Đây là hệ thống mã hóa tiêu chuẩn của quân đội Anh và Mỹ hồi Thế chiến.
*   **Cách hoạt động:** Thuật toán này không mã hóa từng chữ rác rưởi nữa, mà nó "bóp cổ" **từng cặp 2 chữ cái (digrams)** một lúc.
*   **Xây map (Tạo ma trận 5x5):** Nạp một Keyword vào ma trận 5x5 từ trái sang phải, từ trên xuống dưới (chữ nào lặp lại thì bỏ qua), sau đó điền nốt các chữ cái còn thiếu trong bảng alphabet vào ô trống (chữ I và J bị nhốt chung 1 ô cho đủ 25 ô).
*   **Quy tắc chơi:**
    1.  Nếu cặp 2 chữ bị trùng nhau (vd: `balloon` -> `ba lx lo on`), phải nhét ngay một chữ cái "độn" (như chữ `X`) vào giữa.
    2.  Nếu 2 chữ nằm **Cùng Hàng**: Thay bằng chữ bên cạnh (bên phải).
    3.  Nếu 2 chữ nằm **Cùng Cột**: Thay bằng chữ ngay bên dưới nó.
    4.  Nếu **Khác hàng, khác cột**: Lấy 2 chữ đó làm 2 góc của một hình chữ nhật, rồi thay bằng 2 chữ ở góc đối diện. Lú chưa? 🤯
*   **Độ an toàn:** Cải thiện cực mạnh vì giờ hacker phải ngồi phân tích tần suất của `26 x 26 = 676` cặp digrams. Nhưng tin buồn: Nếu túm được khoảng vài trăm chữ, nó vẫn bị bẻ khóa như thường vì bản chất cấu trúc ngôn ngữ vẫn còn đó.

![playfair](/images/playfair.webp) 


### 4. Polyalphabetic Ciphers / Vigenère (Đa bảng - Rối loạn tiền đình)

*   Đây là đỉnh cao của sự lươn lẹo. Vigenère Cipher thực chất là việc bạn cầm **26 cái mã Caesar** gộp lại với nhau thành một cái bảng ma trận siêu to khổng lồ.
*   **Cách hoạt động:** Bạn cần một Keyword. Keyword này sẽ được lặp đi lặp lại cho đến khi độ dài bằng đúng với đoạn Plaintext. 
    *   Mỗi chữ cái trong Keyword sẽ quyết định xem bạn phải dùng hàng Caesar thứ mấy. 
    *   Ví dụ để mã hóa: Gióng hàng ngang chứa chữ cái của Key, cắt với cột dọc chứa chữ cái của Plaintext -> Chữ thập phân ở giữa chính là Ciphertext.
    *   Để giải mã (Decryption): Tìm chữ cái của Key ở cột ngoài cùng bên trái, gióng theo hàng ngang tìm xem chữ cái mã hóa (Ciphertext) đang nằm ở đâu, rồi gióng thẳng lên trên cùng để lấy lại Plaintext gốc. Càng làm nhiều mắt càng lác.

![vigenere](/images/vigenere.png) 
---

## 3.2 Kỹ thuật Hoán Vị (Transposition) - Nghệ Thuật "Xào Bài"

Khác với Substitution đổi chữ này thành chữ kia, hệ Transposition giữ nguyên "đội hình" chữ cái, nhưng nó **đảo lộn vị trí (permutation)** của các chữ cái lên thành một đống bùi nhùi. Chữ `A` vẫn là chữ `A`, nhưng nó chạy tít ra cuối câu.

### 1. Rail fence (Hàng Rào Lỏ)
*   Là cái thuật toán hoán vị đơn giản nhất quả đất. 
*   **Cách hoạt động:** Đem thông điệp gốc viết zíc-zắc (đường chéo) xuống các dòng, rồi đọc ngang từng dòng một để ghép thành bản mã. 
*   *Ví dụ với độ sâu 2 hàng (depth 2, k=2)*: 
    Chữ "meet me after the toga party" viết thành:
    `m e m a t r h t g p r y`
    ` e t e f e t e o a a t`
    Bản mã thu được sẽ là nối 2 dòng đó lại: `MEMATRHTGPRYETEFETEOAAT`. Kẻ địch đọc xong chắc tưởng bạn đang gõ bàn phím bằng cùi chỏ.

### 2. Kỹ thuật Hình Chữ Nhật / Cột (Rectangle/Columnar Transposition)
Một version "căng cực" hơn của xào bài.
*   **Cách hoạt động:** Viết thông điệp từ trái qua phải, từng hàng từng hàng một vào trong một khung hình chữ nhật.
*   Sau khi viết xong, bạn không đọc theo hàng ngang nữa, mà đọc xuất dữ liệu ra theo **hàng dọc (column by column)**.
*   Và đây là điểm ăn tiền: Bạn phải **hoán đổi thứ tự các cột** trước khi xuất ra. Thứ tự đọc cột lúc này chính là cái Secret Key của thuật toán.
*   *Ví dụ:* Key là `4 3 1 2 5 6 7`. Thay vì đọc cột 1 trước, bạn sẽ đọc hết dọc cột có số `1` (cột thứ 3), rồi đến cột có số `2` (cột thứ 4)... Cứ thế trộn lên. Nhìn bản mã output không khác gì bảng điểm danh lớp bị lỗi font.

---
---

> Public Key của bạn giống như cái username Facebook, ai cũng có thể thấy. Còn Private Key thì giống như lịch sử chat lúc 3h sáng của bạn vậy... lộ ra là bạn mất hết. 💀🗝️

Tạm biệt thời kỳ đồ đá của cụ Caesar, chào mừng anh em đến với thế giới Mật mã học Hiện đại (Modern Cryptography). Dưới đây là những khái niệm đã và đang gánh còng lưng toàn bộ nền kinh tế Internet, từ mua hàng Shopee đến nạp thẻ game. Tập trung cao độ nhé, khúc này não dễ bị "Kernel Panic" lắm!


## 4.1 Cặp kỳ phùng địch thủ: Đối xứng vs Bất đối xứng
Người ta chia hệ thống mã hóa hiện đại làm 2 trường phái chính dựa trên số lượng chìa khóa (keys). 

### Mã hóa Đối xứng (Symmetric Encryption) - Hệ "Chìa độc nhất"
*   **Đặc điểm:** Dùng chung **DUY NHẤT 1 khóa (Secret key)** cho cả hai quá trình: mã hóa (encryption) và giải mã (decryption).
*   **Quy trình:** Bạn bỏ Plaintext và Secret Key vào thuật toán mã hóa (VD: thuật toán DES) để tạo ra Ciphertext. Sau đó, gửi Ciphertext qua mạng. Bờ bên kia, người nhận dùng đúng cái Secret Key đó nhét vào thuật toán giải mã (thuật toán mã hóa chạy ngược) để lấy lại Plaintext.
*   **Vấn đề:** Nếu hacker ăn trộm được cái Secret Key này trên đường truyền thì... toang.

**Các gương mặt vàng trong làng Đối xứng:** Bọn này thường là Block cipher (Mã hóa khối), tức là chia dữ liệu thành từng khối có kích thước cố định (fixed-size blocks) rồi xử lý.
*   **DES (Data Encryption Standard):** Thuật toán đồ đá, block size 64 bits, key size vỏn vẹn 56 bits.
*   **Triple DES:** Nâng cấp của DES, key size 112 hoặc 168 bits.
*   **AES (Advanced Encryption Standard):** Trùm cuối hiện tại. Xử lý block size 128 bits, size khóa siêu to khổng lồ (128, 192 hoặc 256 bits).

![symmetric](/images/symmetric.webp) 

### Mã hóa Bất đối xứng (Asymmetric Encryption) - Trò chơi nhân phẩm 2 chìa
Hệ này (còn gọi là Public key cryptography) giải quyết bài toán lộ key bằng cách đẻ ra hẳn **2 cái chìa khóa** khác nhau. 

*   **Public - key (Khóa công khai):** Tung hê lên mạng, ai cũng có thể biết. Nó dùng để mã hóa tin nhắn (encrypt the message) hoặc để kiểm tra chữ ký của chủ nhân key (check the signature).
*   **Private - key (Khóa bí mật):** Sống để bụng chết mang theo, chỉ duy nhất chủ nhân biết. Nó dùng để giải mã (decrypt the message) hoặc tạo chữ ký (create the signature).

**Vì Vậy:**
> 
> 1.  **Muốn bảo mật (Confidentiality):** Dùng Public key của người nhận để MÃ HÓA -> Chỉ người nhận dùng Private key của họ mới GIẢI MÃ được.
> 2.  **Muốn xác thực (Authentication):** Dùng Private key của mình để KÝ -> Bất kỳ ai dùng Public key của mình cũng XÁC MINH được.

---

## 4.2 Hàm Băm (Hash Functions) - Cỗ máy xay thịt tàn nhẫn
Nếu mã hóa (Encryption) là ổ khóa có thể mở ra, thì Hàm Băm (Hash) là cái máy xay thịt. Thịt lợn thả vào máy xay sẽ ra thịt băm, nhưng bạn không thể lấy đống thịt băm đó nặn lại thành con lợn được. 

*   **Bản chất:** Hàm Hash nhận một đầu vào có độ dài bất kỳ (variable-length message), xay nhuyễn nó, và nhả ra một đoạn mã băm có độ dài cố định (fixed-length hash value / message digest). Thường độ dài dao động từ 128 đến 512 bits. 
*   **Mục đích tối thượng:** Đảm bảo tính toàn vẹn dữ liệu (data integrity).

**Đặc điểm nhận dạng của một Hàm Băm uy tín:**
1.  **Dễ tính toán:** Tính `H(m)` siêu lẹ.
2.  **Một chiều (One-way function):** Cho bạn mã hash `H(m)`, không có cách nào (hoặc cực kỳ khó) để dò ngược lại ra thông điệp `m` gốc ban đầu.
3.  **Kháng đụng độ yếu (Weak collision resistant):** Cho trước một thông điệp `m1`, đố bạn tìm ra một thông điệp `m2` khác (`m1 ≠ m2`) mà mã hash của chúng lại giống hệt nhau (`H(m1) = H(m2)`).
4.  **Kháng đụng độ mạnh (Strong collision resistant):** Đố bạn tìm ra được BẤT KỲ cặp thông điệp `m1`, `m2` nào khác nhau mà lại sinh ra cùng một mã hash.

**Ứng dụng thực tế (Lưu Passwords):**
Khi bạn đăng ký tài khoản, hệ thống KHÔNG lưu chữ "IloveYou123" của bạn vào database. Nó sẽ ném cái pass đó vào máy xay, tạo ra một mã hash (VD: `52E087...`) và lưu đoạn hash đó lại. Lần sau bạn đăng nhập, nó lại xay cái pass bạn vừa gõ, rồi đem so sánh 2 cục mã hash với nhau. Giống nhau thì cho vô (Access Granted), lệch 1 bit thì cook (Access Denied).

---

## 4.3 Chữ ký số (Digital Signatures) - Đóng dấu giáp lai phiên bản Digital
Ngày xưa ký khống hợp đồng bị đi tù, ngày nay ký số xớ rớ cũng đi tù như thường. Hệ thống mật mã triển khai Chữ ký số nhằm 2 mục đích:
1.  **Chứng minh nguồn gốc:** Bằng chứng thép cho việc một thông điệp thực sự xuất phát từ một user cụ thể (chứ không phải bị thằng nào hack nick chat bậy).
2.  **Toàn vẹn dữ liệu:** Đảm bảo thông điệp không bị sửa đổi (modified) trên đường đi giữa hai bên (in transit).



**Quy trình múa may của Chữ ký số:**
*   **Sir Vu Anbamia gửi thư cho Lord Dominicus de Khoga:** Sir Vu Anbamia lấy bức thư (plaintext) đem băm ra một cục Hash. Sau đó, Sir Vu Anbamia dùng **Private key của Sir Vu Anbamia** để mã hóa cục Hash đó -> Ta thu được **Chữ ký số (encrypted signed message)**. Sir Vu Anbamia gửi cả bức thư lẫn Chữ ký số sang cho Lord Dominicus de Khoga.
*   **Lord Dominicus de Khoga kiểm hàng:** Lord Dominicus de Khoga lấy **Public key của Sir Vu Anbamia** để giải mã chữ ký số, lòi ra cục Hash ban đầu. Đồng thời, Lord Dominicus de Khoga tự đem bức thư vừa nhận được bỏ vào máy băm để tạo ra cục Hash thứ hai.
*   **Đoạt mệnh:** So sánh 2 cục Hash. Giống nhau thì ký nhận (thư chuẩn Auth của Sir Vu Anbamia). Lệch nhau (dù chỉ một chút) thì đá đít từ chối (reject message) vì thư đã bị ai đó sửa giữa đường, hoặc thằng mạo danh gửi thư không có Private key của Sir Vu Anbamia.

### Trùm cuối: Certificate Authority (CA)
Làm sao Lord Dominicus de Khoga biết cái "Public key của Sir Vu Anbamia" thực sự là của Sir Vu Anbamia mà không phải của một thằng ất ơ nào đó giả mạo? Trả lời: Nhờ tổ chức chứng nhận (CA).
CA sẽ lấy thông tin ID của Sir Vu Anbamia và Public key của Sir Vu Anbamia (Unsigned certificate) đem băm lấy Hash. Sau đó CA lấy **Private key của CA** mã hóa cục Hash đó để tạo ra Chữ ký của CA. Vậy là ta có một **Chứng chỉ số đã ký (Signed certificate)**. Ai muốn xác minh thì cứ vác Public key của CA ra mà check. 

---
---

## 🏁 Tóm cái váy lại (The End of Suffering)

*   **Mã hóa cổ điển (Caesar, Vigenère...):** Giống như giấu quỹ đen dưới tấm nệm. Trông có vẻ bí mật và nguy hiểm, cho đến khi 'nóc nhà' lật giường lên quét dọn (dùng phân tích tần suất) và lôi nó ra trong 1 nốt nhạc.
*   **Mã hóa đối xứng (Symmetric - AES):** Bạn mua cái két sắt Titan xịn nhất thế giới, chống bom chống đạn. Nhưng bạn lại lỡ làm rơi cái chìa khóa (Secret Key) ở quán net. Thế là toang.
*   **Mã hóa bất đối xứng (Asymmetric - RSA):** Bạn phát cho mỗi đứa bạn một cái ổ khóa hở (Public Key) bảo chúng nó: *"Ai có nợ thì bỏ tiền vào hòm rồi bấm khóa lại nha"*. Bọn nó chỉ khóa được, còn chìa mở (Private Key) thì bạn giấu kỹ trong túi quần.
*   **Hàm băm (Hash):** Bạn ném một con lợn vào máy xay thịt. Đố bạn lấy đống thịt xay đó ghép lại thành con lợn đang kêu oăn oắt đấy? Nếu làm được thì bạn phá sập được nguyên cái Internet rồi.
___
___

## END BLOG
Baobei à, tới đây hiểu được bao nhiêu rồi… hay vẫn đang loading vậy? 🤡

Không sao, tôi cũng không hiểu hết — chỉ là giả vờ bình tĩnh thôi.

Anyways, cya in the next chaos 💀