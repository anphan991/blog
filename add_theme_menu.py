# -*- coding: utf-8 -*-
import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for theme menu
if 'const [showThemeMenu, setShowThemeMenu] = useState(false);' not in content:
    content = content.replace(
        'const [isBooting, setIsBooting] = useState(true);',
        'const [isBooting, setIsBooting] = useState(true);\n  const [showThemeMenu, setShowThemeMenu] = useState(false);'
    )

# 2. Update DISCONNECT button to use onClick instead of href
content = re.sub(
    r'<a href="https://www\.youtube\.com/watch\?v=dQw4w9WgXcQ" target="_self" className="flex flex-col items-center gap-2 group w-24 no-underline cursor-pointer mt-4">',
    r'<button onClick={() => setShowThemeMenu(true)} className="flex flex-col items-center gap-2 group w-24 cursor-pointer mt-4 border-none bg-transparent">',
    content
)
content = re.sub(
    r'DISCONNECT<br/>\.SYS\s*</span>\s*</a>',
    r'DISCONNECT<br/>.SYS\n              </span>\n            </button>',
    content
)

# 3. Add Theme Menu Overlay UI at the bottom, before the final </div> of main
theme_ui = '''
      {/* â• â•  THEME SELECTION MENU â• â•  */}
      <AnimatePresence>
        {showThemeMenu && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(15px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[99999] bg-black/80 flex flex-col items-center justify-center pointer-events-auto"
          >
            <button 
              onClick={() => setShowThemeMenu(false)}
              className="absolute top-8 right-12 text-cyan-500 font-['Share_Tech_Mono',_monospace] text-sm md:text-base hover:text-white transition-colors uppercase tracking-widest"
            >
              [ ABORT_SEQUENCE ]
            </button>
            
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl md:text-5xl font-['VT323',_monospace] text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                SELECT_REALITY
              </h2>
              <p className="text-cyan-400 font-['Share_Tech_Mono',_monospace] mt-2 tracking-[0.2em] text-xs">
                CHOOSE YOUR OPERATING ENVIRONMENT
              </p>
            </motion.div>

            {/* Cards Container */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 px-4 max-w-6xl">
              {[
                { id: 'cyber', name: 'CYBERCORE', role: 'CURRENT REALITY', img: '/pic2.jpg', color: 'cyan', link: '#' },
                { id: 'win98', name: 'WINDOWS 98', role: 'NOSTALGIA SECTOR', img: '/pic2.jpg', color: 'purple', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { id: 'matrix', name: 'THE MATRIX', role: 'DEEP DIVE', img: '/pic2.jpg', color: 'green', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
              ].map((theme, i) => (
                <motion.a
                  key={theme.id}
                  href={theme.link}
                  initial={{ opacity: 0, y: 50, rotateY: 30 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 100 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -15, 
                    boxShadow: `0 0 30px rgba(${theme.color === 'cyan' ? '34,211,238' : theme.color === 'purple' ? '168,85,247' : '34,197,94'}, 0.4)`,
                    borderColor: theme.color === 'cyan' ? '#22d3ee' : theme.color === 'purple' ? '#a855f7' : '#22c55e'
                  }}
                  className="relative group bg-[#0a0a0a] border-2 border-zinc-800 rounded-2xl p-6 w-48 md:w-56 flex flex-col items-center transition-all duration-300 no-underline cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  {/* Image Container */}
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden mb-6 border-2 border-zinc-700 group-hover:border-transparent transition-colors relative">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                    <img src={theme.img} alt={theme.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  
                  {/* Text Info */}
                  <h3 
                    className="font-['VT323',_monospace] text-2xl text-white tracking-widest text-center transition-colors"
                    style={{ color: theme.color === 'cyan' ? '#22d3ee' : theme.color === 'purple' ? '#a855f7' : '#22c55e' }}
                  >
                    {theme.name}
                  </h3>
                  <p className="font-['Share_Tech_Mono',_monospace] text-[10px] text-zinc-500 tracking-[0.2em] text-center mt-2 group-hover:text-zinc-300 transition-colors">
                    {theme.role}
                  </p>
                  
                  {/* Current Reality Indicator */}
                  {i === 0 && (
                    <div className="absolute -top-3 right-4 bg-cyan-500 text-black text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                      Active
                    </div>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
'''

# Find the last closing tag of the <main> block to inject the theme_ui
# We'll inject it just before </main>
if 'THEME SELECTION MENU' not in content:
    content = re.sub(r'(</main>)', r'\n' + theme_ui.replace('â•', '-') + r'\n\1', content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Theme Menu")
