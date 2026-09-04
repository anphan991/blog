import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update Cybercore (Active)
old_cyber = r"\{\s*id:\s*'cyber',\s*name:\s*'CYBERCORE'.*?\}"
new_cyber = r"{ id: 'cybercore', name: 'CYBERCORE OS', role: 'CURRENT REALITY', img: '/cyber_core.jpg', color: 'cyan', link: 'https://v4.kanp9.io.vn/' }"
content = re.sub(old_cyber, new_cyber, content, flags=re.DOTALL)

# Update Win98 (to Crystal Carbon)
old_win98 = r"\{\s*id:\s*'win98',\s*name:\s*'WINDOWS 98'.*?\}"
new_crystal = r"{ id: 'crystal', name: 'CRYSTAL CARBON', role: 'DEEP DIVE', img: '/cyan_carbon.jpg', color: 'blue', link: 'https://kanp9.io.vn/' }"
content = re.sub(old_win98, new_crystal, content, flags=re.DOTALL)

# Update The Matrix
old_matrix = r"\{\s*id:\s*'matrix',\s*name:\s*'THE MATRIX'.*?\}"
new_matrix = r"{ id: 'matrix', name: 'THE MATRIX', role: 'NOSTALGIA SECTOR', img: '/the_matrix.jpg', color: 'green', link: 'https://v3.kanp9.io.vn/' }"
content = re.sub(old_matrix, new_matrix, content, flags=re.DOTALL)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated links and images for v4")
