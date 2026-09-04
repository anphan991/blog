import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update The Matrix (Active)
old_matrix = r"\{\s*id:\s*'matrix',\s*name:\s*'THE MATRIX'.*?\}"
new_matrix = r"{ id: 'matrix', name: 'THE MATRIX', role: 'CURRENT REALITY', img: '/the_matrix.jpg', color: '#4ade80', link: 'https://v3.kanp9.io.vn/' }"
content = re.sub(old_matrix, new_matrix, content, flags=re.DOTALL)

# Update Cyber (to Crystal Carbon)
old_cyber = r"\{\s*id:\s*'cyber',\s*name:\s*'CYBERCORE'.*?\}"
new_crystal = r"{ id: 'crystal', name: 'CRYSTAL CARBON', role: 'DEEP DIVE', img: '/cyan_carbon.jpg', color: '#3B82F6', link: 'https://kanp9.io.vn/' }"
content = re.sub(old_cyber, new_crystal, content, flags=re.DOTALL)

# Update Win98 (to Cybercore OS)
old_win98 = r"\{\s*id:\s*'win98',\s*name:\s*'WINDOWS 98'.*?\}"
new_cybercore = r"{ id: 'cybercore', name: 'CYBERCORE OS', role: 'NOSTALGIA SECTOR', img: '/cyber_core.jpg', color: '#a855f7', link: 'https://v4.kanp9.io.vn/' }"
content = re.sub(old_win98, new_cybercore, content, flags=re.DOTALL)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated links and images for v3")
