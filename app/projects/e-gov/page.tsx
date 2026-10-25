'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  FileCheck2,
  FileWarning,
  Server,
  Database,
  Clock,
  Terminal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  Fingerprint,
} from 'lucide-react';
import HackerText from '@/components/HackerText';
import { triggerAura } from '@/lib/aura';

type SimulationModeId = 'normal_sign' | 'tamper_attack' | 'replay_attack' | 'ocsp_killswitch';

interface SimulationScenario {
  id: SimulationModeId;
  badge: string;
  title: string;
  command: string;
  httpStatus: string;
  verdict: 'VALIDATED' | 'TAMPER_BLOCKED' | 'REPLAY_REJECTED' | 'CERT_REVOKED';
  accentColor: string;
  summary: string;
  byteRangePreview: string;
  sha256Digest: string;
  hsmAction: string;
  tsaStatus: string;
  ocspStatus: string;
  wormBlockStatus: string;
  terminalLogs: string[];
}

const SCENARIOS: Record<SimulationModeId, SimulationScenario> = {
  normal_sign: {
    id: 'normal_sign',
    badge: 'FLOW_01 // PADES_REMOTE_SIGN',
    title: 'Ký số PAdES-B-LT Zero-Trust (OIDC + SoftHSM2 + TSA)',
    command: 'POST https://localhost/api/sign [Bearer OIDC_JWT + MFA: 246810]',
    httpStatus: 'HTTP 200 OK',
    verdict: 'VALIDATED',
    accentColor: '#3B82F6',
    summary:
      'Người dùng xác thực qua Keycloak OIDC, gửi yêu cầu ký kèm mã MFA và Nonce. Signing Gateway xác minh JWKS rồi chuyển tiếp qua mTLS nội bộ tới TSP Server để ký ECDSA-SHA256 trực tiếp trong vùng an toàn SoftHSM2 (PKCS#11 Slot 0x02), đóng dấu thời gian RFC 3161 và ghi WORM.',
    byteRangePreview: '/ByteRange [ 0 18420 51188 14902 ]',
    sha256Digest: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    hsmAction: 'PKCS#11 C_Sign (CKM_ECDSA, Key ID 0x02) -> 64B raw (r,s) -> ASN.1 DER',
    tsaStatus: 'RFC 3161 TimeStampToken (OID 2.16.840.1.101.3.4.2.1) Embedded',
    ocspStatus: 'GOOD (RFC 6960 Live Responder :4080)',
    wormBlockStatus: 'APPENDED // Block #0042 Linked to #0041',
    terminalLogs: [
      '[GATEWAY :4100] JWKS RS256 token verified for subject: citizen001',
      '[GATEWAY :4100] Nonce 9a8f...3c12 accepted (Freshness window < 300s)',
      '[TSP :4000] mTLS Peer Verified: CN=signing-gateway (Internal CA)',
      '[PKCS#11 HSM] Slot 0x02 Session RW -> CKM_ECDSA Sign completed (DER 71 bytes)',
      '[TSA :4300] RFC 3161 TimeStampResp status=0 (Granted) embedded in CMS',
      '[WORM :4200] Block #0042 committed: entryHash=5c9e...81a0 (HMAC OK)',
    ],
  },
  tamper_attack: {
    id: 'tamper_attack',
    badge: 'ATTACK_01 // CWE-345_TAMPER',
    title: 'Tấn công sửa đổi 1 Byte trên tài liệu PDF đã ký (ByteRange Mismatch)',
    command: 'VERIFIER_BASE_URL=http://127.0.0.1:5000 npm run attack:tamper',
    httpStatus: 'HTTP 422 UNPROCESSABLE',
    verdict: 'TAMPER_BLOCKED',
    accentColor: '#EF4444',
    summary:
      'Kẻ tấn công can thiệp sửa 1 byte nội dung văn bản sau khi tài liệu đã được đóng dấu PAdES, hoặc tái sử dụng khối chữ ký PKCS#7 cũ ghép vào bản băm mới. Verifier bóc tách vùng /ByteRange, tính lại SHA-256 và lập tức phát hiện sai lệch đối chiếu với trường messageDigest trong cấu trúc CMS.',
    byteRangePreview: '/ByteRange [ 0 18420 51188 14902 ] (Byte 0x104F: 0x4A -> 0xFF)',
    sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hsmAction: 'N/A (Verification Phase - No HSM Private Key Invoked)',
    tsaStatus: 'TSA Token Intact, Document Imprint Mismatched',
    ocspStatus: 'GOOD (Certificate Valid, Document Corrupted)',
    wormBlockStatus: 'AUDIT ALERT // Tampered verification attempt logged',
    terminalLogs: [
      '[VERIFIER :5000] Extracting latest /ByteRange [0, 18420, 51188, 14902]',
      '[VERIFIER :5000] Recomputed PDF SHA-256: e3b0c442...b855',
      '[VERIFIER :5000] CMS SignedAttributes messageDigest: 8f434346...7aa4',
      '[CRITICAL] CWE-345 Violation: Document digest does not match signed payload!',
      '[VERIFIER :5000] Rejecting document before trust-anchor evaluation (valid: false)',
    ],
  },
  replay_attack: {
    id: 'replay_attack',
    badge: 'ATTACK_02 // CWE-294_REPLAY',
    title: 'Tấn công phát lại gói tin ký số (Nonce Reuse & Clock Skew)',
    command: 'REPLAY_COUNT=5 npm run attack:replay',
    httpStatus: 'HTTP 409 CONFLICT',
    verdict: 'REPLAY_REJECTED',
    accentColor: '#F59E0B',
    summary:
      'Kẻ tấn công bắt gói tin hợp lệ qua mạng và phát lại 5 lần liên tiếp cùng một tổ hợp JWT + Nonce + Timestamp nhằm ép HSM ký trùng lặp. Cả Signing Gateway và TSP Server đều thực thi bộ nhớ đệm seenNonces kết hợp thời gian 5 phút (300s) theo chuẩn NIST SP 800-207.',
    byteRangePreview: 'REQUEST BLOCKED AT ZERO-TRUST GATEWAY BOUNDARY',
    sha256Digest: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    hsmAction: 'BLOCKED (Request dropped before reaching PKCS#11 SoftHSM2)',
    tsaStatus: 'SKIPPED (Rejected at Gateway / TSP freshness guard)',
    ocspStatus: 'N/A',
    wormBlockStatus: 'SECURITY EVENT // 4/5 Replay attempts blocked & recorded',
    terminalLogs: [
      '[ATTACK_RUNNER] Sending Request #1 with Nonce 9a8f...3c12 -> HTTP 200 OK',
      '[ATTACK_RUNNER] Replaying Request #2 with Nonce 9a8f...3c12 -> HTTP 409',
      '[ATTACK_RUNNER] Replaying Request #3 with Nonce 9a8f...3c12 -> HTTP 409',
      '[TSP :4000] Error: Replay protection rejected a reused nonce (seenNonces hit)',
      '[SUMMARY] successCount: 1 | replayRejectedCount: 4 | HSM Protected',
    ],
  },
  ocsp_killswitch: {
    id: 'ocsp_killswitch',
    badge: 'DEFENSE_03 // OCSP_KILL_SWITCH',
    title: 'Thu hồi khẩn cấp chứng thư bị lộ khóa (RFC 6960 Live Revocation)',
    command: 'POST /api/revocations -H "X-Revocation-Admin-Token: ***" -d \'{"serialNumber":"0x4B91..."}\'',
    httpStatus: 'OCSP: REVOKED',
    verdict: 'CERT_REVOKED',
    accentColor: '#EF4444',
    summary:
      'Khi phát hiện nghi vấn lộ khóa hoặc thiết bị ký gặp sự cố, quản trị viên kích hoạt API Kill-Switch để đưa số Serial của chứng thư X.509 vào danh sách thu hồi tức thời. Máy chủ OCSP (:4080) và Verifier (:5000) lập tức từ chối mọi chữ ký phát sinh từ chứng thư này.',
    byteRangePreview: '/ByteRange [ 0 18420 51188 14902 ] (Math Valid, Signer Revoked)',
    sha256Digest: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    hsmAction: 'KEY SERIAL BLACKLISTED IN OCSP RESPONDER',
    tsaStatus: 'Timestamp Valid, Signer Trust Chain Terminated',
    ocspStatus: 'REVOKED (Reason: keyCompromise // Admin Kill-Switch)',
    wormBlockStatus: 'APPENDED // Emergency revocation event committed',
    terminalLogs: [
      '[ADMIN_API] Extracted TSP Certificate Serial: 4B91A0C28F11E409',
      '[OCSP :4080] Serial 4B91A0C28F11E409 marked as REVOKED (Reason: keyCompromise)',
      '[OPENSSL_OCSP] Response verify OK -> 0x4B91A0C28F11E409: revoked',
      '[VERIFIER :5000] Rejecting PAdES signature: Signing certificate is revoked!',
    ],
  },
};

