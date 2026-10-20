'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Cpu,
  Activity,
  AlertTriangle,
  Radio,
  Video,
  Network,
  Terminal,
  ExternalLink,
  Layers,
  Crosshair,
  Compass,
  Play,
  RotateCcw,
  Copy,
  Check,
  Sliders,
  Wrench,
} from 'lucide-react';
import TiltCard from '@/components/TiltCard';
import MagneticWrapper from '@/components/MagneticWrapper';
import HackerText from '@/components/HackerText';

type ScenarioId = 'normal' | 'safe_rest' | 'fall_alert' | 'danger_zone';

interface ScenarioData {
  id: ScenarioId;
  code: string;
  title: string;
  summary: string;
  radar: {
    x_mm: number;
    y_mm: number;
    speed_cms: number;
    age_s: number;
    zone: 'OUTSIDE' | 'SAFE_ZONE' | 'DANGER_ZONE';
  };
  pose: {
    isHorizontal: boolean;
    state: 'UPRIGHT' | 'OBSERVED_HORIZONTAL' | 'CANDIDATE' | 'CONFIRMED';
    spineAngle: number;
    aspectRatio: number;
    dropRatio: number;
    confidence: number;
    postureLabel: string;
  };
  AlertState: {
    status: 'NORMAL' | 'SUPPRESSED (SAFE ZONE)' | 'FALL CONFIRMED' | 'DANGER ZONE INTRUSION';
    color: string;
    strokeHex: string;
    badgeBg: string;
  };
  logs: string[];
}

const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  normal: {
    id: 'normal',
    code: 'CASE_01',
    title: 'Di chuyển bình thường (Auto Tracking)',
    summary:
      'Đối tượng đang đứng và đi lại trong phòng. Cảm biến radar mmWave cập nhật tọa độ liên tục ở tốc độ 256000 baud, vi điều khiển tự động tính góc phương vị và điều khiển 2 trục Servo PAN/TILT bám theo mục tiêu.',
    radar: {
      x_mm: -450,
      y_mm: 2400,
      speed_cms: 38,
      age_s: 0.2,
      zone: 'OUTSIDE',
    },
    pose: {
      isHorizontal: false,
      state: 'UPRIGHT',
      spineAngle: 84.2,
      aspectRatio: 0.41,
      dropRatio: 0.04,
      confidence: 0.92,
      postureLabel: 'Upright Standing',
    },
    AlertState: {
      status: 'NORMAL',
      color: 'text-[#4ade80]',
      strokeHex: '#4ade80',
      badgeBg: 'border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]',
    },
    logs: [
      '[RADAR-DIAG] health=OK frames=1420 target=(-450mm, 2400mm) speed=38cm/s',
      '[SERVO-AUTO] azimuth=-10.6 deg -> PAN=100.6 deg | TILT=74.5 deg (EMA smoothed)',
      '[VIDEO-AI] track_id=1 conf=0.92 spine_angle=84.2 deg aspect_ratio=0.41 state=upright',
    ],
  },
  safe_rest: {
    id: 'safe_rest',
    code: 'CASE_02',
    title: 'Nằm nghỉ trên giường (SAFE ZONE)',
    summary:
      'YOLOv8m-pose nhận thấy khung người nằm ngang nhưng tọa độ Radar mmWave còn mới (< 2.0 giây) và nằm trọn trong vùng SAFE ZONE (giường ngủ). Hệ thống tự động gắn nhãn SAFE ZONE và chặn cảnh báo ngã giả.',
    radar: {
      x_mm: -1150,
      y_mm: 1750,
      speed_cms: 2,
      age_s: 0.4,
      zone: 'SAFE_ZONE',
    },
    pose: {
      isHorizontal: true,
      state: 'OBSERVED_HORIZONTAL',
      spineAngle: 14.8,
      aspectRatio: 1.62,
      dropRatio: 0.35,
      confidence: 0.88,
      postureLabel: 'Horizontal (Bed Safe Zone)',
    },
    AlertState: {
      status: 'SUPPRESSED (SAFE ZONE)',
      color: 'text-[#3B82F6]',
      strokeHex: '#3B82F6',
      badgeBg: 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#3B82F6]',
    },
    logs: [
      '[RADAR-ZONE] Target at (-1150mm, 1750mm) inside SAFE_ZONE (Bed) | age=0.4s (<2.0s)',
      '[VIDEO-AI] track_id=1 horizontal posture detected (spine=14.8 deg, ar=1.62)',
      '[FALL-ENGINE] Alert suppressed by fresh SAFE_ZONE radar lock. Status: RESTING',
    ],
  },
  fall_alert: {
    id: 'fall_alert',
    code: 'CASE_03',
    title: 'Sự cố té ngã ngoài vùng an toàn',
    summary:
      'Đối tượng chuyển đột ngột từ trạng thái đứng (upright >= 0.45s) sang nằm ngang ngoài vùng an toàn: độ tụt trọng tâm >= 0.30 chiều cao cơ thể, góc cột sống <= 48 độ, tỷ lệ khung bao >= 1.18 và bất động sau va chạm.',
    radar: {
      x_mm: 360,
      y_mm: 2150,
      speed_cms: 0,
      age_s: 0.3,
      zone: 'OUTSIDE',
    },
    pose: {
      isHorizontal: true,
      state: 'CONFIRMED',
      spineAngle: 18.4,
      aspectRatio: 1.49,
      dropRatio: 0.52,
      confidence: 0.90,
      postureLabel: 'Fall Confirmed (Post-Impact)',
    },
    AlertState: {
      status: 'FALL CONFIRMED',
      color: 'text-red-400',
      strokeHex: '#EF4444',
      badgeBg: 'border-red-500/50 bg-red-500/15 text-red-400',
    },
    logs: [
      '[FALL-ENGINE] track_id=1 transition: UPRIGHT -> CANDIDATE (drop=0.52h, speed=0.81)',
      '[FALL-ENGINE] Post-impact stability verified (0.70s). State: CONFIRMED!',
      '[WS-ALERT] Broadcasted FALL_DETECTION event to connected dashboards',
      '[TELEGRAM] Telegram Alert Sent Successfully! (Cooldown 60s active)',
    ],
  },
  danger_zone: {
    id: 'danger_zone',
    code: 'CASE_04',
    title: 'Xâm nhập vùng nguy hiểm (DANGER ZONE)',
    summary:
      'Mục tiêu đi vào khu vực nguy hiểm đã cấu hình trên bản đồ phòng (cầu thang, khu vực sàn ướt) hoặc di chuyển ngoài vùng an toàn quá 5 phút trong khung giờ đêm (23:00 đến 05:00).',
    radar: {
      x_mm: 1150,
      y_mm: 1450,
      speed_cms: 24,
      age_s: 0.25,
      zone: 'DANGER_ZONE',
    },
    pose: {
      isHorizontal: false,
      state: 'UPRIGHT',
      spineAngle: 79.5,
      aspectRatio: 0.46,
      dropRatio: 0.06,
      confidence: 0.89,
      postureLabel: 'Upright in Danger Zone',
    },
    AlertState: {
      status: 'DANGER ZONE INTRUSION',
      color: 'text-amber-400',
      strokeHex: '#F59E0B',
      badgeBg: 'border-amber-500/50 bg-amber-500/15 text-amber-400',
    },
    logs: [
      '[RADAR-ZONE] Target entered DANGER_ZONE (Stairs / Wet Floor) at (1150mm, 1450mm)',
      '[SERVO-AUTO] Tracking locked to target: PAN=51.6 deg | TILT=69.8 deg',
      '[WS-ALERT] Emitted DANGER_ZONE entry warning to caregiver dashboard',
    ],
  },
};

interface PipelineNode {
  id: string;
  code: string;
  name: string;
  tech: string;
  portOrLink: string;
  details: string;
  payloadExample: string;
}

