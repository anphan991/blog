import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<button\s*onClick=\{\(\) => setChaosMode\(!chaosMode\)\}.*?</button>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed button")