const SECURITY_ZONES = [
  {
    id: 'public_zone',
    name: '01. Public Service Zone',
    network: 'public_service_zone (bridge)',
    services: 'Nginx Reverse Proxy (:443) • React Citizen Portal • Keycloak OIDC (:8080) • Signing Gateway (:4100)',
    policy: 'Điểm tiếp xúc duy nhất với người dùng. Mọi lưu lượng vào Gateway đều phải xác thực chữ ký JWT qua JWKS của Keycloak và kiểm tra Nonce.',
    accent: '#3B82F6',
  },
  {
    id: 'signing_zone',
    name: '02. Isolated Signing Zone',
    network: 'signing_zone (internal: true)',
    services: 'Trust Service Provider Backend (tsp-server:4000)',
    policy: 'Hoàn toàn cô lập khỏi Internet. Chỉ chấp nhận kết nối mTLS có chứng thư hợp lệ từ signing-gateway kèm header định danh dịch vụ và mã MFA.',
    accent: '#10B981',
  },
  {
    id: 'hsm_zone',
    name: '03. Hardware Security Zone (HSM)',
    network: 'hsm_zone (internal: true)',
    services: 'SoftHSM2 PKCS#11 Token (libsofthsm2.so • Slot 0x02)',
    policy: 'Chạy dưới quyền non-root (1001:1001). Khóa bí mật ECDSA P-256 được đánh dấu non-extractable, chỉ thực hiện phép ký bên trong ranh giới token.',
    accent: '#F59E0B',
  },
  {
    id: 'audit_zone',
    name: '04. WORM Audit & Timestamp Zone',
    network: 'audit_zone (internal: true)',
    services: 'WORM Audit Server (:4200) • RFC 3161 TSA Server (:4300)',
    policy: 'Ghi nhận nhật ký bất biến theo cấu trúc chuỗi băm liên hoàn (Hash-Chain) kèm HMAC-SHA256 và cấp phát dấu thời gian chuẩn RFC 3161 qua mTLS.',
    accent: '#A855F7',
  },
  {
    id: 'verifier_zone',
    name: '05. Verification & OCSP Zone',
    network: 'verifier_zone (internal: true)',
    services: 'PDF Verifier Service (:5000) • OCSP Responder (:4080)',
    policy: 'Kiểm định độc lập cấu trúc PAdES /ByteRange, chuỗi tin cậy Root CA, dấu thời gian TSA và trạng thái thu hồi chứng thư thời gian thực.',
    accent: '#EC4899',
  },
];

