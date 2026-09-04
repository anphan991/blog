import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update Crystal Carbon
old_crystal = r"\{\s*id:\s*'crystal',\s*name:\s*'CRYSTAL CARBON'.*?\}"
new_crystal = r"{ id: 'crystal', name: 'CRYSTAL CARBON', role: 'CURRENT REALITY', img: '/cyan_carbon.jpg', color: '#3B82F6', link: 'https://kanp9.io.vn/' }"
content = re.sub(old_crystal, new_crystal, content, flags=re.DOTALL)

# Update Cybercore OS
old_cybercore = r"\{\s*id:\s*'cybercore',\s*name:\s*'CYBERCORE OS'.*?\}"
new_cybercore = r"{ id: 'cybercore', name: 'CYBERCORE OS', role: 'NOSTALGIA SECTOR', img: '/cyber_core.jpg', color: '#a855f7', link: 'https://v4.kanp9.io.vn/' }"
content = re.sub(old_cybercore, new_cybercore, content, flags=re.DOTALL)

# Update The Matrix
old_matrix = r"\{\s*id:\s*'matrix',\s*name:\s*'THE MATRIX'.*?\}"
new_matrix = r"{ id: 'matrix', name: 'THE MATRIX', role: 'DEEP DIVE', img: '/the_matrix.jpg', color: '#4ade80', link: 'https://v3.kanp9.io.vn/' }"
content = re.sub(old_matrix, new_matrix, content, flags=re.DOTALL)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated links and images")
