import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REMOVE DISCONNECT FROM LEFT ICONS
# The button starts with <button onClick={() => setShowThemeMenu(true)} className="flex flex-col ... cursor-pointer mt-4 border-none bg-transparent outline-none">
pattern = r'<button onClick=\{\(\) => setShowThemeMenu\(true\)\}.*?</button>'
disconnect_button = re.search(pattern, content, flags=re.DOTALL).group(0)
content = content.replace(disconnect_button, '')

# 2. PLACE DISCONNECT AT BOTTOM RIGHT
# We can inject it right before the {bsodState && ( block which is near the bottom
# Wait, let's inject it into the main container, anywhere with absolute positioning.
# A good place is right before the {/* BOOT SCREEN */} or {/* THEME SELECTION MENU */}
new_disconnect_button = '''
      {/* THEME SWITCHER BUTTON (BOTTOM RIGHT) */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-50 pointer-events-auto">
        <button 
          onClick={() => setShowThemeMenu(true)} 
          className="flex flex-col items-center gap-2 group w-24 border-none bg-transparent outline-none cursor-pointer"
        >
          <Power size={48} strokeWidth={1} className="text-red-500/80 group-hover:text-red-400 transition-colors drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
          <span className="text-[10px] font-['Share_Tech_Mono',_monospace] bg-black/50 text-red-500 px-2 py-1 group-hover:bg-red-500 group-hover:text-black text-center leading-tight mt-1">
            DISCONNECT<br/>.SYS
          </span>
        </button>
      </div>
'''
if 'THEME SWITCHER BUTTON' not in content:
    content = content.replace('{/* THEME SELECTION MENU */}', new_disconnect_button + '\n      {/* THEME SELECTION MENU */}')

# 3. FASTER HOVER & THEMATIC BACKGROUND
# Replace transition-all duration-300 with duration-150 in the cards
content = content.replace('transition-all duration-300 no-underline cursor-pointer', 'transition-all duration-150 no-underline cursor-pointer')

# Replace the blur background of the overlay with a solid black + grid + scanlines thematic background
old_overlay = r'className="fixed inset-0 z-\[99999\] bg-black/80 flex flex-col items-center justify-center pointer-events-auto"'
new_overlay = r'''className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden"'''
content = re.sub(old_overlay, new_overlay, content)

# Inject the thematic background elements inside the motion.div
bg_elements = '''
            {/* Thematic Cybercore Background */}
            <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at center, #064e3b 0%, #000 70%)' }}></div>
            <div className="absolute inset-0 z-0 opacity-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.3) 2px, rgba(34,211,238,0.3) 4px)' }}></div>
            <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Overlay Content must be above background */}
            <div className="relative z-10 flex flex-col items-center w-full">
'''
# We need to wrap the contents of the motion.div inside this new relative z-10 div.
# But it's easier to just inject the bg elements right after the motion.div opens
content = re.sub(
    r'(<motion\.div[^>]*className="fixed inset-0 z-\[99999\] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden"[^>]*>)',
    r'\1\n' + bg_elements,
    content
)

# And add the closing div before the </motion.div> of the overlay
# There is a </motion.div> closing the AnimatePresence. We need to find the right one.
# It's better to just replace the structure carefully.
# Wait, let's just make the background absolute and let the flex container handle the rest without an extra wrapper, since absolute is removed from document flow!
bg_elements_simple = '''
            {/* Thematic Cybercore Background */}
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(6,78,59,0.3) 0%, #000 70%)' }}></div>
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.15) 2px, rgba(34,211,238,0.15) 4px)' }}></div>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
'''
content = content.replace(bg_elements, '') # Revert if already applied
content = re.sub(
    r'(<motion\.div[^>]*className="fixed inset-0 z-\[99999\] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden"[^>]*>)',
    r'\1\n' + bg_elements_simple,
    content
)

# Make sure buttons and cards are z-10 relative
content = content.replace('className="absolute top-8 right-12', 'className="absolute top-8 right-12 z-20')
content = content.replace('className="mb-16 text-center"', 'className="mb-16 text-center z-20 relative"')
content = content.replace('className="flex flex-wrap justify-center gap-6 md:gap-10 px-4 max-w-6xl"', 'className="flex flex-wrap justify-center gap-6 md:gap-10 px-4 max-w-6xl z-20 relative"')

# Faster framer-motion hover config
content = content.replace('type: "spring", stiffness: 100', 'type: "spring", stiffness: 400, damping: 25')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications done")