const AUTOPSY_NOTES = [
  {
    code: 'CASE #01 // PKCS#11 DER ENCODING',
    title: 'Chuyển đổi chữ ký thô 64-byte (r, s) từ SoftHSM2 sang chuẩn ASN.1 DER',
    issue:
      'Cơ chế CKM_ECDSA trong PKCS#11 trả về mảng nhị phân 64 byte gồm hai số nguyên nối tiếp (r || s), trong khi cấu trúc CMS/PAdES của pkijs yêu cầu định dạng ASN.1 DER Sequence chuẩn.',
    fix:
      'Xây dựng hàm ecdsaRawToDer() trong pkcs11.service.js: tách đôi mảng 32-byte r và s, loại bỏ các byte 0x00 thừa ở đầu và chèn byte đệm 0x00 nếu bit cao nhất (0x80) bật để tránh bị hiểu nhầm là số âm, sau đó đóng gói vào TLV 0x30.',
  },
  {
    code: 'CASE #02 // AXIOS BINARY CORRUPTION',
    title: 'Lỗi hỏng cấu trúc BER của TimeStampToken khi gọi TSA qua HTTP',
    issue:
      'Mặc định Axios tự động ép kiểu dữ liệu phản hồi nhị phân (application/timestamp-reply) thành chuỗi UTF-8, làm biến dạng các byte > 0x7F khiến asn1js.fromBER() báo lỗi giải mã.',
    fix:
      'Cấu hình bắt buộc responseType: "arraybuffer" khi gọi TSA Server và chuyển đổi tường minh qua Uint8Array.buffer trước khi đưa vào bộ phân tích cú pháp ASN.1.',
  },
  {
    code: 'CASE #03 // PADES BYTERANGE & 16KB PLACEHOLDER',
    title: 'Tràn vùng đệm /Contents khi nhúng đồng thời chuỗi X.509 và dấu thời gian TSA',
    issue:
      'Vùng giữ chỗ chữ ký mặc định (8KB) không đủ chứa toàn bộ cấu trúc CMS SignedData khi đính kèm đầy đủ Certificate Chain và RFC 3161 TimeStampToken, gây lỗi tràn bộ đệm PDF.',
    fix:
      'Mở rộng DEFAULT_SIGNATURE_LENGTH lên 16384 bytes (16KB) và dùng biểu thức chính quy quét lấy tập chỉ số /ByteRange cuối cùng để hỗ trợ ký nối tiếp nhiều chữ ký song song.',
  },
  {
    code: 'CASE #04 // WORM HASH-CHAIN TAMPER DETECTION',
    title: 'Phát hiện can thiệp trái phép vào cơ sở dữ liệu nhật ký kiểm toán',
    issue:
      'Nếu kẻ tấn công chiếm quyền đọc/ghi file log trên ổ đĩa và xóa hoặc sửa một bản ghi lịch sử ký số, hệ thống log thông thường sẽ không thể phát hiện.',
    fix:
      'Mỗi bản ghi lưu entryHash = SHA256(previousHash || canonicalEvent) kèm integrityMac = HMAC-SHA256(entryHash). Bất kỳ thay đổi nào ở một dòng lịch sử đều làm đứt gãy toàn bộ chuỗi băm phía sau.',
  },
];

