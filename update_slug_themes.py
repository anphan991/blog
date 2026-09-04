# -*- coding: utf-8 -*-
import re
import glob

# Files to modify
files = [
    r'app\info-sec\[slug]\page.tsx',
    r'app\blog\[slug]\page.tsx'
]

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Replace blue with cyan
        content = content.replace('#3B82F6', '#22d3ee')
        content = content.replace('bg-blue-950', 'bg-cyan-950')
        content = content.replace('selection:bg-[#3B82F6]', 'selection:bg-[#22d3ee]')

        # 2. Add scanlines to the background grid
        old_bg = r'<div className="absolute inset-0 bg-\[linear-gradient\(to_right,#22d3ee08_1px,transparent_1px\),linear-gradient\(to_bottom,#22d3ee08_1px,transparent_1px\)\] bg-\[size:24px_24px\] pointer-events-none" />'
        new_bg = '''<div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee08_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.15) 2px, rgba(34,211,238,0.15) 4px)' }}></div>'''
        
        # In case the blue hasn't been replaced yet in the string
        old_bg_blue = r'<div className="absolute inset-0 bg-\[linear-gradient\(to_right,#3B82F608_1px,transparent_1px\),linear-gradient\(to_bottom,#3B82F608_1px,transparent_1px\)\] bg-\[size:24px_24px\] pointer-events-none" />'
        content = re.sub(old_bg_blue, new_bg, content)
        content = re.sub(old_bg, new_bg, content)

        # 3. Add CRT Fonts to headings and text
        # Title
        content = re.sub(
            r'className="text-2xl md:text-4xl font-black text-white mb-4"',
            r'className="text-3xl md:text-5xl font-[\'VT323\',_monospace] text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] mb-4"',
            content
        )
        content = re.sub(
            r'className="text-3xl md:text-5xl font-black text-white mb-4"',
            r'className="text-3xl md:text-5xl font-[\'VT323\',_monospace] text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] mb-4"',
            content
        )
        
        # Meta info font
        content = re.sub(
            r'className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest"',
            r'className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs font-[\'Share_Tech_Mono\',_monospace] uppercase tracking-widest text-cyan-400"',
            content
        )
        
        # Markdown body prose styling
        content = re.sub(
            r'prose-invert prose-blue',
            r'prose-invert prose-cyan prose-headings:font-[\'VT323\',_monospace] prose-headings:text-cyan-400 prose-headings:tracking-widest prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-code:text-cyan-300 prose-p:font-[\'Share_Tech_Mono\',_monospace]',
            content
        )

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    except Exception as e:
        print(f"Failed to process {file}: {e}")

