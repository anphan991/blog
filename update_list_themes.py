# -*- coding: utf-8 -*-
import glob

files = [
    r'app\info-sec\page.tsx',
    r'app\blog\page.tsx'
]

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace blue with cyan
        content = content.replace('#3B82F6', '#22d3ee')
        content = content.replace('bg-blue-950', 'bg-cyan-950')
        content = content.replace('selection:bg-[#3B82F6]', 'selection:bg-[#22d3ee]')

        # Fonts for heading
        content = content.replace('text-4xl md:text-6xl font-black text-white uppercase tracking-tighter', 'text-4xl md:text-6xl font-[\'VT323\',_monospace] text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]')
        
        # Post Titles
        content = content.replace('text-xl font-bold text-white group-hover:text-[#3B82F6] transition-colors', 'text-2xl font-[\'VT323\',_monospace] text-white group-hover:text-cyan-400 transition-colors tracking-widest')
        content = content.replace('text-xl font-bold text-white group-hover:text-[#22d3ee] transition-colors', 'text-2xl font-[\'VT323\',_monospace] text-white group-hover:text-cyan-400 transition-colors tracking-widest')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    except Exception as e:
        print(f"Failed to process {file}: {e}")

