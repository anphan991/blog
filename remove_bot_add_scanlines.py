import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove CyberChat
content = content.replace("import CyberChat from '@/components/CyberChat';\n", "")
content = content.replace("<CyberChat />", "")

# 2. Add Scanlines to the main desktop
# Look for <NetworkParticles /> or noise-overlay
scanlines = '''<div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.05) 2px, rgba(34,211,238,0.05) 4px)' }}></div>'''

# We want the scanlines to be subtle on the main desktop (so I changed 0.15 opacity to 0.05 to avoid overwhelming the text).
content = content.replace('<div className="noise-overlay opacity-20"></div>', '<div className="noise-overlay opacity-20"></div>\n        ' + scanlines)

# Just in case the noise-overlay doesn't have opacity-20
if scanlines not in content:
    content = content.replace('<div className="noise-overlay"></div>', '<div className="noise-overlay"></div>\n        ' + scanlines)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications done")
