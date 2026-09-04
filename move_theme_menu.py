import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract the Theme section
theme_pattern = r'(\{/\* THEME SELECTION SECTION \*/\}.*?</section>)'
match = re.search(theme_pattern, content, flags=re.DOTALL)
if match:
    theme_section = match.group(1)
    
    # Remove it from current location
    content = content.replace(theme_section, '')
    
    # Insert it BEFORE Manifesto
    manifesto_pattern = r'({/\* =+ MANIFESTO =+ \*/}\s*<section id="sec-manifesto")'
    # Fallback if comment is different
    manifesto_fallback = r'(<section id="sec-manifesto")'
    
    if '{/* -- MANIFESTO ' in content:
        content = re.sub(manifesto_pattern, theme_section + r'\n\n            \1', content)
    else:
        # Just use fallback
        content = re.sub(manifesto_fallback, theme_section + r'\n\n            \1', content)

# 2. Update navbar numbering and order
# Current Navbar:
# [01] MANIFESTO
# [02] THEMES
# [03] ARCHIVE
# [04] WORKS
# [05] TOPICS
# [06] CONNECT

# We want:
# [01] THEMES
# [02] MANIFESTO
# [03] ARCHIVE
# etc.

# Let's extract the two buttons and swap them.
btn_manifesto = r'<button onClick={() => { document.getElementById(\'sec-manifesto\')\?\.scrollIntoView({behavior: \'smooth\'}); setNavOpen(false); }} className="text-left hover:text-\[#4ade80\] transition-colors duration-300"><HackerText text="\[01\] MANIFESTO" /></button>'
btn_theme = r'<button onClick={() => { document.getElementById(\'sec-theme\')\?\.scrollIntoView({behavior: \'smooth\'}); setNavOpen(false); }} className="text-left hover:text-\[#4ade80\] transition-colors duration-300"><HackerText text="\[02\] THEMES" /></button>'

# Replace the text inside to update numbering before swap
new_btn_manifesto = r'<button onClick={() => { document.getElementById(\'sec-manifesto\')?.scrollIntoView({behavior: \'smooth\'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[02] MANIFESTO" /></button>'
new_btn_theme = r'<button onClick={() => { document.getElementById(\'sec-theme\')?.scrollIntoView({behavior: \'smooth\'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[01] THEMES" /></button>'

# Instead of complex regex for the swap, I'll just replace the whole block if I can, or do it step by step.
content = re.sub(btn_manifesto, '[[TEMP_MANIFESTO]]', content)
content = re.sub(btn_theme, '[[TEMP_THEME]]', content)

content = content.replace('[[TEMP_MANIFESTO]]\n                      [[TEMP_THEME]]', new_btn_theme + '\n                      ' + new_btn_manifesto)
# Handle possible spaces
content = content.replace('[[TEMP_MANIFESTO]]\n                        [[TEMP_THEME]]', new_btn_theme + '\n                        ' + new_btn_manifesto)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved theme menu")
