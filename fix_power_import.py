import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"from 'lucide-react';",
    r", Power } from 'lucide-react';",
    content
)
# Clean up duplicate braces
content = content.replace("} , Power }", ", Power }")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed power import")
