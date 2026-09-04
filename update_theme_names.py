import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the names in the map array
old_array = r"\{\s*id:\s*'cyber',\s*name:\s*'CYBERCORE'.*?\}"
new_array = r"{ id: 'crystal', name: 'CRYSTAL CARBON', role: 'CURRENT REALITY', img: '/pic2.jpg', color: '#3B82F6', link: '#' }"

content = re.sub(old_array, new_array, content, flags=re.DOTALL)

old_win98 = r"\{\s*id:\s*'win98',\s*name:\s*'WINDOWS 98'.*?\}"
new_win98 = r"{ id: 'cybercore', name: 'CYBERCORE OS', role: 'NOSTALGIA SECTOR', img: '/pic2.jpg', color: '#a855f7', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }"
content = re.sub(old_win98, new_win98, content, flags=re.DOTALL)

# Update the 'Active' check
content = content.replace("theme.id === 'cyber'", "theme.id === 'crystal'")

# 2. Update the delay
old_transition = r'transition=\{\{\s*delay:\s*0\.1\s*\+\s*i\s*\*\s*0\.15'
new_transition = r'transition={{ delay: i * 0.01'
content = re.sub(old_transition, new_transition, content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated theme names and delay")