export default function EGovSignatureProjectPage() {
  const [activeMode, setActiveMode] = useState<SimulationModeId>('normal_sign');
  const [wormTampered, setWormTampered] = useState<boolean>(false);

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

  const currentScenario = SCENARIOS[activeMode];

  const wormBlocks = [
    {
      index: 'BLOCK #0040',
      signer: 'citizen001',
      docHash: '4a19...e802',
      prevHash: '00000000000000000000000000000000',
      entryHash: '7b92f10c84d2a190e53c118f9a02d441',
      valid: true,
    },
    {
      index: 'BLOCK #0041',
      signer: wormTampered ? 'attacker_forged' : 'citizen001',
      docHash: wormTampered ? 'ffff...9999 (MODIFIED)' : 'c308...119a',
      prevHash: '7b92f10c84d2a190e53c118f9a02d441',
      entryHash: wormTampered ? 'dea00192837465fa9182736455123908' : '2f81d904b7e1c33290a8f5412c77e109',
      valid: !wormTampered,
    },
    {
      index: 'BLOCK #0042',
      signer: 'citizen001',
      docHash: '8f43...7aa4',
      prevHash: '2f81d904b7e1c33290a8f5412c77e109',
      entryHash: '5c9e0411a8b7d623f1098e4c2a1b81a0',
      valid: !wormTampered,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans selection:bg-[#3B82F6] selection:text-black pb-32 relative overflow-x-hidden">
      {/* Top Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] via-cyan-400 to-emerald-400 origin-left z-50 shadow-[0_0_15px_#3B82F6]"
      />

      {/* Subtle Cryptographic Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3B82F6 1px, transparent 1px),
            linear-gradient(to bottom, #3B82F6 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="border-b border-[#333330] bg-[#0A0A09]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link
          href="/#sec-egov"
          className="font-mono text-sm uppercase tracking-widest text-[#D8D8D1] hover:text-[#3B82F6] transition-colors flex items-center gap-2.5"
        >
          <ArrowLeft size={16} />
          <HackerText text="RETURN" />
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/anphan991/e-gov-signature-project"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-black bg-[#3B82F6] hover:bg-[#3B82F6]/90 px-4 py-2 transition-colors font-bold flex items-center gap-2"
          >
            <span>GITHUB_REPOSITORY</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </nav>

      <main className="max-w-[1380px] mx-auto px-6 md:px-12 pt-10 space-y-24 relative z-10">
        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT I: HERO & INTERACTIVE PADES CRYPTOGRAPHIC TESTBENCH
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          <div className="border-b border-[#333330] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3.5 py-1.5">
                <Fingerprint size={14} className="animate-pulse" />
                <span>APPLIED CRYPTOGRAPHY // PADES-B-LT + SOFTHSM2 PKCS#11 + ZERO TRUST</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl font-light text-white tracking-tight leading-[1.06]">
                e-Gov Signature: <span className="italic text-[#3B82F6]">Zero-Trust PKI Infrastructure</span>
              </h1>
            </div>
            <p className="text-[#A9A9A2] text-sm md:text-base max-w-xl leading-relaxed font-mono">
              Ký số theo chuẩn <span className="text-white">PAdES (ISO 32000)</span>. Cô lập khóa bí mật ECDSA trong <span className="text-white">SoftHSM2</span>, xác thực dịch vụ bằng <span className="text-white">mTLS</span>, đóng dấu thời gian <span className="text-white">RFC 3161</span> và chống sửa đổi lịch sử bằng chuỗi băm <span className="text-white">WORM</span>.
            </p>
          </div>

          {/* Scenario Selector Bar */}
          <div className="space-y-3">
            <div className="font-mono text-sm uppercase tracking-widest text-[#A9A9A2]">
              KỊCH BẢN:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-sm">
              {(Object.keys(SCENARIOS) as SimulationModeId[]).map((modeKey) => {
                const item = SCENARIOS[modeKey];
                const isSelected = activeMode === modeKey;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMode(modeKey)}
                    className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'border-[#3B82F6] bg-[#0D1524] text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                        : 'border-[#262624] bg-[#0A0A09] text-[#A9A9A2] hover:border-[#3B82F6]/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 border"
                        style={{
                          borderColor: item.accentColor,
                          color: item.accentColor,
                          backgroundColor: `${item.accentColor}15`,
                        }}
                      >
                        {item.httpStatus}
                      </span>
                      <span className="text-xs text-[#A9A9A2]">{item.verdict}</span>
                    </div>
                    <div className="font-bold text-sm sm:text-base text-white leading-snug">
                      {item.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Interactive Inspection Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
            {/* Left 7 Cols: Document & Cryptographic Telemetry */}
            <div className="lg:col-span-7 border border-[#333330] bg-[#080808] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222220] pb-4">
                <div>
                  <span className="text-xs text-[#3B82F6] uppercase tracking-widest block">
                    {currentScenario.badge}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {currentScenario.title}
                  </h2>
                </div>
                <span
                  className="text-sm font-bold px-3.5 py-1 border"
                  style={{
                    borderColor: currentScenario.accentColor,
                    color: currentScenario.accentColor,
                    backgroundColor: `${currentScenario.accentColor}15`,
                  }}
                >
                  {currentScenario.verdict}
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#D8D8D1] font-sans leading-relaxed">
                {currentScenario.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="border border-[#222220] bg-[#0B0B0B] p-4 space-y-1.5">
                  <div className="text-xs text-[#A9A9A2] uppercase">PDF /ByteRange Layout</div>
                  <div className="text-white font-bold break-all">{currentScenario.byteRangePreview}</div>
                </div>
                <div className="border border-[#222220] bg-[#0B0B0B] p-4 space-y-1.5">
                  <div className="text-xs text-[#A9A9A2] uppercase">HSM PKCS#11 Operation</div>
                  <div className="text-[#3B82F6] font-bold">{currentScenario.hsmAction}</div>
                </div>
                <div className="border border-[#222220] bg-[#0B0B0B] p-4 space-y-1.5">
                  <div className="text-xs text-[#A9A9A2] uppercase">RFC 3161 Timestamp (TSA)</div>
                  <div className="text-white font-bold">{currentScenario.tsaStatus}</div>
                </div>
                <div className="border border-[#222220] bg-[#0B0B0B] p-4 space-y-1.5">
                  <div className="text-xs text-[#A9A9A2] uppercase">OCSP Status (RFC 6960)</div>
                  <div
                    className="font-bold"
                    style={{ color: currentScenario.accentColor }}
                  >
                    {currentScenario.ocspStatus}
                  </div>
                </div>
              </div>

              <div className="border border-[#222220] bg-[#050505] p-4 text-sm space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#A9A9A2] uppercase">
                  <span>Document SHA-256 Digest</span>
                  <span>{currentScenario.wormBlockStatus}</span>
                </div>
                <div className="text-[#3B82F6] font-mono break-all text-sm">
                  {currentScenario.sha256Digest}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live Audit & Service Trace Terminal */}
            <div className="lg:col-span-5 border border-[#333330] bg-[#050505] flex flex-col justify-between">
              <div>
                <div className="px-5 py-3.5 border-b border-[#222220] bg-[#0A0A0A] flex items-center justify-between text-sm">
                  <span className="text-[#A9A9A2] flex items-center gap-2">
                    <Terminal size={15} className="text-[#3B82F6]" />
                    <span>SERVICE_TRACE // {currentScenario.httpStatus}</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentScenario.accentColor }} />
                </div>

                <div className="p-5 space-y-3.5 text-sm">
                  <div className="p-3.5 bg-[#0B0B0B] border border-[#1E1E1C] text-[#A9A9A2] break-all">
                    <span className="text-[#3B82F6] mr-2">$</span>
                    <span className="text-white">{currentScenario.command}</span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {currentScenario.terminalLogs.map((line, idx) => (
                      <div key={idx} className="text-[#D8D8D1] leading-relaxed flex items-start gap-2">
                        <span className="text-[#3B82F6] select-none">›</span>
                        <span className="break-words">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#1E1E1C] bg-[#090909] text-xs text-[#A9A9A2] flex items-center justify-between">
                <span>NIST SP 800-207 Zero Trust Boundary</span>
                <span className="text-[#3B82F6]">mTLS Enforced</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT II: 5-ZONE DEFENSE-IN-DEPTH DOCKER ARCHITECTURE
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-[#333330] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-sm uppercase tracking-widest text-[#3B82F6]">
                ARCHITECTURE // LEAST PRIVILEGE NETWORK SEGMENTATION
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mt-1">
                Defense-in-Depth Zones
              </h2>
            </div>
            <span className="font-mono text-sm text-[#A9A9A2]">
              docker-compose.yml • internal: true bridge isolation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono">
            {SECURITY_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="border border-[#262624] bg-[#080808] hover:border-[#3B82F6] p-5 flex flex-col justify-between transition-colors space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 border" style={{ borderColor: zone.accent, color: zone.accent }}>
                      {zone.network}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{zone.name}</h3>
                  <div className="text-xs sm:text-sm text-[#3B82F6] leading-snug">{zone.services}</div>
                </div>
                <p className="text-sm text-[#A9A9A2] font-sans leading-relaxed border-t border-[#1A1A18] pt-3">
                  {zone.policy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            ACT III: WORM HASH-CHAIN SIMULATOR & CRYPTOGRAPHIC AUTOPSIES
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          <div className="border-b border-[#333330] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-sm uppercase tracking-widest text-[#3B82F6]">
                IMMUTABLE LEDGER // WRITE-ONCE-READ-MANY (WORM)
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mt-1">
                Audit log
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !wormTampered;
                setWormTampered(next);
                triggerAura(
                  next ? -5000 : 1500,
                  next
                    ? 'Unauthorized edit on BLOCK #0041! WORM hash chain broke & alerted SOC!'
                    : 'Restored WORM ledger integrity (+1,500 Integrity Aura)',
                  next ? '💀' : '✅'
                );
              }}
              className={`font-mono text-sm uppercase tracking-wider px-5 py-2.5 border transition-all cursor-pointer font-bold ${
                wormTampered
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                  : 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {wormTampered ? '[ KHÔI PHỤC SỔ CÁI WORM GỐC ]' : '[ THỬ SỬA TRÁI PHÉP BLOCK #0041 ]'}
            </button>
          </div>

          {/* Interactive WORM Chain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
            {wormBlocks.map((b) => (
              <div
                key={b.index}
                className={`p-5 border transition-all space-y-3 ${
                  b.valid
                    ? 'border-[#262624] bg-[#090909]'
                    : 'border-red-500 bg-[#180808] shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{b.index}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 border font-bold ${
                      b.valid
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : 'border-red-500 text-red-400 bg-red-500/20'
                    }`}
                  >
                    {b.valid ? 'CHAIN_INTACT' : 'BROKEN_LINK // MAC_FAIL'}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="text-[#A9A9A2]">
                    Signer: <span className="text-white">{b.signer}</span> | Doc: <span className="text-white">{b.docHash}</span>
                  </div>
                  <div className="text-[#A9A9A2] truncate">
                    prevHash: <span className="text-[#D8D8D1]">{b.prevHash}</span>
                  </div>
                  <div className="text-[#A9A9A2] truncate">
                    entryHash: <span className={b.valid ? 'text-[#3B82F6]' : 'text-red-400'}>{b.entryHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4 Engineering Autopsies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
            {AUTOPSY_NOTES.map((item) => (
              <div key={item.code} className="border border-[#262624] bg-[#080808] p-6 space-y-3.5">
                <div className="text-sm text-[#3B82F6] font-bold">{item.code}</div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-[#A9A9A2] font-sans leading-relaxed">
                  <strong className="text-[#D8D8D1]">Vấn đề:</strong> {item.issue}
                </p>
                <p className="text-sm text-[#D8D8D1] font-sans leading-relaxed border-t border-[#1C1C1A] pt-3">
                  <strong className="text-[#3B82F6]">Giải pháp:</strong> {item.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Return & Repository Footer */}
        <div className="pt-8 border-t border-[#333330] space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm">
            <Link
              href="/#sec-egov"
              className="uppercase tracking-widest text-[#D8D8D1] hover:text-[#3B82F6] transition-colors inline-flex items-center gap-2.5 border border-[#333330] hover:border-[#3B82F6] px-6 py-3"
            >
              <ArrowLeft size={16} />
              <span>[ RETURN TO MAIN PAGE ]</span>
            </Link>

            <a
              href="https://github.com/anphan991/e-gov-signature-project"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-widest text-black bg-[#3B82F6] hover:bg-[#3B82F6]/90 transition-colors inline-flex items-center gap-2.5 px-6 py-3 font-bold"
            >
              <span>VIEW SOURCE ON GITHUB</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="pt-6 flex items-center justify-center font-mono text-xs text-[#A9A9A2]">
            <p className="font-serif italic text-xl sm:text-2xl text-white tracking-wide text-center">
              <span className="text-[#3B82F6] not-italic font-mono animate-pulse">_</span>
              Anyways, cya in the next chaos<span className="text-[#3B82F6] not-italic font-mono animate-pulse">_</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
