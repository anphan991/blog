import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'Power' not in content:
    content = content.replace("import { Bug, Zap, Mail, Github, Twitter, Gamepad2, FileText, Cpu, FolderTree, Radar, Network } from 'lucide-react';", "import { Bug, Zap, Mail, Github, Twitter, Gamepad2, FileText, Cpu, FolderTree, Radar, Network, Power } from 'lucide-react';")

new_icon = '''
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_self" className="flex flex-col items-center gap-2 group w-24 no-underline cursor-pointer mt-4">
              <Power size={52} strokeWidth={1} className="text-red-500/80 group-hover:text-red-400 transition-colors drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
              <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-red-500 px-2 py-1 group-hover:bg-red-500 group-hover:text-black text-center leading-tight mt-1">
                DISCONNECT<br/>.SYS
              </span>
            </a>
          </div>'''

content = re.sub(
    r'CONNECT\.BAT</span>\s*</button>\s*</div>',
    r'CONNECT.BAT</span>\n            </button>\n' + new_icon,
    content,
    flags=re.DOTALL
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added DISCONNECT icon")
