import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the component call
content = re.sub(r'<CyberChat\s*/>', '', content)

# Remove the import
content = re.sub(r"import CyberChat from '@/components/CyberChat';?", "", content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed chatbot")
