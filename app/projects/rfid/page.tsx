'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Cpu,
  Database,
  Globe,
  Zap,
  ShieldAlert,
  ExternalLink,
  Activity,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Radio,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import HackerText from '@/components/HackerText';

type SmartCardId = 'student_pass' | 'VIP_lab' | 'unregistered_ghost' | 'cloned_sector';

interface SmartCardProfile {
  id: SmartCardId;
  badge: string;
  name: string;
  holder: string;
  mssv: string;
  uid: string;
  sak: string;
  atqa: string;
  sector0Hex: string;
  sector1Hex: string;
  isRegistered: boolean;
  defaultStatus: 'GRANTED' | 'GHOST_LOGGED' | 'DENIED';
  accentHex: string;
  spiBits: number[];
}

const SMART_CARDS: SmartCardProfile[] = [
  {
    id: 'student_pass',
    badge: 'PASS_01 // STANDARD',
    name: 'Thẻ Sinh Viên Chính Quy',
    holder: 'PHAN KHANH AN',
    mssv: '21110XXX',
    uid: 'E2 : 4A : 8B : 1C',
    sak: '0x08 (Mifare 1K)',
    atqa: '0x0004',
    sector0Hex: 'E2 4A 8B 1C 9D 08 04 00 62 63 64 65 66 67 68 69',
    sector1Hex: '32 31 31 31 30 58 58 58 49 4F 54 33 30 32 5F 53',
    isRegistered: true,
    defaultStatus: 'GRANTED',
    accentHex: '#F59E0B',
    spiBits: [1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
  },
  {
    id: 'VIP_lab',
    badge: 'PASS_02 // LAB_ADMIN',
    name: 'Thẻ Giảng Viên / Quản Trị Lab',
    holder: 'LEDANGHOANGANH',
    mssv: 'GV_IOT_01',
    uid: 'A4 : 91 : 0C : 77',
    sak: '0x08 (Mifare 1K)',
    atqa: '0x0004',
    sector0Hex: 'A4 91 0C 77 4E 08 04 00 41 44 4D 49 4E 5F 4B 45',
    sector1Hex: '47 56 5F 49 4F 54 5F 30 31 5F 46 55 4C 4C 5F 41',
    isRegistered: true,
    defaultStatus: 'GRANTED',
    accentHex: '#10B981',
    spiBits: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0],
  },
  {
    id: 'unregistered_ghost',
    badge: 'PASS_03 // UNKNOWN_UID',
    name: 'Thẻ Lạ Chưa Đăng Ký (Ghost Test)',
    holder: 'UNREGISTERED_VISITOR',
    mssv: 'UNKNOWN',
    uid: '9F : 00 : DE : AD',
    sak: '0x08 (Mifare 1K)',
    atqa: '0x0004',
    sector0Hex: '9F 00 DE AD C2 08 04 00 00 00 00 00 00 00 00 00',
    sector1Hex: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
    isRegistered: false,
    defaultStatus: 'GHOST_LOGGED',
    accentHex: '#EF4444',
    spiBits: [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
  },
];

type BusFilter = 'all' | 'spi' | 'i2c' | 'power' | 'actuator';

const PCB_TRACES = [
  {
    id: 'spi' as const,
    label: 'BUS SPI (10MHz Full-Duplex)',
    color: '#F59E0B',
    pins: 'MOSI(23) | MISO(19) | SCK(18) | SS(5) | RST(22)',
    desc: 'Truyền nhận khung lệnh ISO/IEC 14443A tốc độ cao giữa ESP32 Core 1 và chip thu phát MFRC522.',
  },
  {
    id: 'i2c' as const,
    label: 'BUS I2C (Địa chỉ 0x27)',
    color: '#38BDF8',
    pins: 'SDA(GPIO 21) | SCL(GPIO 22)',
    desc: 'Điều khiển màn hình LCD 16x2 thông qua IC mở rộng chân PCF8574 chỉ với 2 dây tín hiệu.',
  },
  {
    id: 'power' as const,
    label: 'RAIL NGUỒN (3.3V & 5V Tách Biệt)',
    color: '#EF4444',
    pins: 'MFRC522 -> 3.3V | LCD & Relay -> 5V VIN | Common GND',
    desc: 'Cô lập đường 3.3V của MFRC522 khỏi tải dòng cao 5V của Relay và đèn nền LCD để bảo vệ IC ổn áp AMS1117.',
  },
  {
    id: 'actuator' as const,
    label: 'NGÕ RA CƠ CẤU CHẤP HÀNH',
    color: '#10B981',
    pins: 'Active Buzzer(GPIO 4) | Relay Chốt Cửa(GPIO 2)',
    desc: 'Kích âm báo phản hồi tức thời (< 0.1s) và đóng cắt chốt từ cửa phòng học.',
  },
];

const AUTOPSY_CASES = [
  {
    id: 'case-burnout',
    code: 'AUTOPSY #01',
    title: 'Cháy IC ổn áp nguồn AMS1117 trên board ESP32 đầu tiên',
    symptom: 'Board ESP32 nóng rực, mất nguồn 3.3V, cắm cáp USB máy tính không nhận cổng COM.',
    oscilloscope: '3.3V_RAIL: 3.32V -> 1.45V (BROWNOUT) -> 0.00V (REGULATOR_SHORT)',
    cause:
      'Kéo dòng quá tải trực tiếp từ chân 3.3V khi kích đồng thời cuộn hút Relay 5V và đèn nền LCD, cộng thêm xung ngược khi đóng ngắt tải cảm kháng.',
    patch:
      'Tách riêng đường cấp nguồn 5V (VIN) cho LCD I2C và Relay; chỉ cấp duy nhất 3.3V chuẩn cho module MFRC522 và nối chung GND toàn mạch.',
  },
  {
    id: 'case-epoch',
    code: 'AUTOPSY #02',
    title: 'Lỗi HTTP 400: Sinh viên điểm danh vào năm 1970 (Epoch 0)',
    symptom: 'Những lượt quẹt thẻ đầu tiên ngay sau khi cấp nguồn đều bị FastAPI từ chối với mã lỗi HTTP 400 Invalid Timestamp.',
    oscilloscope: 'RTC_TIME: 1970-01-01T00:00:03Z != SHIFT_WINDOW(2026)',
    cause:
      'Tiến trình quét thẻ trên Core 1 khởi chạy ngay lập tức trong khi kết nối Wi-Fi và đồng bộ thời gian thực qua máy chủ NTP (pool.ntp.org) chưa hoàn tất.',
    patch:
      'Thêm vòng lặp chốt chặn đồng bộ NTP trong hàm setup(): bắt buộc hệ thống lấy được mốc thời gian thực (năm >= 2026) mới khởi tạo TaskRFIDScan trên Core 1.',
  },
  {
    id: 'case-fk',
    code: 'AUTOPSY #03',
    title: 'Lỗi HTTP 500: Sập giao dịch PostgreSQL khi quẹt thẻ lạ',
    symptom: 'Quẹt thử thẻ giữ xe hoặc thẻ ngân hàng NFC vào đầu đọc làm nổ lỗi 500 Internal Server Error trên Backend.',
    oscilloscope: 'POSTGRES_ERR: insert or update on table "diem_danh" violates foreign key constraint',
    cause:
      'UID của thẻ lạ không tồn tại trong bảng sinh_vien, dẫn đến vi phạm ràng buộc khóa ngoại (Foreign Key) khi chèn bản ghi điểm danh mới.',
    patch:
      'Xây dựng cơ chế Ghost Student Fallback: tự động quy chiếu mọi UID chưa định danh về hồ sơ đặc biệt "UNKNOWN" để lưu nhật ký cảnh báo an ninh mà vẫn giữ nguyên tính toàn vẹn ACID.',
  },
  {
    id: 'case-baud',
    code: 'AUTOPSY #04',
    title: 'Ký tự rác (Mojibake) trên UART & Khác biệt Wokwi vs Phần cứng thật',
    symptom: 'Serial Monitor hiển thị toàn ký tự lạ "⸮⸮⸮" và đầu đọc MFRC522 không phản hồi khi bê nguyên sơ đồ từ Wokwi ra mạch thật.',
    oscilloscope: 'UART_TX: 115200 BAUD vs RX_TERMINAL: 9600 BAUD (CLOCK_DESYNC)',
    cause:
      'Lệch tốc độ Baud giữa code và Serial Monitor, đồng thời mô phỏng Wokwi dùng cấu hình giả lập đơn giản trong khi MFRC522 thực tế yêu cầu bus VSPI phần cứng chuẩn.',
    patch:
      'Đồng bộ toàn bộ hệ thống về 115200 baud và định tuyến cứng bộ chân VSPI (SCK=18, MISO=19, MOSI=23, SS=5, RST=22) trên ESP32.',
  },
];

export default function RFIDVaultWorkbenchPage() {
  const [selectedCardId, setSelectedCardId] = useState<SmartCardId>('student_pass');
  const [wifiOnline, setWifiOnline] = useState<boolean>(true);
  const [shiftActive, setShiftActive] = useState<boolean>(true);
  const [mutexEnabled, setMutexEnabled] = useState<boolean>(true);

  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(1);
  const [relayUnlocked, setRelayUnlocked] = useState<boolean>(true);
  const [ramQueue, setRamQueue] = useState<
    { id: number; uid: string; holder: string; status: string; synced: boolean }[]
  >([
    { id: 1, uid: 'E2:4A:8B:1C', holder: 'PHAN KHANH AN', status: 'VERIFIED', synced: true },
  ]);

  const [activeBus, setActiveBus] = useState<BusFilter>('all');
  const [selectedAutopsy, setSelectedAutopsy] = useState<string>('case-burnout');
  const [raceSimRunning, setRaceSimRunning] = useState<boolean>(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const wasLight = document.documentElement.classList.contains('light-theme');
    if (wasLight) {
      document.documentElement.classList.remove('light-theme');
    }
    return () => {
      if (wasLight) {
        document.documentElement.classList.add('light-theme');
      }
    };
  }, []);

  const currentCard = SMART_CARDS.find((c) => c.id === selectedCardId) || SMART_CARDS[0];
  const currentAutopsy = AUTOPSY_CASES.find((a) => a.id === selectedAutopsy) || AUTOPSY_CASES[0];

  // Xử lý sự kiện quẹt thẻ vật lý lên cuộn cảm 13.56 MHz
  const triggerCardTap = (card: SmartCardProfile = currentCard) => {
    setIsTapping(true);
    const nextId = tapCount + 1;
    setTapCount(nextId);

    const canUnlock = card.isRegistered && shiftActive;
    setRelayUnlocked(canUnlock);

    const statusTag = !shiftActive
      ? 'SHIFT_LOCKED_403'
      : !card.isRegistered
      ? 'GHOST_UID_LOGGED'
      : wifiOnline
      ? 'VERIFIED_SYNCED'
      : 'CACHED_IN_RAM';

    setRamQueue((prev) => [
      {
        id: nextId,
        uid: card.uid.replace(/\s/g, ''),
        holder: card.holder,
        status: statusTag,
        synced: wifiOnline && shiftActive,
      },
      ...prev.slice(0, 5),
    ]);

    setTimeout(() => setIsTapping(false), 650);
  };

  // Khi bật lại Wi-Fi -> tự động đồng bộ toàn bộ hàng đợi RAM lên Supabase
  const handleToggleWifi = () => {
    const nextState = !wifiOnline;
    setWifiOnline(nextState);
    if (nextState) {
      setRamQueue((prev) =>
        prev.map((item) => ({
          ...item,
          synced: true,
          status: item.status === 'CACHED_IN_RAM' ? 'FLUSHED_TO_CLOUD' : item.status,
        }))
      );
    }
  };

  const pendingRamCount = ramQueue.filter((i) => !i.synced).length;

  // Tính nội dung hiển thị trên màn hình LCD 16x2
  const lcdDisplay = (() => {
    if (!shiftActive) {
      return {
        line1: 'ERR: SHIFT LOCK!',
        line2: '07:30-11:00 ONLY',
        backlight: 'border-amber-500/50 bg-[#191206] text-amber-400',
      };
    }
    if (!currentCard.isRegistered) {
      return {
        line1: 'ACCESS DENIED!  ',
        line2: 'GHOST UID LOGGED',
        backlight: 'border-red-500/50 bg-[#1A0808] text-red-400',
      };
    }
    if (!wifiOnline) {
      return {
        line1: `RAM OK: ${currentCard.mssv}`,
        line2: `QUEUED (#${pendingRamCount + 1} HOLD)`,
        backlight: 'border-amber-400/50 bg-[#141407] text-amber-300',
      };
    }
    return {
      line1: `OK: ${currentCard.mssv.padEnd(12, ' ')}`,
      line2: currentCard.holder.slice(0, 16).padEnd(16, ' '),
      backlight: 'border-emerald-500/40 bg-[#061810] text-emerald-400',
    };
  })();

  return (
    <div className="min-h-screen bg-[#060605] text-[#F5F5F0] font-sans selection:bg-amber-400 selection:text-black pb-32 relative overflow-x-hidden">
      {/* Thanh tiến trình đồng thau / hổ phách */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 origin-left z-50 shadow-[0_0_15px_#f59e0b]"
      />

      {/* Họa tiết nền bảng mạch in PCB (Copper Grid & Crosshairs) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f59e0b 1px, transparent 1px),
            linear-gradient(to bottom, #f59e0b 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top Workbench Bar */}
      <nav className="border-b border-[#333330] bg-[#0A0A09]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link
          href="/#sec-works"
          className="font-mono text-sm uppercase tracking-widest text-[#D8D8D1] hover:text-amber-400 transition-colors flex items-center gap-2.5"
        >
          <ArrowLeft size={16} />
          <HackerText text="EXIT_WORKBENCH" />
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://wokwi.com/projects/454856473504871425"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-[#D8D8D1] hover:text-amber-400 border border-[#333330] hover:border-amber-400 px-3.5 py-2 transition-colors hidden sm:flex items-center gap-2"
          >
            <span>WOKWI_CIRCUIT</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://danganhle0623-iot.hf.space"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-black bg-amber-400 hover:bg-amber-300 px-3.5 py-2 transition-colors font-bold flex items-center gap-2"
          >
            <span>LIVE_CLOUD_HUD</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </nav>

      <main className="max-w-[1380px] mx-auto px-6 md:px-12 pt-10 space-y-24 relative z-10">
        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT I: THE INTERACTIVE RFID VAULT WORKBENCH (HERO + PHYSICAL TEST BENCH)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          {/* Compact Editorial Title Strip */}
          <div className="border-b border-[#333330] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5">
                <Radio size={14} className="animate-pulse" />
                <span>HARDWARE TESTBENCH // 13.56 MHZ ISO/IEC 14443A + ESP32 FREERTOS</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl font-light text-white tracking-tight leading-[1.06]">
                IoT RFID Vault: <span className="italic text-amber-400">Tactile Hardware Lab</span>
              </h1>
            </div>
            <p className="text-[#A9A9A2] text-base md:text-lg max-w-xl leading-relaxed font-light">
              {' '}
              <span className="font-mono text-white">13.56 MHz</span>{' '}
              <span className="font-mono text-white">Mutex</span> 
            </p>
          </div>

          {/* Hardware Fault & Environment Toggle Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Switch 1: Wi-Fi Link */}
            <button
              onClick={handleToggleWifi}
              className={`p-4 border text-left transition-all cursor-pointer flex items-center justify-between ${
                wifiOnline
                  ? 'border-emerald-500/40 bg-[#08120D] text-emerald-300'
                  : 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              }`}
            >
              <div className="space-y-1">
                <div className="text-[10px] text-[#A9A9A2] uppercase">SW_01 // KẾT NỐI WI-FI (CORE 0)</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  {wifiOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
                  <span>{wifiOnline ? 'ONLINE (ĐỒNG BỘ TỨC THỜI)' : 'OFFLINE (LƯU ĐỆM VÀO RAM)'}</span>
                </div>
              </div>
              <span className="px-2 py-1 border border-current text-[10px] font-bold">BẬT</span>
            </button>

            {/* Switch 2: Shift Window Lock */}
            <button
              onClick={() => setShiftActive(!shiftActive)}
              className={`p-4 border text-left transition-all cursor-pointer flex items-center justify-between ${
                shiftActive
                  ? 'border-[#333330] bg-[#0D0D0C] text-white hover:border-amber-400/50'
                  : 'border-red-500 bg-red-500/10 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
              }`}
            >
              <div className="space-y-1">
                <div className="text-[10px] text-[#A9A9A2] uppercase">SW_02 // KHUNG GIỜ CA HỌC (SHIFT LOCK)</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <Clock size={15} className={shiftActive ? 'text-amber-400' : 'text-red-400'} />
                  <span>{shiftActive ? 'TRONG CA (07:30 - 11:00)' : 'NGOÀI GIỜ (CHẶN API 403)'}</span>
                </div>
              </div>
              <span className="px-2 py-1 border border-current text-[10px] font-bold">BẬT</span>
            </button>

            {/* Switch 3: FastAPI Mutex Lock */}
            <button
              onClick={() => setMutexEnabled(!mutexEnabled)}
              className={`p-4 border text-left transition-all cursor-pointer flex items-center justify-between ${
                mutexEnabled
                  ? 'border-[#333330] bg-[#0D0D0C] text-white hover:border-amber-400/50'
                  : 'border-red-500 bg-red-500/10 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
              }`}
            >
              <div className="space-y-1">
                <div className="text-[10px] text-[#A9A9A2] uppercase">SW_03 // MUTEX</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  {mutexEnabled ? (
                    <Lock size={15} className="text-emerald-400" />
                  ) : (
                    <Unlock size={15} className="text-red-400" />
                  )}
                  <span>{mutexEnabled ? 'MUTEX: ON (AN TOÀN ACID)' : 'MUTEX: OFF (LỖI RACE CONDITION)'}</span>
                </div>
              </div>
              <span className="px-2 py-1 border border-current text-[10px] font-bold">BẬT</span>
            </button>
          </div>

          {/* Main Workbench Deck: Left = Physical Card & Copper Coil Reader | Right = Dual-Core Silicon Die & Logic Analyzer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0B0B0A] border border-[#333330] p-6 md:p-8">
            {/* LEFT BENCH (5 cols): Physical Smart Card Wallet + Copper Antenna Coil + LCD/Solenoid */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 border border-[#2A2A26] bg-[#060605] p-5">
              {/* 1. Card Selector Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs text-[#A9A9A2] border-b border-[#262624] pb-2.5">
                  <span className="text-white font-bold">BƯỚC 1: CHỌN THẺ MIFARE 1K TRÊN TAY</span>
                  <span className="text-amber-400">ISO-14443A</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {SMART_CARDS.map((card, idx) => {
                    const active = card.id === selectedCardId;
                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          triggerCardTap(card);
                        }}
                        className={`p-2.5 border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-amber-400 bg-amber-500/10 text-white font-bold'
                            : 'border-[#262624] bg-[#0D0D0C] text-[#A9A9A2] hover:border-[#555550]'
                        }`}
                      >
                        <div className="text-[10px] text-amber-400">THẺ 0{idx + 1}</div>
                        <div className="truncate text-[11px] mt-0.5">{card.holder.split(' ').slice(-2).join(' ')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Interactive Translucent PCB Smart Card + Copper Induction Coil */}
              <div className="relative border border-[#2A2A26] bg-[#090908] p-5 overflow-hidden">
                {/* Copper Antenna Trace Rings in Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                  {[90, 140, 190, 240].map((size, i) => (
                    <motion.div
                      key={size}
                      animate={
                        isTapping
                          ? { scale: [1, 1.18, 1], opacity: [0.3, 0.9, 0.3] }
                          : { scale: 1, opacity: 0.25 }
                      }
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      style={{ width: size, height: size, borderColor: currentCard.accentHex }}
                      className="absolute border border-dashed rounded-sm"
                    />
                  ))}
                </div>

                {/* Physical NFC Smart Card */}
                <motion.div
                  key={currentCard.id}
                  animate={isTapping ? { y: [0, 10, 0], scale: [1, 0.97, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => triggerCardTap(currentCard)}
                  className="relative z-10 border border-amber-500/40 bg-gradient-to-br from-[#161512] via-[#0D0D0B] to-[#1A160E] p-5 cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.85)] hover:border-amber-400 transition-colors select-none"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    {/* Gold Contact Pad / Inductive Coil Chip */}
                    <div className="w-12 h-10 rounded-xs bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-1.5 border border-amber-200/50 grid grid-cols-2 gap-1 shadow-inner">
                      <div className="border border-black/40" />
                      <div className="border border-black/40" />
                      <div className="border border-black/40" />
                      <div className="border border-black/40" />
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-amber-400 font-bold tracking-widest">
                        {currentCard.badge}
                      </div>
                      <div className="text-[11px] text-[#A9A9A2] mt-0.5">{currentCard.sak}</div>
                    </div>
                  </div>

                  <div className="font-mono space-y-1">
                    <div className="text-[10px] text-[#A9A9A2] uppercase tracking-widest">
                      UID HEX (SECTOR 0 // BLOCK 0)
                    </div>
                    <div className="text-lg md:text-xl font-bold text-white tracking-wider">
                      {currentCard.uid}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[#A9A9A2] text-[10px] block">CHỦ THẺ</span>
                      <span className="text-white font-semibold">{currentCard.holder}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#A9A9A2] text-[10px] block">MÃ ĐỊNH DANH</span>
                      <span className="text-amber-400 font-bold">{currentCard.mssv}</span>
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => triggerCardTap(currentCard)}
                  className="mt-4 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap size={14} />
                  <span>CHẠM THẺ VÀO CUỘN CẢM MFRC522 (TAP CARD)</span>
                </button>
              </div>

              {/* 3. Live 16x2 I2C LCD + Solenoid Door Relay Status */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-mono">
                <div className={`sm:col-span-8 border p-3.5 ${lcdDisplay.backlight}`}>
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                    <span>LCD 1602 I2C (0x27)</span>
                    <span>RESPONSE: 0.08s</span>
                  </div>
                  <div className="text-sm md:text-base font-bold tracking-[0.16em] uppercase leading-snug">
                    <div>{lcdDisplay.line1}</div>
                    <div>{lcdDisplay.line2}</div>
                  </div>
                </div>

                <div
                  className={`sm:col-span-4 border p-3.5 flex flex-col justify-between ${
                    relayUnlocked && shiftActive && currentCard.isRegistered
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-red-500/40 bg-red-950/20 text-red-300'
                  }`}
                >
                  <div className="text-[10px] opacity-75">RELAY GPIO 2</div>
                  <div className="text-xs font-bold flex items-center gap-1.5 mt-1">
                    {relayUnlocked && shiftActive && currentCard.isRegistered ? (
                      <>
                        <Unlock size={15} />
                        <span>CHỐT CỬA: MỞ</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>CHỐT CỬA: KHÓA</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] opacity-75 mt-1">BUZZER: {currentCard.isRegistered && shiftActive ? '1x BEEP' : '3x ALARM'}</div>
                </div>
              </div>
            </div>

            {/* RIGHT BENCH (7 cols): ESP32 Dual-Core Silicon Die + SPI Logic Analyzer + xQueue Ring Buffer */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              {/* 1. SPI Digital Logic Analyzer Waveform */}
              <div className="border border-[#2A2A26] bg-[#060605] p-5 space-y-3 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222220] pb-2.5 text-xs">
                  <span className="text-white font-bold flex items-center gap-2">
                    <Activity size={15} className="text-amber-400" />
                    LOGIC ANALYZER // BUS VSPI 10MHZ (MFRC522 -&gt; ESP32 CORE 1)
                  </span>
                  <span className="text-amber-400">FRAME: {currentCard.uid}</span>
                </div>

                {/* Digital Waveform Channels: SCK & MOSI/MISO */}
                <div className="space-y-2 text-[10px]">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[#A9A9A2] shrink-0">MOSI/MISO</span>
                    <div className="flex-1 grid grid-cols-24 h-7 bg-[#0B0B09] border border-[#1F1F1C] p-1 items-end">
                      {currentCard.spiBits.map((bit, i) => (
                        <motion.div
                          key={`${currentCard.id}-${tapCount}-${i}`}
                          initial={{ scaleY: 0.2, opacity: 0.3 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ delay: i * 0.015 }}
                          className={`h-full border-r border-[#1F1F1C]/60 ${
                            bit === 1
                              ? 'border-t-2 border-t-amber-400 bg-amber-400/15'
                              : 'border-b-2 border-b-emerald-400 bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[#A9A9A2] pt-1">
                    <span>SECTOR 0 HEX: {currentCard.sector0Hex.slice(0, 23)}...</span>
                    <span className="text-emerald-400">CRC_A: VALID (106 kbps)</span>
                  </div>
                </div>
              </div>

              {/* 2. ESP32 Dual-Core Silicon Die Architecture & xQueue Ring Buffer */}
              <div className="border border-[#2A2A26] bg-[#060605] p-5 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-[#222220] pb-2.5 text-xs">
                  <span className="text-white font-bold">
                    ESP32 DUAL-CORE XTENSA LX6 // PHÂN TÁCH TIẾN TRÌNH FREERTOS
                  </span>
                  <span className="text-emerald-400">520KB SRAM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  {/* Core 1 Box */}
                  <div className="md:col-span-5 border border-amber-500/40 bg-[#100D07] p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                      <span>APP_CPU // CORE 01</span>
                      <span>PRIORITY 2</span>
                    </div>
                    <div className="text-white text-sm font-bold">Task: RFID_Sentry</div>
                    <p className="text-xs text-[#D8D8D1] font-sans leading-relaxed">
                      Đọc SPI liên tục, đối chiếu UID trực tiếp trong mảng <strong>RAM Edge Cache</strong>. Không bao giờ chờ mạng Wi-Fi.
                    </p>
                    <div className="pt-2 border-t border-amber-500/20 text-[11px] text-emerald-400">
                      ● Phản hồi tại chỗ: 0.08 giây
                    </div>
                  </div>

                  {/* xQueue Bridge */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center border border-[#2A2A26] bg-[#0C0C0A] p-3 text-center">
                    <div className="text-[10px] text-[#A9A9A2] mb-1">IPC BUFFER</div>
                    <div className="text-xs font-bold text-amber-400">xQueue</div>
                    <div className="text-[11px] text-white mt-1">
                      {pendingRamCount > 0 ? `${pendingRamCount} HOLD` : 'SYNCED'}
                    </div>
                  </div>

                  {/* Core 0 Box */}
                  <div
                    className={`md:col-span-5 border p-4 space-y-2 ${
                      wifiOnline
                        ? 'border-emerald-500/40 bg-[#07110C]'
                        : 'border-red-500/40 bg-[#160909]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={wifiOnline ? 'text-emerald-400' : 'text-red-400'}>
                        PRO_CPU // CORE 00
                      </span>
                      <span>PRIORITY 1</span>
                    </div>
                    <div className="text-white text-sm font-bold">Task: WiFi_Messenger</div>
                    <p className="text-xs text-[#D8D8D1] font-sans leading-relaxed">
                      {wifiOnline
                        ? 'Lấy bản ghi từ xQueue và đẩy bất đồng bộ qua HTTP POST lên FastAPI & Supabase.'
                        : 'Đang mất Wi-Fi! Tự động giữ toàn bộ lượt quẹt thẻ trong RAM chờ có mạng lại.'}
                    </p>
                    <div className="pt-2 border-t border-white/10 text-[11px] text-amber-400">
                      ● {wifiOnline ? 'Cloud RTT: 0.61s' : `Đang giữ ${pendingRamCount} bản ghi trong RAM`}
                    </div>
                  </div>
                </div>

                {/* Live RAM Queue Ledger */}
                <div className="border-t border-[#222220] pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#A9A9A2]">
                    <span>NHẬT KÝ HÀNG ĐỢI TRONG RAM (RECENT XQUEUE RECORDS)</span>
                    <span>
                      {wifiOnline
                        ? 'TRẠNG THÁI: ĐÃ ĐỒNG BỘ SUPABASE'
                        : 'TRẠNG THÁI: ĐANG NÉN TRONG SRAM (BẤM BẬT WI-FI ĐỂ XẢ)'}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-[135px] overflow-y-auto pr-1">
                    {ramQueue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-[#0E0E0C] border border-[#242420] px-3 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-amber-400 font-bold">#{item.id}</span>
                          <span className="text-white">{item.uid}</span>
                          <span className="text-[#A9A9A2] hidden sm:inline">({item.holder})</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 border font-bold ${
                            item.status.includes('LOCKED') || item.status.includes('GHOST')
                              ? 'border-red-500/40 text-red-400 bg-red-500/10'
                              : item.synced
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT II: INTERACTIVE CONCURRENCY LAB (MUTEX LOCK VS RACE CONDITION TIMELINE)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-[#333330] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400 mb-1.5">
                CONCURRENCY CONTROL // FASTAPI ASYNCIO.LOCK() &amp; ACID TRANSACTION
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-white">
              Race Condition khi nhiều sinh viên quẹt thẻ cùng lúc
              </h2>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={() => {
                  setMutexEnabled(true);
                  setRaceSimRunning(true);
                  setTimeout(() => setRaceSimRunning(false), 600);
                }}
                className={`px-4 py-2.5 border cursor-pointer font-bold transition-all ${
                  mutexEnabled
                    ? 'border-emerald-400 bg-emerald-400 text-black'
                    : 'border-[#333330] bg-[#111111] text-[#D8D8D1]'
                }`}
              >
                BẬT MUTEX LOCK (ACID SAFE)
              </button>
              <button
                onClick={() => {
                  setMutexEnabled(false);
                  setRaceSimRunning(true);
                  setTimeout(() => setRaceSimRunning(false), 600);
                }}
                className={`px-4 py-2.5 border cursor-pointer font-bold transition-all ${
                  !mutexEnabled
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-[#333330] bg-[#111111] text-[#D8D8D1]'
                }`}
              >
                TẮT MUTEX (XEM LỖI GHI ĐÈ)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0B0B0A] border border-[#333330] p-6 md:p-8 font-mono text-xs">
            {/* Timeline Visualizer (7 cols) */}
            <div className="lg:col-span-7 border border-[#2A2A26] bg-[#060605] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#222220] pb-3">
                <span className="text-white font-bold">
                  BIỂU ĐỒ THỜI GIAN THỰC THI 2 REQUEST ĐỒNG THỜI (T = 0ms)
                </span>
                <span className={mutexEnabled ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {mutexEnabled ? '● SERIALIZED (TUẦN TỰ HÓA)' : '● GHI ĐÈ DỮ LIỆU'}
                </span>
              </div>

              {/* Thread A */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#D8D8D1]">
                  <span>Worker_Thread_A (Request #01 - 07:30:00.002)</span>
                  <span className="text-emerald-400">COMMIT OK</span>
                </div>
                <div className="grid grid-cols-12 gap-1 h-9 bg-[#0E0E0C] p-1 border border-[#242420]">
                  <div className="col-span-3 bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    LOCK &amp; READ (vắng=2)
                  </div>
                  <div className="col-span-3 bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                    WRITE (vắng=1)
                  </div>
                  <div className="col-span-2 bg-white/10 flex items-center justify-center text-white">
                    UNLOCK
                  </div>
                </div>
              </div>

              {/* Thread B */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#D8D8D1]">
                  <span>Worker_Thread_B (Request #02 - 07:30:00.002)</span>
                  <span className={mutexEnabled ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                    {mutexEnabled ? 'WAITED 4ms -> COMMIT OK' : 'RACE COLLISION -> DATA LOST!'}
                  </span>
                </div>
                {mutexEnabled ? (
                  <div className="grid grid-cols-12 gap-1 h-9 bg-[#0E0E0C] p-1 border border-[#242420]">
                    <div className="col-span-6 bg-zinc-800/70 border border-dashed border-zinc-600 flex items-center justify-center text-[#A9A9A2]">
                      WAITING FOR MUTEX LOCK (3.8ms)...
                    </div>
                    <div className="col-span-3 bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                      READ (vắng=1)
                    </div>
                    <div className="col-span-3 bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                      WRITE (vắng=0)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-1 h-9 bg-[#1A0808] p-1 border border-red-500/50">
                    <div className="col-span-3 bg-red-500/30 border border-red-400 flex items-center justify-center text-red-200">
                      READ CŨ (vắng=2)
                    </div>
                    <div className="col-span-4 bg-red-600/40 border border-red-400 flex items-center justify-center text-white font-bold">
                      GHI ĐÈ LÊN THREAD A (vắng=1)!
                    </div>
                    <div className="col-span-5 flex items-center justify-center text-red-400">
                      MẤT 1 LƯỢT ĐIỂM DANH!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code & Explanation Box (5 cols) */}
            <div className="lg:col-span-5 border border-[#2A2A26] bg-[#060605] p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-amber-400 font-bold uppercase tracking-wider">
                  CƠ CHẾ KHÓA VÙNG GĂNG TRÊN FASTAPI
                </div>
                <p className="text-sm text-[#D8D8D1] font-sans leading-relaxed">
                  {mutexEnabled
                    ? 'Khi bật asyncio.Lock(), mỗi thời điểm chỉ có duy nhất 1 tiến trình được phép đọc và cập nhật số buổi vắng của sinh viên trong Supabase. Kết quả thử nghiệm thực tế 20 thẻ quẹt liên tiếp trong 15 giây đạt tỷ lệ thành công 20/20 (0% mất gói).'
                    : 'Nếu không có Mutex Lock, 2 request đến cùng lúc sẽ cùng đọc giá trị cũ trước khi luồng kia kịp lưu, dẫn đến ghi đè kết quả (Lost Update) và làm sai lệch trạng thái cấm thi của sinh viên.'}
                </p>
              </div>

              <pre className="bg-[#0B0B09] border border-[#222220] p-3.5 text-[11px] text-[#D8D8D1] overflow-x-auto leading-relaxed">
{`attendance_mutex = asyncio.Lock()

@app.post("/api/attendance")
async def record_attendance(payload: SwipePayload):
    async with attendance_mutex:  # Khóa vùng găng ACID
        student = await db.fetch_student(payload.uid)
        await db.commit_attendance_atomic(student)`}
              </pre>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT III: INTERACTIVE PCB SCHEMATIC & HARDWARE AUTOPSY LAB
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-[#333330] pb-4">
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-amber-400 mb-1.5">
              PCB SCHEMATIC &amp; HARDWARE POST-MORTEM // SƠ ĐỒ MẠCH IN &amp; HỒ SƠ XỬ LÝ SỰ CỐ
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              SPI / I2C / Power và các lỗi phần cứng thường gặp
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left (7 cols): Interactive Copper PCB Schematic Canvas */}
            <div className="lg:col-span-7 border border-[#333330] bg-[#0B0B0A] p-6 md:p-7 flex flex-col justify-between space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs md:text-sm">
                <span className="text-white font-bold">BẤM CHỌN ĐƯỜNG TÍN HIỆU TRÊN MẠCH IN:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all' as const, label: 'TẤT CẢ' },
                    { id: 'spi' as const, label: 'SPI (MFRC522)' },
                    { id: 'i2c' as const, label: 'I2C (LCD 0x27)' },
                    { id: 'power' as const, label: 'NGUỒN 3.3V/5V' },
                    { id: 'actuator' as const, label: 'RELAY & BUZZER' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBus(b.id)}
                      className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                        activeBus === b.id
                          ? 'border-amber-400 bg-amber-400 text-black font-bold'
                          : 'border-[#333330] bg-[#060605] text-[#D8D8D1] hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive SVG PCB Board Layout */}
              <div className="border border-[#262622] bg-[#060D09] p-4 md:p-5 relative overflow-hidden">
                <svg viewBox="0 0 620 300" className="w-full h-auto block font-mono">
                  {/* PCB Mounting Holes */}
                  {[
                    [16, 16],
                    [604, 16],
                    [16, 284],
                    [604, 284],
                  ].map(([cx, cy], idx) => (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r={7} fill="#060D09" stroke="#F59E0B" strokeWidth="2" />
                      <circle cx={cx} cy={cy} r={3} fill="#000" />
                    </g>
                  ))}

                  {/* MCU Center: ESP32 DevKit V1 */}
                  <rect
                    x={220}
                    y={50}
                    width={180}
                    height={200}
                    fill="#0D1511"
                    stroke="#F5F5F0"
                    strokeWidth="2"
                  />
                  <rect x={250} y={70} width={120} height={72} fill="#181816" stroke="#555" />
                  <text x={262} y={104} fill="#F5F5F0" fontSize="13" fontWeight="bold">
                    ESP32-WROOM
                  </text>
                  <text x={258} y={124} fill="#F59E0B" fontSize="10.5">
                    240MHz Dual-Core
                  </text>
                  <text x={238} y={172} fill="#D8D8D1" fontSize="10.5">
                    VSPI: GPIO 5/18/19/23
                  </text>
                  <text x={238} y={194} fill="#D8D8D1" fontSize="10.5">
                    I2C: GPIO 21 / 22
                  </text>
                  <text x={238} y={216} fill="#D8D8D1" fontSize="10.5">
                    IO: GPIO 2 / GPIO 4
                  </text>

                  {/* Left Module: MFRC522 13.56MHz */}
                  <rect
                    x={24}
                    y={60}
                    width={136}
                    height={180}
                    fill="#0A1922"
                    stroke="#F59E0B"
                    strokeWidth="1.8"
                  />
                  <text x={36} y={88} fill="#F59E0B" fontSize="12.5" fontWeight="bold">
                    RFID MFRC522
                  </text>
                  <text x={36} y={106} fill="#D8D8D1" fontSize="10.5">
                    13.56 MHz SPI
                  </text>
                  <rect
                    x={40}
                    y={124}
                    width={104}
                    height={92}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x={48} y={174} fill="#F59E0B" fontSize="10.5" fontWeight="bold">
                    ANTENNA COIL
                  </text>

                  {/* Right Top Module: LCD 1602 I2C */}
                  <rect
                    x={456}
                    y={50}
                    width={142}
                    height={88}
                    fill="#081C14"
                    stroke="#38BDF8"
                    strokeWidth="1.8"
                  />
                  <text x={468} y={78} fill="#38BDF8" fontSize="12.5" fontWeight="bold">
                    LCD 16x2 I2C
                  </text>
                  <text x={468} y={98} fill="#4ade80" fontSize="10.5">
                    ADDR: 0x27 (5V)
                  </text>
                  <text x={468} y={118} fill="#D8D8D1" fontSize="10">
                    PCF8574 Backpack
                  </text>

                  {/* Right Bottom Module: Relay + Active Buzzer */}
                  <rect
                    x={456}
                    y={162}
                    width={142}
                    height={88}
                    fill="#14110A"
                    stroke="#10B981"
                    strokeWidth="1.8"
                  />
                  <text x={468} y={190} fill="#10B981" fontSize="12.5" fontWeight="bold">
                    RELAY &amp; BUZZER
                  </text>
                  <text x={468} y={210} fill="#D8D8D1" fontSize="10.5">
                    GPIO 2 (Solenoid)
                  </text>
                  <text x={468} y={230} fill="#D8D8D1" fontSize="10.5">
                    GPIO 4 (Buzzer)
                  </text>

                  {/* SPI Traces (Amber) */}
                  <g opacity={activeBus === 'all' || activeBus === 'spi' ? 1 : 0.15}>
                    <line x1={160} y1={115} x2={220} y2={115} stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1={160} y1={135} x2={220} y2={135} stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1={160} y1={155} x2={220} y2={155} stroke="#F59E0B" strokeWidth="2.5" />
                    <text x={163} y={107} fill="#F59E0B" fontSize="9.5" fontWeight="bold">
                      VSPI 10MHz
                    </text>
                  </g>

                  {/* I2C Traces (Cyan) */}
                  <g opacity={activeBus === 'all' || activeBus === 'i2c' ? 1 : 0.15}>
                    <line x1={400} y1={90} x2={456} y2={90} stroke="#38BDF8" strokeWidth="2.5" />
                    <line x1={400} y1={110} x2={456} y2={110} stroke="#38BDF8" strokeWidth="2.5" />
                    <text x={404} y={82} fill="#38BDF8" fontSize="9.5" fontWeight="bold">
                      SDA/SCL
                    </text>
                  </g>

                  {/* Power Rails (Red) */}
                  <g opacity={activeBus === 'all' || activeBus === 'power' ? 1 : 0.15}>
                    <line
                      x1={160}
                      y1={205}
                      x2={220}
                      y2={205}
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                    <line
                      x1={400}
                      y1={68}
                      x2={456}
                      y2={68}
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                    <text x={162} y={197} fill="#EF4444" fontSize="9.5" fontWeight="bold">
                      3.3V ONLY!
                    </text>
                    <text x={405} y={60} fill="#EF4444" fontSize="9.5" fontWeight="bold">
                      5V VIN
                    </text>
                  </g>

                  {/* Actuator Traces (Green) */}
                  <g opacity={activeBus === 'all' || activeBus === 'actuator' ? 1 : 0.15}>
                    <line x1={400} y1={195} x2={456} y2={195} stroke="#10B981" strokeWidth="2.5" />
                    <line x1={400} y1={215} x2={456} y2={215} stroke="#10B981" strokeWidth="2.5" />
                    <text x={403} y={187} fill="#10B981" fontSize="9.5" fontWeight="bold">
                      GPIO 2 / 4
                    </text>
                  </g>
                </svg>
              </div>

              {/* Bus Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
                {PCB_TRACES.map((trace) => (
                  <div
                    key={trace.id}
                    onClick={() => setActiveBus(trace.id)}
                    className={`p-4 border cursor-pointer transition-colors ${
                      activeBus === trace.id
                        ? 'border-amber-400 bg-[#14120B]'
                        : 'border-[#262622] bg-[#060605] hover:border-[#444]'
                    }`}
                  >
                    <div className="text-sm md:text-base font-bold text-white flex items-center justify-between">
                      <span>{trace.label}</span>
                      <span style={{ color: trace.color }}>●</span>
                    </div>
                    <div className="text-xs md:text-sm text-amber-400 mt-1.5 font-semibold">
                      {trace.pins}
                    </div>
                    <p className="text-sm text-[#D8D8D1] font-sans mt-2 leading-relaxed">
                      {trace.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right (5 cols): Hardware Autopsy & Post-Mortem Dossier */}
            <div className="lg:col-span-5 border border-[#333330] bg-[#0B0B0A] p-6 md:p-7 flex flex-col justify-between font-mono">
              <div className="space-y-5 h-full flex flex-col">
                <div className="text-sm md:text-base text-amber-400 font-bold uppercase tracking-widest border-b border-[#262622] pb-3.5 flex items-center justify-between">
                  <span>4 CASES THƯỜNG GẶP</span>
                  <AlertTriangle size={18} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {AUTOPSY_CASES.map((c) => {
                    const active = c.id === selectedAutopsy;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedAutopsy(c.id)}
                        className={`p-3.5 md:p-4 border text-left cursor-pointer transition-all ${
                          active
                            ? 'border-amber-400 bg-amber-500/10 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                            : 'border-[#262622] bg-[#060605] text-[#A9A9A2] hover:border-[#555] hover:text-white'
                        }`}
                      >
                        <div className="text-xs text-amber-400 font-bold">{c.code}</div>
                        <div className="line-clamp-2 text-sm font-sans mt-1 leading-snug">
                          {c.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <motion.div
                  key={currentAutopsy.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-[#2A2A26] bg-[#060605] p-6 space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs md:text-sm text-red-400 font-bold uppercase tracking-wider">
                        {currentAutopsy.code} // POST-MORTEM REPORT
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-white font-sans mt-1.5 leading-snug">
                        {currentAutopsy.title}
                      </h3>
                    </div>

                    <div className="bg-[#120808] border border-red-500/30 p-4 text-xs md:text-sm text-red-300 leading-relaxed">
                      <div className="text-xs text-red-400 font-bold mb-1">TELEMETRY TRACE:</div>
                      {currentAutopsy.oscilloscope}
                    </div>
                  </div>

                  <div className="space-y-3.5 font-sans text-base leading-relaxed pt-2">
                    <p className="text-[#E5E5DF]">
                      <strong className="text-white font-mono text-xs md:text-sm uppercase mr-2">
                        Hiện tượng:
                      </strong>
                      {currentAutopsy.symptom}
                    </p>
                    <p className="text-[#C8C8C0]">
                      <strong className="text-amber-400 font-mono text-xs md:text-sm uppercase mr-2">
                        Nguyên nhân gốc:
                      </strong>
                      {currentAutopsy.cause}
                    </p>
                    <p className="text-emerald-300 pt-3 border-t border-[#222220]">
                      <strong className="text-emerald-400 font-mono text-xs md:text-sm uppercase mr-2">
                        Khắc phục:
                      </strong>
                      {currentAutopsy.patch}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT IV: FIELD BENCHMARK TELEMETRY & LIVE SANDBOX PORTALS
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0B0B0A] border border-[#333330] p-6 md:p-8 font-mono">
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-[#262622] pb-3.5">
              <div className="text-xs md:text-sm text-amber-400 uppercase tracking-widest mb-1.5">
                FIELD AUDIT // ĐỐI CHIẾU THỰC NGHIỆM (30 THẺ MIFARE 1K &amp; 20 LƯỢT QUẸT DỒN DẬP)
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl text-white font-light">
                So sánh độ trễ phản hồi: Phần cứng ESP32 thật vs Mô phỏng Wokwi
              </h3>
            </div>

            <div className="space-y-5 text-xs md:text-sm">
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-white font-bold">
                    1. Phản hồi tại chỗ qua RAM Edge Cache (ESP32 Thật)
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0">
                    0.08s - 0.61s (Tức thời)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#161614] border border-[#262622] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '14%' }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                    className="h-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-white font-bold">
                    2. Phản hồi mô phỏng trên Wokwi Simulator
                  </span>
                  <span className="text-amber-400 font-bold shrink-0">0.80s (Ổn định)</span>
                </div>
                <div className="w-full h-3.5 bg-[#161614] border border-[#262622] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '22%' }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="h-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-white font-bold">
                    3. Đồng bộ ngầm Cloud RTT (Hugging Face Cold-Start -&gt; Supabase)
                  </span>
                  <span className="text-[#38BDF8] font-bold shrink-0">
                    3.80s - 4.53s (Chạy ngầm trên Core 0)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#161614] border border-[#262622] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '78%' }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                    className="h-full bg-[#38BDF8] shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-[#2A2A26] bg-[#060605] p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <div className="text-xs md:text-sm text-emerald-400 font-bold uppercase tracking-widest">
                TRẢI NGHIỆM HỆ THỐNG TRỰC TUYẾN
              </div>
              <p className="text-sm md:text-base text-[#D8D8D1] font-sans leading-relaxed">
                Truy cập trực tiếp bảng điều khiển quản trị điểm danh trên Hugging Face Spaces hoặc chạy thử mạch phần cứng ESP32 + MFRC522 trên trình mô phỏng Wokwi:
              </p>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <a
                href="https://danganhle0623-iot.hf.space"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 border border-amber-400 bg-amber-400 text-black hover:bg-amber-300 transition-colors font-bold uppercase tracking-widest flex items-center justify-between"
              >
                <span>MỞ CỔNG QUẢN TRỊ LIVE PORTAL</span>
                <ExternalLink size={16} />
              </a>
              <a
                href="https://wokwi.com/projects/454856473504871425"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 border border-[#333330] bg-[#111111] text-white hover:border-amber-400 hover:text-amber-400 transition-colors font-bold uppercase tracking-widest flex items-center justify-between"
              >
                <span>CHẠY MÔ PHỎNG MẠCH WOKWI</span>
                <Cpu size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* Bottom Return Bar */}
        <div className="pt-8 border-t border-[#333330] space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm">
            <Link
              href="/#sec-works"
              className="uppercase tracking-widest text-[#D8D8D1] hover:text-amber-400 transition-colors inline-flex items-center gap-2.5 border border-[#333330] hover:border-amber-400 px-6 py-3"
            >
              <ArrowLeft size={16} />
              <span>[ RETURN TO MAIN TERMINAL ]</span>
            </Link>
            <span className="text-xs text-[#A9A9A2] uppercase tracking-widest">
              ESP32 FREERTOS // MIFARE 13.56MHZ // ACID VAULT
            </span>
          </div>

        <div className="pt-6 flex items-center justify-center font-mono text-xs text-[#A9A9A2]">
          <p className="font-serif italic text-xl sm:text-2xl text-white tracking-wide text-center">
            <span className="text-amber-400 not-italic font-mono animate-pulse">_</span>
            Anyways, cya in the next chaos<span className="text-amber-400 not-italic font-mono animate-pulse">_</span>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
