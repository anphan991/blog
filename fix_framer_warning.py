import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace initial and animate in the theme menu cards to explicitly use HEX colors
old_initial = 'initial={{ opacity: 0, y: 50, rotateY: 30 }}'
new_initial = 'initial={{ opacity: 0, y: 50, rotateY: 30, borderColor: "#27272a", boxShadow: "0 0 0px rgba(0,0,0,0)" }}'

old_animate = 'animate={{ opacity: 1, y: 0, rotateY: 0 }}'
new_animate = 'animate={{ opacity: 1, y: 0, rotateY: 0, borderColor: "#27272a", boxShadow: "0 0 0px rgba(0,0,0,0)" }}'

content = content.replace(old_initial, new_initial)
content = content.replace(old_animate, new_animate)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed framer motion color warning")
