import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_p = r'<p className="font-mono text-\[10px\] md:text-xs text-\[#4ade80\] tracking-\[0\.2em\] uppercase">\s*Current Reality: THE MATRIX\s*</p>'
new_p = r'''<p className="font-mono text-[10px] md:text-xs text-[#A9A9A2] opacity-70 tracking-[0.2em] uppercase">
                  &gt; CLICK TO DEPLOY THEME_SELECTION_MODULE
                </p>'''

content = re.sub(old_p, new_p, content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Instruction updated")