const PIPELINE_NODES: PipelineNode[] = [
  {
    id: 'cam',
    code: 'NODE_01',
    name: 'ESP32-CAM (OV3660)',
    tech: 'esp32_cam_stream.ino',
    portOrLink: 'HTTP :81/stream & :82',
    details:
      'Chạy xung nhịp XCLK 20MHz, tự động chọn độ phân giải VGA khi phát hiện PSRAM. Phát luồng ảnh multipart MJPEG tại cổng 81 và cung cấp API chẩn đoán/cấu hình cảm biến tại cổng 82.',
    payloadExample: 'GET http://192.168.1.50:81/stream -> Content-Type: multipart/x-mixed-replace',
  },
  {
    id: 'radar_mcu',
    code: 'NODE_02',
    name: 'HLK-LD2450 + ESP32 DevKit',
    tech: 'esp32_cam_radar.ino',
    portOrLink: 'UART2 256000 bps -> MQTT',
    details:
      'Đọc khung dữ liệu nhị phân từ cảm biến radar mmWave qua chân GPIO32 (RX2), lọc nhiễu tọa độ bằng EMA, đồng thời nhận lệnh điều khiển và xuất xung PWM ra GPIO13 (PAN) và GPIO27 (TILT).',
    payloadExample: 'Topic: embedded/radar/data -> {"x": -450, "y": 2400, "speed": 38}',
  },
  {
    id: 'broker',
    code: 'NODE_03',
    name: 'Mosquitto MQTT Broker',
    tech: 'mosquitto_local.conf',
    portOrLink: 'TCP Port 1883 (LAN)',
    details:
      'Trung tâm chuyển tiếp thông điệp độ trễ thấp giữa ESP32 DevKit và Python Backend. Quản lý các topic dữ liệu radar và điều khiển chế độ/bước quay của 2 trục servo.',
    payloadExample: 'Topics: embedded/radar/data | embedded/servo/mode | embedded/servo/manual',
  },
  {
    id: 'backend',
    code: 'NODE_04',
    name: 'FastAPI + YOLOv8m-Pose',
    tech: 'main.py & fall_detection.py',
    portOrLink: 'HTTP/WS Port :8000',
    details:
      'Tách luồng đọc camera và luồng suy luận AI (PyTorch / OpenVINO / TensorRT). Duy trì ID đối tượng bằng BoT-SORT, chạy máy trạng thái phát hiện té ngã và lưu lịch sử vào SQLite.',
    payloadExample: 'State transition: UPRIGHT (0.45s) -> CANDIDATE (drop>=0.30h) -> CONFIRMED (0.70s)',
  },
  {
    id: 'dashboard',
    code: 'NODE_05',
    name: 'Next.js 16 + Tailscale VPN',
    tech: 'React 19 + Tailwind CSS v4',
    portOrLink: 'TCP :3000 (Tailnet ACL)',
    details:
      'Hiển thị luồng video RAW tốc độ cao kết hợp lớp phủ khung xương AI riêng biệt để không làm giảm FPS. Cho phép cấu hình kích thước phòng, kéo thả vùng SAFE/DANGER và truy cập từ xa qua Tailscale.',
    payloadExample: 'http://100.x.y.z:3000 -> WebSocket /api/v1/ws/alerts & Telegram Bot API',
  },
];

const HARDWARE_SPECS = [
  {
    unit: 'ESP32-CAM + OV3660',
    boardProfile: 'AI Thinker ESP32-CAM',
    firmware: 'hardware/esp32_cam_stream.ino',
    role: 'Thu hình ảnh JPEG (XCLK 20MHz, VGA khi có PSRAM), phát luồng MJPEG tại cổng :81/stream và chẩn đoán tại cổng :82.',
  },
  {
    unit: 'ESP32 DevKit V1',
    boardProfile: 'ESP32 Dev Module',
    firmware: 'hardware/esp32_cam_radar.ino',
    role: 'Đọc dữ liệu Radar qua UART2 (256000 baud), giao tiếp MQTT và xuất xung PWM điều khiển 2 trục Servo PAN/TILT.',
  },
  {
    unit: 'Radar mmWave HLK-LD2450',
    boardProfile: 'UART 256000 baud, 8N1',
    firmware: 'TX -> GPIO32 | RX -> GPIO17',
    role: 'Đo tọa độ mục tiêu (x, y) theo đơn vị mm và vận tốc di chuyển theo thời gian thực bất chấp điều kiện ánh sáng.',
  },
  {
    unit: '2x Servo MG996R + XL4015',
    boardProfile: 'PAN: GPIO13 | TILT: GPIO27',
    firmware: 'Rail 5V độc lập (Adapter 12V/5A)',
    role: 'Quay cơ khí 2 trục theo chế độ MANUAL (legacy_step) hoặc AUTO. Nối chung GND nguồn 5V với GND ESP32.',
  },
];

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/video/stream', desc: 'Luồng MJPEG đã vẽ khung xương và trạng thái AI' },
  { method: 'GET', path: '/api/v1/video/live', desc: 'Luồng MJPEG gốc (RAW) tốc độ cao cho Dashboard' },
  { method: 'GET', path: '/api/v1/video/status', desc: 'Thông số FPS thực tế, độ trễ giải mã, trạng thái AI worker' },
  { method: 'GET', path: '/api/v1/radar/status', desc: 'Tọa độ radar mới nhất, độ tươi dữ liệu và trạng thái vùng' },
  { method: 'GET/POST', path: '/api/v1/config/zones', desc: 'Đọc và lưu tọa độ vùng SAFE / DANGER vào SQLite' },
  { method: 'GET/POST', path: '/api/v1/config/room', desc: 'Cấu hình kích thước phòng, gốc tọa độ và góc lắp radar' },
  { method: 'POST', path: '/api/v1/camera/move', desc: 'Gửi lệnh bước điều khiển thủ công (LEFT, RIGHT, UP, DOWN, RESET)' },
  { method: 'GET/POST', path: '/api/v1/camera/mode', desc: 'Đọc hoặc chuyển đổi chế độ điều khiển MANUAL / AUTO' },
  { method: 'WS', path: '/api/v1/ws/alerts', desc: 'Kênh WebSocket đẩy cảnh báo té ngã và vùng nguy hiểm tức thì' },
];

const TROUBLESHOOTING_ITEMS = [
  {
    symptom: 'Servo rung giật hoặc ESP32 tự khởi động lại khi quay',
    cause: 'Sụt áp trên đường 5V khi hai servo MG996R đề-pa cùng lúc hoặc thiếu kết nối GND chung.',
    fix: 'Đo trực tiếp áp 5V ngay tại tải servo khi khởi động; dùng dây nguồn đủ tiết diện từ module hạ áp XL4015 và nối chung GND nguồn ngoài với GND ESP32.',
  },
  {
    symptom: 'Lệch chân điều khiển TILT giữa sơ đồ dây và code',
    cause: 'Firmware mặc định dùng GPIO27 cho TILT, trong khi GPIO12 trên ESP32 cổ điển là chân strapping ảnh hưởng quá trình boot.',
    fix: 'Sử dụng đúng GPIO13 cho PAN và GPIO27 cho TILT như trong esp32_cam_radar.ino.',
  },
  {
    symptom: 'Có byte trên UART nhưng không giải mã được khung LD2450',
    cause: 'Sai tốc độ baud hoặc đấu nhầm chân TX/RX giữa cảm biến và ESP32 DevKit.',
    fix: 'Đảm bảo UART2 khởi tạo ở 256000 baud (8N1), chân TX của LD2450 nối vào RX2 (GPIO32) của ESP32. Serial Monitor debug vẫn giữ ở 115200 baud.',
  },
  {
    symptom: 'Đổi mạng Wi-Fi hoặc IP máy tính làm mất kết nối MQTT và Camera',
    cause: 'Địa chỉ broker được biên dịch cứng trong firmware DevKit và IP động DHCP của ESP32-CAM đã thay đổi.',
    fix: 'Cập nhật cùng IPv4 của máy chạy Mosquitto vào cả backend/.env (MQTT_BROKER) và esp32_cam_radar.ino. Với ESP32-CAM, lấy IP mới từ dòng [CAM-URL] và cập nhật VIDEO_SOURCE ngay trên giao diện Cài đặt.',
  },
];

const HARDWARE_PINOUT = [
  {
    module: 'HLK-LD2450 (24GHz mmWave Radar)',
    connection: [
      { pinFrom: 'VCC (5V)', pinTo: '5V Rail (XL4015 Buck)', signal: 'Nguồn cấp 5V ổn định (>200mA)' },
      { pinFrom: 'GND', pinTo: 'Common GND', signal: 'Mass chung toàn mạch' },
      { pinFrom: 'UART_TX', pinTo: 'ESP32 GPIO32 (RX2)', signal: 'Truyền khung 24-byte ở 256000 baud (8N1)' },
      { pinFrom: 'UART_RX', pinTo: 'ESP32 GPIO17 (TX2)', signal: 'Nhận lệnh cấu hình vùng radar' },
    ],
    note: 'Tuyệt đối không dùng tốc độ 115200 baud cho UART2 vì cảm biến HLK-LD2450 xuất dữ liệu mặc định ở 256000 baud.',
  },
  {
    module: 'Cụm Gimbal 2x Servo MG996R (Pan / Tilt)',
    connection: [
      { pinFrom: 'Servo PAN (Cam)', pinTo: 'ESP32 GPIO13 (PWM)', signal: 'Xung điều khiển góc xoay ngang (10° - 170°)' },
      { pinFrom: 'Servo TILT (Cam)', pinTo: 'ESP32 GPIO27 (PWM)', signal: 'Xung điều khiển góc gập dọc (20° - 160°)' },
      { pinFrom: 'V+ (Đỏ - 2 Servo)', pinTo: 'VOUT+ (5V XL4015 Buck)', signal: 'Nguồn dòng cao 5V/3A độc lập' },
      { pinFrom: 'GND (Nâu - 2 Servo)', pinTo: 'Common GND (ESP32 + Buck)', signal: 'Nối chung GND để đồng bộ mức logic PWM' },
    ],
    note: 'Tránh sử dụng chân GPIO12 trên ESP32 cho Servo vì đây là chân strapping quyết định điện áp flash khi khởi động.',
  },
  {
    module: 'ESP32-CAM AI-Thinker (OV2640 VGA Stream)',
    connection: [
      { pinFrom: '5V Pin', pinTo: '5V Rail / Đế nạp MB', signal: 'Cấp nguồn 5V riêng để tránh sụt áp khi phát Wi-Fi' },
      { pinFrom: 'GND', pinTo: 'Common GND', signal: 'Mass chung' },
      { pinFrom: 'HTTP :81/stream', pinTo: 'FastAPI VideoWorker', signal: 'Luồng MJPEG 640x480 (PSRAM enabled)' },
      { pinFrom: 'HTTP :82/snapshot', pinTo: 'Telegram Alert Worker', signal: 'Ảnh chụp tức thời khi xác nhận té ngã' },
    ],
    note: 'Bắt buộc chọn phân vùng Huge APP (3MB No OTA) và bật PSRAM trong Arduino IDE để đạt tốc độ 10-15 FPS ở độ phân giải VGA.',
  },
];

