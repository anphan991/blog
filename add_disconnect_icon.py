# -*- coding: utf-8 -*-
import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Power to lucide-react imports
if 'Power' not in content:
    content = content.replace("import { Bug, Zap, Mail, Github, Twitter, Gamepad2, FileText, Cpu, FolderTree, Radar, Network } from 'lucide-react';", "import { Bug, Zap, Mail, Github, Twitter, Gamepad2, FileText, Cpu, FolderTree, Radar, Network, Power } from 'lucide-react';")

# 2. Append the new icon
new_icon = '''
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_self" className="flex flex-col items-center gap-2 group w-24 no-underline cursor-pointer mt-4">
              <Power size={52} strokeWidth={1} className="text-red-500/80 group-hover:text-red-400 transition-colors drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
              <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-red-500 px-2 py-1 group-hover:bg-red-500 group-hover:text-black text-center leading-tight mt-1">
                DISCONNECT<br/>.SYS
              </span>
            </a>
          </div>'''

# Replace the closing div of the icon list
content = re.sub(
    r'</button>\s*</div>\s*{/\* --- CÃ¡c cá»­a sá»•',
    r'</button>' + new_icon + '\n          {/* --- Các c?a s?',
    content,
    flags=re.DOTALL
)

# In case the comment is different due to encoding
content = re.sub(
    r'</button>\s*</div>\s*{/\* --- Các c?a s?',
    r'</button>' + new_icon + '\n          {/* --- Các c?a s?',
    content,
    flags=re.DOTALL
)

# And fallback for just finding the end of the button list
content = re.sub(
    r'CONNECT\.BAT</span>\s*</button>\s*</div>',
    r'CONNECT.BAT</span>\n            </button>' + new_icon,
    content,
    flags=re.DOTALL
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added DISCONNECT icon")
