import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state
if 'const [isThemeOpen, setIsThemeOpen] = useState(false);' not in content:
    content = content.replace(
        'const [isBooting, setIsBooting] = useState(true);',
        'const [isBooting, setIsBooting] = useState(true);\n  const [isThemeOpen, setIsThemeOpen] = useState(false);'
    )

theme_block = '''
            {/* THEME SELECTION MENU */}
            <div className="mb-10 w-full">
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex flex-col mb-4 text-left w-full hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent outline-none"
              >
                <h2 className="font-mono text-2xl md:text-3xl text-white uppercase tracking-widest mb-2 flex items-center gap-4">
                  Select_Environment 
                  <span className="text-[#3B82F6] text-sm">{isThemeOpen ? '[-]' : '[+]'}</span>
                </h2>
                <p className="font-mono text-[10px] md:text-xs text-[#94A3B8] opacity-70 tracking-[0.2em] uppercase">
                  &gt; CLICK TO DEPLOY THEME_SELECTION_MODULE
                </p>
              </button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-8 md:gap-12 w-full justify-center items-center overflow-hidden py-8"
                  >
                    {[
                      { id: 'cyber', name: 'CYBERCORE', role: 'CURRENT REALITY', img: '/pic2.jpg', color: '#3B82F6', link: '#' },
                      { id: 'win98', name: 'WINDOWS 98', role: 'NOSTALGIA SECTOR', img: '/pic2.jpg', color: '#a855f7', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                      { id: 'matrix', name: 'THE MATRIX', role: 'DEEP DIVE', img: '/pic2.jpg', color: '#4ade80', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
                    ].map((theme, i) => (
                      <motion.a
                        key={theme.id}
                        href={theme.link}
                        initial={{ opacity: 0, y: 50, rotateY: 30, borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                        whileInView={{ opacity: 1, y: 0, rotateY: 0, borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 700, damping: 20 }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -15, 
                          boxShadow: `0 0 30px ${theme.color}40`,
                          borderColor: theme.color
                        }}
                        className="relative group bg-[#0d1117]/70 backdrop-blur-md border border-white/10 p-6 w-48 md:w-56 flex flex-col items-center transition-all duration-150 no-underline cursor-pointer rounded-2xl overflow-hidden"
                        style={{
                          transformStyle: 'preserve-3d',
                          perspective: '1000px'
                        }}
                      >
                        <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden mb-6 border border-white/10 group-hover:border-transparent transition-colors relative bg-[#010409] rounded-xl">
                          <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors z-10"></div>
                          <img src={theme.img} alt={theme.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        
                        <h3 
                          className="font-mono text-xl tracking-widest text-center transition-colors uppercase group-hover:text-white"
                          style={{ color: '#94A3B8' }}
                        >
                          {theme.name}
                        </h3>
                        <p className="font-mono text-[9px] text-[#94A3B8] opacity-50 tracking-[0.2em] text-center mt-2 group-hover:opacity-100 transition-colors uppercase">
                          {theme.role}
                        </p>

                        {theme.id === 'cyber' && (
                          <div className="absolute top-0 right-4 bg-[#3B82F6] text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded-b-md shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            Active
                          </div>
                        )}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
'''

content = content.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">',
    theme_block + '\n            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">'
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected into main branch")
