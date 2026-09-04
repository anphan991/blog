import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('viewport={{ once: true }}', 'viewport={{ once: false, amount: 0.1 }}')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Viewport fixed")
