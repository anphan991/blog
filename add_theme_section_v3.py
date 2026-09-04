import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. ADD LINK TO NAVBAR
nav_link = r'''<button onClick={() => { document.getElementById('sec-theme')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[02] THEMES" /></button>
                      <button onClick={() => { document.getElementById('sec-archive')'''
content = content.replace(r'''<button onClick={() => { document.getElementById('sec-archive')''', nav_link)

# Fix numbering in navbar
content = content.replace('[02] ARCHIVE', '[03] ARCHIVE')
content = content.replace('[03] WORKS', '[04] WORKS')
content = content.replace('[04] TOPICS', '[05] TOPICS')
content = content.replace('[05] CONNECT', '[06] CONNECT')

# 2. CREATE THE THEME SECTION INLINE
theme_section = '''
            {/* THEME SELECTION SECTION */}
            <section id="sec-theme" className="ms-section">
              <div className="section-label">Realities</div>
              
              <div className="flex flex-col mb-16">
                <h2 className="font-mono text-2xl md:text-3xl text-white uppercase tracking-widest mb-2">
                  <HackerText text="Select_Environment" />
                </h2>
                <p className="font-mono text-[10px] md:text-xs text-[#4ade80] tracking-[0.2em] uppercase">
                  Current Reality: Not Configured
                </p>
              </div>

              <div className="flex flex-wrap gap-8 md:gap-12 w-full justify-start items-center">
                {[
                  { id: 'cyber', name: 'CYBERCORE', role: 'CURRENT REALITY', img: '/pic2.jpg', color: '#22d3ee', link: '#' },
                  { id: 'win98', name: 'WINDOWS 98', role: 'NOSTALGIA SECTOR', img: '/pic2.jpg', color: '#a855f7', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                  { id: 'matrix', name: 'THE MATRIX', role: 'DEEP DIVE', img: '/pic2.jpg', color: '#4ade80', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
                ].map((theme, i) => (
                  <motion.a
                    key={theme.id}
                    href={theme.link}
                    initial={{ opacity: 0, y: 50, rotateY: 30, borderColor: "#333330", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0, borderColor: "#333330", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -15, 
                      boxShadow: `0 0 30px ${theme.color}40`,
                      borderColor: theme.color
                    }}
                    className="relative group bg-[#0A0A0A] border border-[#333330] p-6 w-48 md:w-56 flex flex-col items-center transition-all duration-150 no-underline cursor-pointer"
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Image Container */}
                    <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden mb-6 border border-[#333330] group-hover:border-transparent transition-colors relative bg-[#050505]">
                      <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors z-10"></div>
                      <img src={theme.img} alt={theme.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    
                    {/* Text Info */}
                    <h3 
                      className="font-mono text-xl text-white tracking-widest text-center transition-colors uppercase"
                      style={{ color: '#A9A9A2' }}
                    >
                      {theme.name}
                    </h3>
                    <p className="font-mono text-[9px] text-[#A9A9A2] opacity-50 tracking-[0.2em] text-center mt-2 group-hover:opacity-100 transition-colors uppercase">
                      {theme.role}
                    </p>
                    
                    {/* Hover Style Injection */}
                    <style jsx>{`
                      a:hover h3 { color: ${theme.color} !important; }
                      a:hover p { color: ${theme.color} !important; }
                    `}</style>

                    {i === 0 && (
                      <div className="absolute -top-3 right-4 bg-white text-black text-[8px] font-bold px-2 py-1 uppercase tracking-widest">
                        Active
                      </div>
                    )}
                  </motion.a>
                ))}
              </div>
            </section>
'''

# Find the end of sec-manifesto and insert sec-theme
pattern = r'(</section>\s*{/\* =+ VISUAL ARCHIVE)'
content = re.sub(pattern, r'</section>\n\n' + theme_section.replace('$', '$$') + r'\n\n            \1', content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Theme section")
