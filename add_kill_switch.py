import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state and useEffect for Kill Switch
if 'const [isDestructing, setIsDestructing] = useState(false);' not in content:
    content = content.replace(
        'const [isThemeOpen, setIsThemeOpen] = useState(false);',
        'const [isThemeOpen, setIsThemeOpen] = useState(false);\n  const [isDestructing, setIsDestructing] = useState(false);\n\n  useEffect(() => {\n    if (isDestructing) {\n      const timer = setTimeout(() => {\n        window.location.href = "/free-cookie";\n      }, 2500);\n      return () => clearTimeout(timer);\n    }\n  }, [isDestructing]);'
    )

# 2. Add Kill Switch Button to the right side of footer
footer_pattern = r'(<footer.*?)(</div>\s*</footer>)'
kill_btn = '''
              <button
                onClick={() => setIsDestructing(true)}
                className="flex items-center gap-3 px-5 py-2.5 border border-[#333330] text-[10px] font-mono uppercase tracking-widest text-[#A9A9A2] hover:text-red-500 hover:border-red-500 hover:bg-red-950/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all group"
              >
                <span className="text-red-500 group-hover:animate-pulse">?</span>
                execute(wipe_data.sh)
              </button>
            '''

content = re.sub(footer_pattern, r'\1' + kill_btn + r'\2', content, flags=re.DOTALL)

# 3. Add Destruct Overlay right before </main>
destruct_overlay = '''
        {/* SELF DESTRUCT OVERLAY */}
        <AnimatePresence>
          {isDestructing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-[999999] bg-red-950 flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
            >
              {/* Scanlines and intense noise */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.3) 2px, rgba(255,0,0,0.3) 4px)' }}></div>
              
              <motion.h1 
                animate={{ x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="text-5xl md:text-8xl font-['VT323',_monospace] text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,0,0,1)] mix-blend-difference"
              >
                SYSTEM_FAILURE
              </motion.h1>
              <motion.p 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-red-400 mt-4 font-mono text-sm md:text-xl tracking-[0.3em] uppercase bg-black/50 px-4 py-2"
              >
                Initiating Critical Wipe...
              </motion.p>
              
              <div className="absolute bottom-10 left-10 text-red-500 font-mono text-xs opacity-50 flex flex-col gap-1">
                {[...Array(15)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0, 1, 0] }} transition={{ delay: i * 0.1, duration: 0.2, repeat: Infinity }}>
                    &gt; Deleting sector 0x00{i}F{i * 2}A...
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
'''
# inject before </main>
content = re.sub(r'(</main>)', destruct_overlay + r'\n      \1', content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Kill switch added")