export default function FallGuardProjectPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('normal');
  const [customRadarPos, setCustomRadarPos] = useState<{ x_mm: number; y_mm: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string>('backend');
  const [activePhase, setActivePhase] = useState<string>('phase-01');
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'wiring' | 'env'>('wiring');
  const [envConfig, setEnvConfig] = useState({
    mqttBroker: '192.168.1.10',
    camIp: '192.168.1.50',
    aiFps: '15',
    servoProtocol: 'legacy_step',
    confirmSec: '2.0',
  });
  const [copiedEnv, setCopiedEnv] = useState(false);

  const radarSvgRef = useRef<SVGSVGElement | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    // Luôn giữ trang chi tiết FallGuard ở Dark Theme kể cả khi trang chủ đang bật Light Theme
    const wasLight = document.documentElement.classList.contains('light-theme');
    if (wasLight) {
      document.documentElement.classList.remove('light-theme');
    }

    const params = new URLSearchParams(window.location.search);
    const phaseParam = params.get('phase');
    if (phaseParam && /^phase-0[1-5]$/.test(phaseParam)) {
      setActivePhase(phaseParam);
      setTimeout(() => {
        document.getElementById('arch-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }

    return () => {
      if (wasLight) {
        document.documentElement.classList.add('light-theme');
      }
    };
  }, []);

  const current = SCENARIOS[activeScenario];
  const targetX = customRadarPos ? customRadarPos.x_mm : current.radar.x_mm;
  const targetY = customRadarPos ? customRadarPos.y_mm : current.radar.y_mm;

  // Tính góc Servo theo đúng công thức trong firmware esp32_cam_radar.ino
  const servoAngles = useMemo(() => {
    const cameraHeight = 2200; // mm
    const targetHeight = current.pose.isHorizontal ? 300 : 1000;
    const azimuth = (Math.atan2(targetX, targetY) * 180) / Math.PI;
    const pan = Math.round((90 - azimuth) * 10) / 10;
    const distance = Math.sqrt(targetX * targetX + targetY * targetY);
    const elevation = (Math.atan2(cameraHeight - targetHeight, distance) * 180) / Math.PI;
    const tilt = Math.round((90 - elevation) * 10) / 10;
    return {
      azimuth: Math.round(azimuth * 10) / 10,
      distance_m: (distance / 1000).toFixed(2),
      pan: Math.max(10, Math.min(170, pan)),
      tilt: Math.max(20, Math.min(160, tilt)),
    };
  }, [targetX, targetY, current.pose.isHorizontal]);

  // Chuyển đổi tọa độ mm (-2000..2000, 0..3600) sang tọa độ SVG (0..400, 0..280)
  const radarSvgPos = useMemo(() => {
    const svgX = ((targetX + 2000) / 4000) * 360 + 20;
    const svgY = (targetY / 3600) * 230 + 25;
    return { x: Math.max(24, Math.min(376, svgX)), y: Math.max(28, Math.min(255, svgY)) };
  }, [targetX, targetY]);

  const handleRadarClickOrDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;
    if (!radarSvgRef.current) return;
    const rect = radarSvgRef.current.getBoundingClientRect();
    const relX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0.1, Math.min(0.92, (e.clientY - rect.top) / rect.height));
    const x_mm = Math.round(relX * 4000 - 2000);
    const y_mm = Math.round(relY * 3600);
    setCustomRadarPos({ x_mm, y_mm });

    // Tự động chuyển kịch bản tương ứng với vùng người dùng kéo tới
    if (x_mm >= -1600 && x_mm <= -550 && y_mm >= 1100 && y_mm <= 2550) {
      setActiveScenario('safe_rest');
    } else if (x_mm >= 650 && x_mm <= 1750 && y_mm >= 900 && y_mm <= 2250) {
      setActiveScenario('danger_zone');
    }
  };

  const generatedEnvText = `# backend/.env - Cấu hình hệ thống FallGuard
SERVO_PROTOCOL=${envConfig.servoProtocol}
MQTT_BROKER=${envConfig.mqttBroker}
MQTT_PORT=1883
VIDEO_SOURCE=http://${envConfig.camIp}:81/stream
SNAPSHOT_URL=http://${envConfig.camIp}:82/snapshot
AI_FPS_LIMIT=${envConfig.aiFps}
POSE_MODEL_PATH=yolov8m-pose.pt
FALL_CONFIRM_SECONDS=${envConfig.confirmSec}
TELEGRAM_BOT_TOKEN=<your_botfather_token>
TELEGRAM_CHAT_ID=<your_caregiver_chat_id>`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generatedEnvText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const activeNodeObj = PIPELINE_NODES.find((n) => n.id === selectedNode) || PIPELINE_NODES[3];

  // Tọa độ khung xương 17 keypoints cho trạng thái Đứng vs Nằm ngang (viewBox 0 0 320 220)
  const skeletonPose = useMemo(() => {
    if (!current.pose.isHorizontal) {
      return {
        box: { x: 118, y: 24, w: 84, h: 174 },
        head: { x: 160, y: 46 },
        lShoulder: { x: 138, y: 74 },
        rShoulder: { x: 182, y: 74 },
        lElbow: { x: 128, y: 108 },
        rElbow: { x: 192, y: 108 },
        lWrist: { x: 132, y: 136 },
        rWrist: { x: 188, y: 136 },
        lHip: { x: 145, y: 128 },
        rHip: { x: 175, y: 128 },
        lKnee: { x: 143, y: 162 },
        rKnee: { x: 177, y: 162 },
        lAnkle: { x: 141, y: 190 },
        rAnkle: { x: 179, y: 190 },
        shoulderMid: { x: 160, y: 74 },
        hipMid: { x: 160, y: 128 },
      };
    }
    // Tư thế nằm ngang (Horizontal / Fall)
    return {
      box: { x: 48, y: 102, w: 224, h: 86 },
      head: { x: 76, y: 134 },
      lShoulder: { x: 106, y: 124 },
      rShoulder: { x: 110, y: 152 },
      lElbow: { x: 132, y: 114 },
      rElbow: { x: 138, y: 168 },
      lWrist: { x: 156, y: 118 },
      rWrist: { x: 164, y: 172 },
      lHip: { x: 176, y: 132 },
      rHip: { x: 178, y: 156 },
      lKnee: { x: 216, y: 128 },
      rKnee: { x: 220, y: 162 },
      lAnkle: { x: 252, y: 134 },
      rAnkle: { x: 256, y: 166 },
      shoulderMid: { x: 108, y: 138 },
      hipMid: { x: 177, y: 144 },
    };
  }, [current.pose.isHorizontal]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans selection:bg-[#4ade80] selection:text-black pb-32 relative overflow-x-hidden">
      {/* Thanh tiến trình cuộn trang mượt mà */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#4ade80] origin-left z-50 shadow-[0_0_12px_#4ade80]"
      />

      {/* Lưới nền và quầng sáng không gian */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,#4ade80_1px,transparent_0)] bg-[size:40px_40px]" />
      <div className="pointer-events-none fixed top-[-15%] right-[-5%] w-[38rem] h-[38rem] rounded-full bg-[#4ade80]/5 blur-[140px] z-0" />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-5%] w-[38rem] h-[38rem] rounded-full bg-[#3B82F6]/5 blur-[140px] z-0" />

      {/* Sticky Top Navigation */}
      <nav className="border-b border-[#333330] bg-[#0A0A0A]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link
          href="/#sec-fallguard"
          className="font-mono text-sm uppercase tracking-widest text-[#D8D8D1] hover:text-[#4ade80] transition-colors flex items-center gap-2.5"
        >
          <ArrowLeft size={16} />
          <HackerText text="TERMINAL_RETURN" />
        </Link>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/anphan991/Embedded_System"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-[#D8D8D1] hover:text-[#4ade80] border border-[#333330] hover:border-[#4ade80] px-4 py-2 transition-colors flex items-center gap-2"
          >
            <span>GITHUB_REPO</span>
            <ExternalLink size={14} />
          </a>
          <span className="font-mono text-xs text-[#4ade80] uppercase tracking-widest border border-[#4ade80]/40 bg-[#4ade80]/10 px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            FALLGUARD_V1
          </span>
        </div>
      </nav>

      <main className="max-w-[1340px] mx-auto px-6 md:px-12 pt-14 space-y-24 relative z-10">
        {/* 1. HERO HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="border border-[#333330] bg-[#0A0A0A] p-8 md:p-14 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#333330] pb-6 mb-10 font-mono text-xs md:text-sm text-[#A9A9A2]">
            <div className="flex items-center gap-3">
              <span className="text-[#4ade80] font-bold">[MISSION_ID: FALLGUARD]</span>
              <span>/</span>
              <span>POSE ESTIMATION + 24GHZ MMWAVE RADAR + PAN/TILT SERVO</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#4ade80]">● </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8 space-y-6">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-white leading-[1.05] tracking-tight">
                Project FallGuard: <br />
                <span className="italic text-[#4ade80]">Spatial Care &amp; Pose AI</span>
              </h1>
              <p className="text-[#D8D8D1] text-lg md:text-xl leading-relaxed max-w-3xl font-light">
                Hệ thống giám sát riêng tư hỗ trợ phát hiện té ngã cho người cao tuổi sống một mình.
                Kết hợp suy luận tư thế theo chuỗi thời gian (<span className="font-mono text-base text-white">YOLOv8m-pose + BoT-SORT</span>),
                định vị tọa độ bằng radar bước sóng milimet (<span className="font-mono text-base text-white">HLK-LD2450</span>),
                cơ cấu xoay camera hai trục (<span className="font-mono text-base text-white">2x MG996R</span>) và truy cập nội bộ qua{' '}
                <span className="font-mono text-base text-white">Tailscale Mesh VPN</span>.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-3 font-mono text-xs md:text-sm">
                {[
                  'Python 3.11+ / FastAPI',
                  'YOLOv8m-pose + OpenVINO',
                  'ESP32-CAM (OV3660)',
                  'ESP32 DevKit + LD2450',
                  'Mosquitto MQTT :1883',
                  'Next.js 16 + Tailwind v4',
                  'SQLite + Telegram Bot',
                  'Tailscale ACL',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 bg-[#111111] border border-[#333330] text-[#D8D8D1] hover:border-[#4ade80] transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 border border-[#333330] bg-[#111111] p-7 font-mono text-sm space-y-4">
              <div className="text-[#4ade80] uppercase tracking-widest border-b border-[#333330] pb-3 flex items-center justify-between font-bold">
                <span>TELEMETRY SPECS</span>
                <Activity size={16} />
              </div>
              <div className="space-y-3 text-[#D8D8D1]">
                <div className="flex justify-between">
                  <span className="text-[#A9A9A2]">Radar UART2:</span>
                  <span className="text-white font-semibold">256000 baud (8N1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A2]">Camera Stream:</span>
                  <span className="text-white font-semibold">MJPEG :81 (VGA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A2]">AI Ceiling:</span>
                  <span className="text-white font-semibold">15 FPS (Decoupled)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A2]">Alert Cooldown:</span>
                  <span className="text-white font-semibold">60s (Telegram Bot)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A2]">Private Access:</span>
                  <span className="text-[#4ade80] font-semibold">TCP 3000 / 8000</span>
                </div>
              </div>
              <div className="pt-3">
                <MagneticWrapper className="w-full">
                  <a
                    href="https://github.com/anphan991/Embedded_System"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 border border-[#4ade80] bg-[#4ade80] text-black hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs md:text-sm"
                  >
                    <span>Mở GitHub Repository</span>
                    <ExternalLink size={15} />
                  </a>
                </MagneticWrapper>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 2. INTERACTIVE SENSOR FUSION & POSE SKELETON SIMULATOR */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#333330] pb-4">
            <div>
              <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#4ade80] mb-1.5">
                01 / INTERACTIVE SENSOR FUSION SIMULATOR
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-white">
                Mô phỏng hợp nhất Radar mmWave, khung xương AI và góc Servo
              </h2>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs md:text-sm text-[#A9A9A2]">
              <span></span>
              {customRadarPos && (
                <button
                  onClick={() => setCustomRadarPos(null)}
                  className="px-3 py-1.5 border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Reset vị trí</span>
                </button>
              )}
            </div>
          </div>

          {/* 3-Column All-in-One Interactive Simulator: Radar (Left) + Pose & Logs (Center) + Scenario Column (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#0A0A0A] border border-[#333330] p-5 md:p-6 items-stretch">
            {/* Column 1 (Left - 4 cols): Interactive 2D Radar Room Map */}
            <div className="lg:col-span-4 flex flex-col justify-between border border-[#333330] bg-[#050505] p-4 md:p-5">
              <div>
                <div className="flex items-center justify-between font-mono text-xs border-b border-[#333330] pb-3 mb-3.5">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <Radio size={15} className="text-[#4ade80]" />
                    RADAR MAP (CLICK / DRAG)
                  </span>
                  <span className="text-[11px] text-[#4ade80]">256000 BAUD</span>
                </div>

                <div className="relative w-full aspect-[400/280] bg-[#080808] border border-[#222220] overflow-hidden select-none">
                  <svg
                    ref={radarSvgRef}
                    viewBox="0 0 400 280"
                    onPointerDown={handleRadarClickOrDrag}
                    onPointerMove={handleRadarClickOrDrag}
                    className="w-full h-full"
                  >
                    <defs>
                      <radialGradient id="radarField" cx="50%" cy="7%" r="85%">
                        <stop offset="0%" stopColor="rgba(74, 222, 128, 0.18)" />
                        <stop offset="65%" stopColor="rgba(59, 130, 246, 0.04)" />
                        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                      </radialGradient>
                    </defs>
                    <rect x="0" y="0" width="400" height="280" fill="url(#radarField)" />

                    {/* Grid Lines */}
                    {[60, 120, 180, 240, 300, 340].map((x) => (
                      <line key={`vx-${x}`} x1={x} y1={0} x2={x} y2={280} stroke="#1a1a18" strokeWidth="1" />
                    ))}
                    {[50, 100, 150, 200, 250].map((y) => (
                      <line key={`hy-${y}`} x1={0} y1={y} x2={400} y2={y} stroke="#1a1a18" strokeWidth="1" />
                    ))}

                    {/* Radar Coverage Arcs from origin (200, 20) */}
                    {[70, 140, 210].map((r) => (
                      <circle
                        key={`arc-${r}`}
                        cx={200}
                        cy={20}
                        r={r}
                        fill="none"
                        stroke="#262624"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* SAFE ZONE (Bed Area) */}
                    <rect
                      x={35}
                      y={95}
                      width={115}
                      height={110}
                      fill="rgba(59, 130, 246, 0.1)"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <text x={43} y={114} fill="#3B82F6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      SAFE_ZONE (BED)
                    </text>

                    {/* DANGER ZONE (Stairs / Wet Floor) */}
                    <rect
                      x={265}
                      y={75}
                      width={105}
                      height={95}
                      fill="rgba(245, 158, 11, 0.1)"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <text x={273} y={94} fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      DANGER_ZONE
                    </text>

                    {/* Radar Sensor Origin */}
                    <polygon points="193,10 207,10 200,24" fill="#4ade80" />
                    <text x={158} y={10} fill="#D8D8D1" fontSize="9" fontFamily="monospace">
                      LD2450 (0,0)
                    </text>

                    {/* Line of Sight from Radar/Camera to Target */}
                    <line
                      x1={200}
                      y1={20}
                      x2={radarSvgPos.x}
                      y2={radarSvgPos.y}
                      stroke={current.AlertState.strokeHex}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Animated Target Reticle */}
                    <motion.g
                      animate={{ x: radarSvgPos.x, y: radarSvgPos.y }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    >
                      <circle r={18} fill={current.AlertState.strokeHex} fillOpacity={0.18} />
                      <circle
                        r={11}
                        fill="none"
                        stroke={current.AlertState.strokeHex}
                        strokeWidth="1.2"
                        strokeDasharray="3 2"
                      />
                      <circle r={5.5} fill={current.AlertState.strokeHex} />
                      <text x={12} y={4} fill="#F5F5F0" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        ({targetX}, {targetY})
                      </text>
                    </motion.g>
                  </svg>
                </div>
              </div>

              {/* Gimbal Dial + Radar Telemetry Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 font-mono text-xs">
                <div className="bg-[#111111] border border-[#333330] p-2.5">
                  <div className="text-[#A9A9A2] text-[10px]">TỌA ĐỘ (X, Y)</div>
                  <div className="text-white font-semibold mt-0.5 truncate">
                    {targetX}, {targetY}
                  </div>
                </div>
                <div className="bg-[#111111] border border-[#333330] p-2.5">
                  <div className="text-[#A9A9A2] text-[10px]">CỰ LY / TỐC ĐỘ</div>
                  <div className="text-white font-semibold mt-0.5 truncate">
                    {servoAngles.distance_m}m | {current.radar.speed_cms}cm/s
                  </div>
                </div>
                <div className="bg-[#111111] border border-[#333330] p-2.5">
                  <div className="text-[#A9A9A2] text-[10px]">GÓC SERVO PWM</div>
                  <div className="text-[#4ade80] font-bold mt-0.5 truncate">
                    P:{servoAngles.pan}° T:{servoAngles.tilt}°
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 (Center - 5 cols): Animated 17-Keypoint Pose Skeleton + State Machine + Event Stream */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="border border-[#333330] bg-[#050505] p-4 md:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333330] pb-3 font-mono">
                  <span className="text-white text-xs font-semibold flex items-center gap-2">
                    <Video size={15} className="text-[#4ade80]" />
                    YOLOV8M-POSE &amp; STATE MACHINE
                  </span>
                  <span className={`px-2.5 py-0.5 border text-[11px] font-bold ${current.AlertState.badgeBg}`}>
                    {current.AlertState.status}
                  </span>
                </div>

                {/* Split View: Animated Skeleton Canvas + 4 Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  {/* Live Animated 17-Keypoint Skeleton SVG */}
                  <div className="sm:col-span-7 bg-[#080808] border border-[#222220] p-2.5 relative">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#A9A9A2] mb-1 px-1">
                      <span>CAM: 640x480</span>
                      <span className={current.AlertState.color}>
                        SPINE: {current.pose.spineAngle}° | AR: {current.pose.aspectRatio}
                      </span>
                    </div>

                    <svg viewBox="0 0 320 210" className="w-full aspect-[320/210] block">
                      {/* Reference Grid */}
                      {[64, 128, 192, 256].map((gx) => (
                        <line key={gx} x1={gx} y1={0} x2={gx} y2={210} stroke="#151513" strokeWidth="1" />
                      ))}
                      {[52, 105, 157].map((gy) => (
                        <line key={gy} x1={0} y1={gy} x2={320} y2={gy} stroke="#151513" strokeWidth="1" />
                      ))}

                      {/* Bounding Box */}
                      <motion.rect
                        animate={{
                          x: skeletonPose.box.x,
                          y: skeletonPose.box.y,
                          width: skeletonPose.box.w,
                          height: skeletonPose.box.h,
                        }}
                        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                        fill={current.AlertState.strokeHex}
                        fillOpacity="0.06"
                        stroke={current.AlertState.strokeHex}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />

                      {/* Limb Connections */}
                      {[
                        [skeletonPose.lShoulder, skeletonPose.rShoulder],
                        [skeletonPose.lShoulder, skeletonPose.lElbow],
                        [skeletonPose.lElbow, skeletonPose.lWrist],
                        [skeletonPose.rShoulder, skeletonPose.rElbow],
                        [skeletonPose.rElbow, skeletonPose.rWrist],
                        [skeletonPose.lShoulder, skeletonPose.lHip],
                        [skeletonPose.rShoulder, skeletonPose.rHip],
                        [skeletonPose.lHip, skeletonPose.rHip],
                        [skeletonPose.lHip, skeletonPose.lKnee],
                        [skeletonPose.lKnee, skeletonPose.lAnkle],
                        [skeletonPose.rHip, skeletonPose.rKnee],
                        [skeletonPose.rKnee, skeletonPose.rAnkle],
                      ].map(([p1, p2], idx) => (
                        <motion.line
                          key={idx}
                          animate={{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }}
                          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                          stroke="#D8D8D1"
                          strokeWidth="2"
                          strokeOpacity="0.75"
                        />
                      ))}

                      {/* Highlighted Spine Vector (Shoulder Center -> Hip Center) */}
                      <motion.line
                        animate={{
                          x1: skeletonPose.shoulderMid.x,
                          y1: skeletonPose.shoulderMid.y,
                          x2: skeletonPose.hipMid.x,
                          y2: skeletonPose.hipMid.y,
                        }}
                        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                        stroke={current.AlertState.strokeHex}
                        strokeWidth="3.5"
                      />

                      {/* Head Circle */}
                      <motion.circle
                        animate={{ cx: skeletonPose.head.x, cy: skeletonPose.head.y }}
                        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                        r="11"
                        fill="none"
                        stroke={current.AlertState.strokeHex}
                        strokeWidth="2"
                      />

                      {/* Keypoint Joints */}
                      {[
                        skeletonPose.lShoulder,
                        skeletonPose.rShoulder,
                        skeletonPose.lElbow,
                        skeletonPose.rElbow,
                        skeletonPose.lWrist,
                        skeletonPose.rWrist,
                        skeletonPose.lHip,
                        skeletonPose.rHip,
                        skeletonPose.lKnee,
                        skeletonPose.rKnee,
                        skeletonPose.lAnkle,
                        skeletonPose.rAnkle,
                      ].map((pt, idx) => (
                        <motion.circle
                          key={idx}
                          animate={{ cx: pt.x, cy: pt.y }}
                          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                          r="3.5"
                          fill="#4ade80"
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Right Side of Skeleton: 4 Key Metrics */}
                  <div className="sm:col-span-5 grid grid-cols-2 gap-2.5 font-mono">
                    <div className="p-2.5 bg-[#111111] border border-[#333330]">
                      <div className="text-[10px] text-[#A9A9A2]">SPINE ANGLE</div>
                      <div className="text-base text-white font-bold mt-0.5">
                        {current.pose.spineAngle}°
                      </div>
                      <div className="text-[10px] text-[#A9A9A2] mt-0.5">&lt;= 48°</div>
                    </div>
                    <div className="p-2.5 bg-[#111111] border border-[#333330]">
                      <div className="text-[10px] text-[#A9A9A2]">ASPECT RATIO</div>
                      <div className="text-base text-white font-bold mt-0.5">
                        {current.pose.aspectRatio}
                      </div>
                      <div className="text-[10px] text-[#A9A9A2] mt-0.5">&gt;= 1.18</div>
                    </div>
                    <div className="p-2.5 bg-[#111111] border border-[#333330]">
                      <div className="text-[10px] text-[#A9A9A2]">COM DROP</div>
                      <div className="text-base text-white font-bold mt-0.5">
                        {current.pose.dropRatio}h
                      </div>
                      <div className="text-[10px] text-[#A9A9A2] mt-0.5">Min: 0.30h</div>
                    </div>
                    <div className="p-2.5 bg-[#111111] border border-[#333330]">
                      <div className="text-[10px] text-[#A9A9A2]">CONFIDENCE</div>
                      <div className={`text-base font-bold mt-0.5 ${current.AlertState.color}`}>
                        {(current.pose.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-[#A9A9A2] mt-0.5 truncate">{current.pose.state}</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#D8D8D1] leading-relaxed">{current.summary}</p>
              </div>

              {/* Live Diagnostic Console Output */}
              <div className="border border-[#333330] bg-[#050505] p-4 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#A9A9A2] border-b border-[#333330] pb-1.5 mb-1.5">
                  <span>PIPELINE_EVENT_STREAM</span>
                  <span className="text-[#4ade80]">MOSQUITTO :1883 + FASTAPI :8000</span>
                </div>
                {current.logs.map((line, index) => (
                  <motion.div
                    key={`${activeScenario}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="text-[#D8D8D1] leading-snug flex gap-2"
                  >
                    <span className="text-[#4ade80] select-none font-bold">&gt;</span>
                    <span>{line}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 3 (Right - 3 cols): Vertical Scenario Selector Column */}
            <div className="lg:col-span-3 flex flex-col justify-between border border-[#333330] bg-[#050505] p-4 md:p-5 font-mono">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-[#333330] pb-3">
                  <span className="text-white font-semibold uppercase tracking-wider">
                    KỊCH BẢN MÔ PHỎNG
                  </span>
                  <span className="text-[11px] text-[#4ade80]">4 CASES</span>
                </div>

                <div className="flex flex-col gap-3">
                  {(Object.values(SCENARIOS) as ScenarioData[]).map((item) => {
                    const isSelected = item.id === activeScenario;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveScenario(item.id);
                          setCustomRadarPos(null);
                        }}
                        className={`w-full text-left p-3.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#4ade80] bg-[#111111] text-white shadow-[0_0_20px_rgba(74,222,128,0.12)]'
                            : 'border-[#333330] bg-[#0A0A0A] text-[#A9A9A2] hover:border-[#A9A9A2] hover:bg-[#0E0E0E]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest mb-1.5">
                          <span className={isSelected ? 'text-[#4ade80] font-bold' : 'text-[#A9A9A2]'}>
                            [{item.code}]
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border ${
                              isSelected
                                ? item.AlertState.badgeBg
                                : 'border-[#333330] text-[#A9A9A2]'
                            }`}
                          >
                            {item.pose.state}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm font-semibold text-[#F5F5F0] leading-snug">
                          {item.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222220] text-[11px] text-[#A9A9A2] leading-relaxed">
                <div className="text-[#4ade80] font-semibold mb-1">TƯƠNG TÁC TRỰC TIẾP</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE SYSTEM DATAFLOW TOPOLOGY */}
        <section className="space-y-8">
          <div className="border-b border-[#333330] pb-5">
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#4ade80] mb-2">
              02 / INTERACTIVE SYSTEM TOPOLOGY
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white">
              Kiến trúc luồng dữ liệu 
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono">
            {PIPELINE_NODES.map((node, index) => {
              const isSelected = node.id === selectedNode;
              return (
                <TiltCard key={node.id}>
                  <button
                    onClick={() => setSelectedNode(node.id)}
                    className={`w-full h-full text-left p-5 border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-[#4ade80] bg-[#111111] shadow-[0_0_25px_rgba(74,222,128,0.12)]'
                        : 'border-[#333330] bg-[#0A0A0A] hover:border-[#A9A9A2]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#4ade80] mb-2">
                      <span>[{node.code}]</span>
                      <span>{index < 4 ? '───►' : '● END'}</span>
                    </div>
                    <div className="text-base font-bold text-white mb-1">{node.name}</div>
                    <div className="text-xs text-[#A9A9A2] mb-3">{node.tech}</div>
                    <div className="text-xs px-2.5 py-1 bg-[#050505] border border-[#333330] text-[#D8D8D1] inline-block">
                      {node.portOrLink}
                    </div>
                  </button>
                </TiltCard>
              );
            })}
          </div>

          {/* Selected Node Inspector Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNodeObj.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="border border-[#333330] bg-[#0A0A0A] p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-7 space-y-3">
                <div className="font-mono text-xs text-[#4ade80] uppercase tracking-widest">
                  [{activeNodeObj.code}] INSPECTOR // {activeNodeObj.tech}
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-white font-light">
                  {activeNodeObj.name}
                </h3>
                <p className="text-base md:text-lg text-[#D8D8D1] leading-relaxed">
                  {activeNodeObj.details}
                </p>
              </div>
              <div className="lg:col-span-5 border border-[#333330] bg-[#050505] p-5 font-mono text-xs md:text-sm space-y-2">
                <div className="text-[#A9A9A2] uppercase tracking-widest text-xs border-b border-[#333330] pb-2">
                  PROTOCOL / PAYLOAD SIGNATURE
                </div>
                <div className="text-[#4ade80] break-all leading-relaxed pt-1">
                  {activeNodeObj.payloadExample}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 4. 5-PHASE TECHNICAL DOSSIER */}
        <section id="arch-section" className="space-y-8 scroll-mt-24">
          <div className="border-b border-[#333330] pb-5">
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#4ade80] mb-2">
              03 / TECHNICAL DOCUMENTATION BY SUBSYSTEM
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white">
              Thiết kế chi tiết
            </h2>
          </div>

          {/* Phase Navigation Bar */}
          <div className="flex flex-wrap gap-3 font-mono text-xs md:text-sm">
            {[
              { id: 'phase-01', label: '[01] Sơ đồ hệ thống' },
              { id: 'phase-02', label: '[02] Phần cứng & Nguồn 5V' },
              { id: 'phase-03', label: '[03] Thuật toán AI & Té ngã' },
              { id: 'phase-04', label: '[04] Động học Radar & Servo' },
              { id: 'phase-05', label: '[05] API, Tailscale và xử lý sự cố' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePhase(tab.id)}
                className={`px-5 py-3 border transition-all ${
                  activePhase === tab.id
                    ? 'border-[#4ade80] bg-[#4ade80] text-black font-bold'
                    : 'border-[#333330] bg-[#0A0A0A] text-[#D8D8D1] hover:border-[#4ade80]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Phase Content Container */}
          <div className="border border-[#333330] bg-[#0A0A0A] p-7 md:p-12">
            <AnimatePresence mode="wait">
              {activePhase === 'phase-01' && (
                <motion.div
                  key="phase-01"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  id="phase-01"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl md:text-4xl text-white font-light">
                      Phần 1: Sơ đồ luồng xử lý và phân tách nhiệm vụ
                    </h3>
                    <p className="text-[#D8D8D1] text-base md:text-lg leading-relaxed">
                      FallGuard tách biệt khâu thu thập dữ liệu phần cứng trên 2 vi điều khiển ESP32 và khâu suy luận AI trên máy chủ cục bộ. Luồng hình ảnh gốc (RAW MJPEG) và luồng tọa độ khung xương AI được tách rời để việc suy luận mô hình không bao giờ làm nghẽn tốc độ hiển thị video trên giao diện.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-3">
                      <div className="text-sm text-[#4ade80] font-bold flex items-center justify-between">
                        <span>01. EDGE SENSING LAYER</span>
                        <Cpu size={18} />
                      </div>
                      <p className="text-[#D8D8D1] font-sans text-base leading-relaxed">
                        <strong>ESP32-CAM (OV3660)</strong> phát luồng MJPEG qua HTTP cổng <code className="text-[#4ade80] font-mono">:81/stream</code>. Song song đó, <strong>ESP32 DevKit</strong> đọc khung dữ liệu UART 256000 baud từ radar <strong>HLK-LD2450</strong> và publish lên MQTT topic <code className="text-[#4ade80] font-mono">embedded/radar/data</code>.
                      </p>
                    </div>

                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-3">
                      <div className="text-sm text-[#3B82F6] font-bold flex items-center justify-between">
                        <span>02. CORE AI &amp; BROKER LAYER</span>
                        <Layers size={18} />
                      </div>
                      <p className="text-[#D8D8D1] font-sans text-base leading-relaxed">
                        <strong>FastAPI Backend</strong> giải mã khung hình mới nhất bằng OpenCV, chạy <strong>YOLOv8m-pose + BoT-SORT</strong>, đối chiếu tọa độ vùng <strong>SAFE / DANGER</strong> từ Mosquitto MQTT, lưu sự kiện vào SQLite và tính lệnh điều khiển góc quay.
                      </p>
                    </div>

                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-3">
                      <div className="text-sm text-purple-400 font-bold flex items-center justify-between">
                        <span>03. ACTUATION &amp; CAREGIVER UI</span>
                        <Network size={18} />
                      </div>
                      <p className="text-[#D8D8D1] font-sans text-base leading-relaxed">
                        Lệnh điều khiển quay về ESP32 DevKit qua MQTT để lái 2 servo <strong>MG996R (PAN/TILT)</strong>. Cảnh báo đẩy tức thời qua <strong>WebSocket</strong> lên Dashboard Next.js 16 và gửi tin nhắn qua <strong>Telegram Bot</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#333330] bg-[#050505] p-6 font-mono text-sm">
                    <div className="text-[#4ade80] mb-3 uppercase tracking-widest font-semibold">
                      Cấu trúc thư mục 
                    </div>
                    <pre className="text-[#D8D8D1] overflow-x-auto leading-relaxed">
{`Embedded_System/
├── backend/
│   ├── main.py                    # FastAPI, MQTT client, camera/AI workers, REST & WebSocket
│   ├── fall_detection.py          # Máy trạng thái đánh giá tư thế té ngã theo chuỗi thời gian
│   ├── servo_protocol.py          # Xử lý giao thức điều khiển servo (legacy_step)
│   ├── database.py                # Lưu trữ cấu hình phòng, vùng và sự kiện bằng SQLite
│   └── mosquitto_local.conf       # Cấu hình MQTT broker nội bộ trên cổng TCP 1883
├── frontend/
│   └── app/                       # Next.js 16 Dashboard, CameraControlPanel, RadarMap, Analytics
└── hardware/
    ├── esp32_cam_stream.ino       # Firmware nạp cho AI Thinker ESP32-CAM (OV3660)
    └── esp32_cam_radar.ino        # Firmware nạp cho ESP32 DevKit (LD2450 + 2x Servo MG996R)`}
                    </pre>
                  </div>
                </motion.div>
              )}

              {activePhase === 'phase-02' && (
                <motion.div
                  key="phase-02"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  id="phase-02"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl md:text-4xl text-white font-light">
                      Phần 2: Thiết kế phần cứng, sơ đồ chân và bài toán cấp nguồn
                    </h3>
                    <p className="text-[#D8D8D1] text-base md:text-lg leading-relaxed">
                      Hệ thống sử dụng hai bo mạch ESP32 độc lập với hai firmware riêng biệt. Không nạp chéo firmware giữa ESP32-CAM và ESP32 DevKit.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-[#333330]">
                    <table className="w-full text-left font-mono text-sm">
                      <thead className="bg-[#111111] text-[#4ade80] uppercase border-b border-[#333330]">
                        <tr>
                          <th className="p-4">Thiết bị</th>
                          <th className="p-4">Cấu hình Board / Giao tiếp</th>
                          <th className="p-4">Firmware / Kết nối</th>
                          <th className="p-4">Nhiệm vụ chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333330] text-[#D8D8D1]">
                        {HARDWARE_SPECS.map((row) => (
                          <tr key={row.unit} className="hover:bg-[#111111]/60">
                            <td className="p-4 font-bold text-white">{row.unit}</td>
                            <td className="p-4 text-[#A9A9A2]">{row.boardProfile}</td>
                            <td className="p-4 text-[#4ade80]">{row.firmware}</td>
                            <td className="p-4 font-sans text-base">{row.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-3">
                      <div className="font-mono text-sm text-[#4ade80] font-bold uppercase tracking-widest">
                        Sơ đồ chân trên ESP32 DevKit (esp32_cam_radar.ino)
                      </div>
                      <ul className="space-y-2.5 text-base text-[#D8D8D1] font-mono">
                        <li>• Servo PAN PWM: <span className="text-white font-bold">GPIO13</span></li>
                        <li>• Servo TILT PWM: <span className="text-white font-bold">GPIO27</span></li>
                        <li>• Radar LD2450 TX -&gt; ESP32 RX2: <span className="text-white font-bold">GPIO32</span></li>
                        <li>• Radar LD2450 RX -&gt; ESP32 TX2: <span className="text-white font-bold">GPIO17</span></li>
                      </ul>
                      <p className="text-sm text-[#A9A9A2] leading-relaxed pt-2">
                        Lưu ý: Chân GPIO12 là chân strapping trên dòng ESP32 cổ điển, có thể gây lỗi không khởi động được nếu bị kéo áp lúc cấp nguồn. Vì vậy trục TILT được chuẩn hóa sang GPIO27.
                      </p>
                    </div>

                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-3">
                      <div className="font-mono text-sm text-amber-400 font-bold uppercase tracking-widest">
                        Nguyên tắc cấp nguồn cho 2 Servo MG996R
                      </div>
                      <p className="text-base text-[#D8D8D1] leading-relaxed">
                        Không lấy nguồn 5V hoặc 3.3V từ chân GPIO của ESP32 để nuôi servo MG996R. Hệ thống dùng <strong>Adapter 12V / 5A</strong> qua mạch hạ áp <strong>XL4015</strong> xuống 5V cấp riêng cho servo, đồng thời <strong>nối chung GND của nguồn servo với GND của ESP32</strong> để tín hiệu PWM có cùng mốc điện áp tham chiếu.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePhase === 'phase-03' && (
                <motion.div
                  key="phase-03"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  id="phase-03"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl md:text-4xl text-white font-light">
                      Phần 3: Pipeline AI và thuật toán đánh giá té ngã theo chuỗi thời gian
                    </h3>
                    <p className="text-[#D8D8D1] text-base md:text-lg leading-relaxed">
                      Thay vì kết luận ngã chỉ dựa trên một khung hình nằm ngang, module <code className="font-mono text-[#4ade80]">fall_detection.py</code> theo dõi tiến trình biến đổi tư thế theo từng ID đối tượng (duy trì qua BoT-SORT): trạng thái đứng trước đó, tốc độ hạ trọng tâm chuẩn hóa theo chiều cao người, góc nghiêng cột sống và độ ổn định sau va chạm.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border border-[#333330] bg-[#050505] p-6 font-mono text-sm space-y-4">
                      <div className="text-[#4ade80] font-bold uppercase tracking-widest">
                        Công thức hình học tư thế &amp; lọc nhiễu EMA
                      </div>
                      <pre className="text-[#D8D8D1] overflow-x-auto leading-relaxed">
{`# 1. Tỷ lệ khung bao (Bounding Box Aspect Ratio)
box_width    = x2 - x1
box_height   = y2 - y1
aspect_ratio = box_width / max(box_height, epsilon)

# 2. Góc nghiêng cột sống từ tâm vai (sx, sy) và tâm hông (hx, hy)
spine_angle  = degrees(atan2(abs(hy - sy), abs(hx - sx)))
# Gần 90 độ: thân thẳng đứng | Gần 0 độ: thân nằm ngang

# 3. Bộ lọc trung bình trượt hàm mũ (EMA)
filtered     = alpha * current + (1 - alpha) * previous_filtered`}
                      </pre>
                    </div>

                    <div className="border border-[#333330] bg-[#111111] p-6 space-y-4">
                      <div className="font-mono text-sm text-[#3B82F6] font-bold uppercase tracking-widest">
                        Cơ chế chống báo động giả (False-Positive Suppression)
                      </div>
                      <ul className="space-y-3.5 text-base text-[#D8D8D1] leading-relaxed">
                        <li>
                          <strong className="text-white font-mono">1. OBSERVED_HORIZONTAL:</strong> Nếu đối tượng xuất hiện trong khung hình đã ở sẵn tư thế nằm ngang mà không có lịch sử đứng/chuyển động rơi trước đó, hệ thống không báo ngã.
                        </li>
                        <li>
                          <strong className="text-white font-mono">2. SAFE ZONE Fusion:</strong> Khi radar mmWave có tọa độ mới (&lt;= 2 giây) nằm trong vùng <code className="font-mono text-[#3B82F6]">SAFE</code> (như giường ngủ) và không chồng lấn vùng <code className="font-mono text-amber-400">DANGER</code>, hệ thống gắn nhãn <code className="font-mono text-[#3B82F6]">SAFE ZONE</code> và bỏ qua cảnh báo ngã.
                        </li>
                        <li>
                          <strong className="text-white font-mono">3. Multi-Person MUTED:</strong> Khi có từ 2 người trở lên với keypoint thân đủ tin cậy trong khung hình, cảnh báo ngã tạm chuyển sang <code className="font-mono text-[#A9A9A2]">MUTED</code> để tránh gán nhầm ID.
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePhase === 'phase-04' && (
                <motion.div
                  key="phase-04"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  id="phase-04"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl md:text-4xl text-white font-light">
                      Phần 4: Chuyển đổi tọa độ Radar mmWave và điều khiển bám mục tiêu
                    </h3>
                    <p className="text-[#D8D8D1] text-base md:text-lg leading-relaxed">
                      Hệ thống ưu tiên dữ liệu tọa độ từ cảm biến radar HLK-LD2450 khi dữ liệu còn mới, và tự động chuyển sang bám theo tâm khung hình YOLO (640x480) làm phương án dự phòng khi mất tín hiệu radar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-sm">
                    <div className="border border-[#333330] bg-[#050505] p-6 space-y-3">
                      <div className="text-[#4ade80] font-bold uppercase tracking-widest">
                        1. Tính góc quay PAN / TILT từ tọa độ Radar (mm)
                      </div>
                      <pre className="text-[#D8D8D1] overflow-x-auto leading-relaxed">
{`azimuth   = atan2(x, y) * 180 / pi
PAN       = 90 - azimuth

distance  = sqrt(x*x + y*y)
elevation = atan2(camera_height - target_height, distance) * 180 / pi
TILT      = 90 - elevation`}
                      </pre>
                    </div>

                    <div className="border border-[#333330] bg-[#050505] p-6 space-y-3">
                      <div className="text-[#3B82F6] font-bold uppercase tracking-widest">
                        2. Bám theo hình ảnh (Vision Fallback 640x480) &amp; Tọa độ phòng
                      </div>
                      <pre className="text-[#D8D8D1] overflow-x-auto leading-relaxed">
{`# Điều chỉnh tỷ lệ theo độ lệch tâm ảnh (320, 240)
error_x = x_normalized - 320
error_y = y_normalized - 240
PAN    -= gain_pan  * error_x
TILT   += gain_tilt * error_y

# Phép xoay & tịnh tiến từ hệ trục cảm biến sang bản đồ phòng
X_room  = radar_x + x*cos(theta) + y*sin(theta)
Y_room  = radar_y - x*sin(theta) + y*cos(theta)`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePhase === 'phase-05' && (
                <motion.div
                  key="phase-05"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  id="phase-05"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl md:text-4xl text-white font-light">
                      Phần 5: Giao thức API, truy cập riêng tư với Tailscale &amp; Xử lý sự cố
                    </h3>
                    <p className="text-[#D8D8D1] text-base md:text-lg leading-relaxed">
                      Để bảo vệ quyền riêng tư, toàn bộ luồng video và AI được xử lý trên máy chủ gia đình. Người chăm sóc truy cập Dashboard từ điện thoại hoặc máy tính bảng bên ngoài thông qua mạng riêng ảo <strong>Tailscale</strong> (chỉ cấp quyền ACL cho cổng TCP 3000 và TCP 8000), không cần mở cổng (port-forward) camera hay MQTT broker ra Internet công cộng.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-[#333330]">
                    <table className="w-full text-left font-mono text-sm">
                      <thead className="bg-[#111111] text-[#4ade80] uppercase border-b border-[#333330]">
                        <tr>
                          <th className="p-4">Method</th>
                          <th className="p-4">Endpoint (Port :8000)</th>
                          <th className="p-4">Chức năng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333330] text-[#D8D8D1]">
                        {API_ENDPOINTS.map((ep) => (
                          <tr key={ep.path} className="hover:bg-[#111111]/60">
                            <td className="p-4 text-[#4ade80] font-bold">{ep.method}</td>
                            <td className="p-4 text-white font-semibold">{ep.path}</td>
                            <td className="p-4 font-sans text-base">{ep.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4">
                    <div className="font-mono text-sm text-amber-400 font-bold uppercase tracking-widest">
                      Chẩn đoán và xử lý sự cố
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {TROUBLESHOOTING_ITEMS.map((item) => (
                        <div
                          key={item.symptom}
                          className="border border-[#333330] bg-[#111111] p-6 space-y-2.5"
                        >
                          <div className="font-mono text-sm font-bold text-white flex items-start gap-2.5">
                            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                            <span>{item.symptom}</span>
                          </div>
                          <p className="text-sm text-[#A9A9A2] leading-relaxed">
                            <strong>Nguyên nhân:</strong> {item.cause}
                          </p>
                          <p className="text-sm text-[#D8D8D1] leading-relaxed">
                            <strong className="text-[#4ade80]">Khắc phục:</strong> {item.fix}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 5. HARDWARE PINOUT & DEPLOYMENT CONFIGURATOR */}
        <section className="space-y-6">
          <div className="border-b border-[#333330] pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#4ade80] mb-1.5">
                04 / HARDWARE PINOUT &amp; DEPLOYMENT BLUEPRINT
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-white">
                Đấu nối phần cứng và cấu hình
              </h2>
            </div>

            {/* 2 Practical Blueprint Tabs */}
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {[
                { id: 'wiring' as const, label: '[01] SƠ ĐỒ ĐẤU NỐI (PINOUT)', icon: Wrench },
                { id: 'env' as const, label: '[02] .ENV & KHỞI CHẠY', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeBlueprintTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveBlueprintTab(tab.id)}
                    className={`px-4 py-2.5 border transition-all flex items-center gap-2 cursor-pointer ${
                      active
                        ? 'border-[#4ade80] bg-[#111111] text-[#4ade80] font-bold shadow-[0_0_18px_rgba(74,222,128,0.12)]'
                        : 'border-[#333330] bg-[#0A0A0A] text-[#D8D8D1] hover:border-[#A9A9A2]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-[#333330] bg-[#0A0A0A] p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeBlueprintTab === 'wiring' && (
                <motion.div
                  key="wiring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {HARDWARE_PINOUT.map((group) => (
                      <div
                        key={group.module}
                        className="border border-[#333330] bg-[#050505] p-5 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="font-mono text-xs md:text-sm font-bold text-[#4ade80] border-b border-[#333330] pb-2.5">
                            {group.module}
                          </div>
                          <div className="space-y-2.5 font-mono text-xs">
                            {group.connection.map((c) => (
                              <div key={c.pinFrom} className="bg-[#111111] border border-[#262624] p-2.5 space-y-1">
                                <div className="flex items-center justify-between text-white font-semibold">
                                  <span>{c.pinFrom}</span>
                                  <span className="text-[#4ade80]">-&gt;</span>
                                  <span className="text-[#3B82F6]">{c.pinTo}</span>
                                </div>
                                <div className="text-[11px] text-[#A9A9A2] font-sans">{c.signal}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 p-3 leading-relaxed">
                          <strong className="font-mono uppercase mr-1">Lưu ý phần cứng:</strong>
                          {group.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeBlueprintTab === 'env' && (
                <motion.div
                  key="env"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                  {/* Left: Interactive Config Form */}
                  <div className="lg:col-span-5 border border-[#333330] bg-[#050505] p-5 space-y-4 font-mono text-xs">
                    <div className="text-white font-bold uppercase tracking-wider border-b border-[#333330] pb-2.5">
                      THÔNG SỐ MẠNG &amp; AI TÙY CHỈNH
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[#A9A9A2]">IP Máy chủ MQTT Broker (Mosquitto)</label>
                      <input
                        type="text"
                        value={envConfig.mqttBroker}
                        onChange={(e) => setEnvConfig({ ...envConfig, mqttBroker: e.target.value })}
                        className="w-full bg-[#111111] border border-[#333330] focus:border-[#4ade80] px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[#A9A9A2]">IP Module ESP32-CAM (Cổng :81 / :82)</label>
                      <input
                        type="text"
                        value={envConfig.camIp}
                        onChange={(e) => setEnvConfig({ ...envConfig, camIp: e.target.value })}
                        className="w-full bg-[#111111] border border-[#333330] focus:border-[#4ade80] px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[#A9A9A2]">Giới hạn AI FPS</label>
                        <select
                          value={envConfig.aiFps}
                          onChange={(e) => setEnvConfig({ ...envConfig, aiFps: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333330] focus:border-[#4ade80] px-3 py-2 text-white outline-none"
                        >
                          <option value="10">10 FPS (Tiết kiệm CPU)</option>
                          <option value="15">15 FPS (Khuyên dùng)</option>
                          <option value="20">20 FPS (GPU rời)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[#A9A9A2]">Thời gian xác nhận ngã</label>
                        <select
                          value={envConfig.confirmSec}
                          onChange={(e) => setEnvConfig({ ...envConfig, confirmSec: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333330] focus:border-[#4ade80] px-3 py-2 text-white outline-none"
                        >
                          <option value="1.5">1.5 giây (Nhạy cao)</option>
                          <option value="2.0">2.0 giây (Mặc định)</option>
                          <option value="3.0">3.0 giây (Chống báo giả)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[#A9A9A2]">Giao thức điều khiển Servo MQTT</label>
                      <select
                        value={envConfig.servoProtocol}
                        onChange={(e) => setEnvConfig({ ...envConfig, servoProtocol: e.target.value })}
                        className="w-full bg-[#111111] border border-[#333330] focus:border-[#4ade80] px-3 py-2 text-white outline-none"
                      >
                        <option value="legacy_step">legacy_step (LEFT / RIGHT / UP / DOWN / RESET)</option>
                        <option value="angle_direct">angle_direct (Góc tuyệt đối PAN / TILT)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Generated backend/.env & Startup Commands */}
                  <div className="lg:col-span-7 border border-[#333330] bg-[#050505] p-5 flex flex-col justify-between space-y-4 font-mono text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#333330] pb-2.5">
                        <span className="text-[#4ade80] font-bold">FILE CẤU HÌNH: backend/.env</span>
                        <button
                          onClick={handleCopyEnv}
                          className="px-3 py-1 border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedEnv ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedEnv ? 'Đã sao chép' : 'Sao chép .env'}</span>
                        </button>
                      </div>

                      <pre className="bg-[#0A0A0A] border border-[#222220] p-4 text-[#D8D8D1] overflow-x-auto leading-relaxed">
                        {generatedEnvText}
                      </pre>
                    </div>

                    <div className="space-y-2 border-t border-[#222220] pt-3">
                      <div className="text-white font-semibold">LỆNH KHỞI CHẠY NHANH (BACKEND &amp; DASHBOARD):</div>
                      <pre className="bg-[#0A0A0A] border border-[#222220] p-3 text-[#4ade80] overflow-x-auto leading-relaxed">
{`# 1. Khởi chạy AI Backend (FastAPI + YOLOv8m-pose + MQTT Worker)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000

# 2. Khởi chạy Giao diện Giám sát (Next.js Dashboard)
cd frontend && npm run dev`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Bottom Return Link */}
        <div className="pt-8 border-t border-[#333330] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm">
          <Link
            href="/#sec-fallguard"
            className="uppercase tracking-widest text-[#D8D8D1] hover:text-[#4ade80] transition-colors inline-flex items-center gap-2.5 border border-[#333330] hover:border-[#4ade80] px-6 py-3"
          >
            <ArrowLeft size={16} />
            <span>[ RETURN TO MAIN TERMINAL ]</span>
          </Link>
          <a
            href="https://github.com/anphan991/Embedded_System"
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase tracking-widest text-[#4ade80] hover:underline inline-flex items-center gap-2"
          >
            <span>github.com/anphan991/Embedded_System</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </main>
    </div>
  );
}
