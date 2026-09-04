import re

# 1. Fix cursor z-index in globals.css
with open('app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()
css = re.sub(r'\.khz-cursor\s*\{[^\}]*z-index:\s*\d+[^}]*\}', '.khz-cursor { position: fixed; top: 0; left: 0; width: 6px; height: 6px; background-color: var(--khz-primary, #A9A9A2); border-radius: 50%; pointer-events: none; z-index: 999999 !important; transform: translate(-50%, -50%); }', css)
css = re.sub(r'\.khz-cursor-ring\s*\{[^\}]*z-index:\s*\d+[^}]*\}', '.khz-cursor-ring { position: fixed; top: 0; left: 0; width: 36px; height: 36px; border: 1px solid var(--khz-primary, #A9A9A2); border-radius: 50%; pointer-events: none; z-index: 999998 !important; transform: translate(-50%, -50%); transition: width 0.2s, height 0.2s; }', css)
with open('app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Add Clock Logic to page.tsx
with open('app/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

clock_state = """
  const [clockFormat, setClockFormat] = useState<'dec' | 'bin' | 'hex'>('bin');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      
      if (clockFormat === 'bin') {
        setTimeStr(`${h.toString(2).padStart(5,'0')}:${m.toString(2).padStart(6,'0')}:${s.toString(2).padStart(6,'0')}`);
      } else if (clockFormat === 'hex') {
        setTimeStr(`${h.toString(16).padStart(2,'0')}:${m.toString(16).padStart(2,'0')}:${s.toString(16).padStart(2,'0')}`.toUpperCase());
      } else {
        setTimeStr(`${h.toString(10).padStart(2,'0')}:${m.toString(10).padStart(2,'0')}:${s.toString(10).padStart(2,'0')}`);
      }
    };
    const t = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(t);
  }, [clockFormat]);
"""

if 'const [timeStr, setTimeStr] = useState' not in page:
    page = page.replace('const [navOpen, setNavOpen] = useState(false);', 'const [navOpen, setNavOpen] = useState(false);\n' + clock_state)

# Replace the left footer with the Clock UI
old_footer_left = r'<div>\s*<span className="font-serif text-xl text-\[#F5F5F0\] block">\|\|\|\|\|\|\|\|\|\|</span>\s*<span className="font-mono text-\[9px\] text-\[#A9A9A2\] uppercase tracking-widest mt-1 block">© 2026 — All rights reserved\.</span>\s*</div>'
new_footer_left = '''<div className="flex flex-col gap-1 cursor-pointer group" onClick={() => setClockFormat(prev => prev === 'bin' ? 'hex' : prev === 'hex' ? 'dec' : 'bin')}>
                <span className="font-mono text-xl text-[#F5F5F0] block group-hover:text-green-400 transition-colors">{timeStr || '00:00:00'}</span>
                <span className="font-mono text-[9px] text-[#A9A9A2] uppercase tracking-widest block">
                  SYS_TIME [{clockFormat.toUpperCase()}] — CLICK TO CYCLE FORMAT
                </span>
              </div>'''

page = re.sub(old_footer_left, new_footer_left, page)

# Update redirect in kill switch
page = page.replace('window.location.href = "/free-cookie"', 'window.location.href = "/free-cookie?auto=1"')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page)

# 3. Update free-cookie to read auto=1
with open('app/free-cookie/page.tsx', 'r', encoding='utf-8') as f:
    fc = f.read()

fc_effect = '''  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('auto=1')) {
      setActivated(true);
    }
  }, []);'''

if 'window.location.search.includes' not in fc:
    fc = fc.replace('const [activated, setActivated] = useState(false);', 'const [activated, setActivated] = useState(false);\n' + fc_effect)
    # Ensure useEffect is imported
    if 'useEffect' not in fc:
        fc = fc.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';")

with open('app/free-cookie/page.tsx', 'w', encoding='utf-8') as f:
    f.write(fc)

print("Done all modifications")
