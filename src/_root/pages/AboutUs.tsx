import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Header } from '@/components/shared';
import { DarkModeProps } from '@/types';

const AboutUs = ({ darkMode, isAdmin, toggleDarkMode }: DarkModeProps) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const tableOfContents = [
    { id: 'history', title: 'History' },
    { id: 'philosophy', title: 'Philosophy' },
    { id: 'products', title: 'Products' },
    { id: 'cultural-impact', title: 'Cultural Impact' },
    { id: 'references', title: 'References' }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-light-1">
      <Sidebar darkMode={darkMode} />
      <Header 
        darkMode={darkMode} 
        isAdmin={isAdmin} 
        toggleDarkMode={toggleDarkMode} 
        resetFilters={() => {}} 
      />
      
      <main className="px-4 md:px-8 md:ml-64">
        <div className="w-full mx-auto py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-light-1 border rounded-sm"
          >
            {/* Main Title */}
            <motion.div variants={itemVariants} className="pt-20 border-b border-gray-300 p-6">
              <h1 className="font-times text-4xl text-dark-1 mb-2">Mondain</h1>
              <p className="text-sm text-gray-600 italic">From Mondainpedia, the free encyclopedia</p>
            </motion.div>

            {/* Infobox */}
            <motion.div variants={itemVariants} className={`float-right m-6 w-80 border border-gray-300 text-sm ${darkMode ? 'bg-light-1' : 'bg-gray-50'}`}>
              <div className={`p-3 border-b border-gray-300 ${darkMode ? 'bg-light-1' : 'bg-gray-50'}`}>
                <h3 className={`text-dark-1 font-bold text-center`}>Mondain</h3>
              </div>
              <div className="relative m-6 d">
                  <img src="/assets/icons/mondain-3.svg" alt="Mondain Logo" className={`${darkMode ? 'invert' : ''} d w-full h-full`} />
                </div>
              <div className="text-dark-1 p-3 space-y-2">
                <div><strong>Founded:</strong> 2025</div>
                <div><strong>Location:</strong> Montreal, Canada</div>
                <div><strong>Type:</strong> <a href="#" className="text-blue-600 underline">Design house</a></div>
                <div><strong>Industry:</strong> Lifestyle products</div>
                <div><strong>Philosophy:</strong> Purposeful rebellion</div>
              </div>
            </motion.div>

            {/* Introduction */}
            <motion.div variants={itemVariants} className="p-6">
              <p className="text-dark-1 leading-relaxed mb-4 font-times">
                <strong>Mondain</strong> is a Montreal-based <a href="#" className="text-blue-600 underline">design house</a> founded in 2025, 
                specializing in purposeful, durable, and thoughtfully-curated lifestyle products. The brand positions itself as a 
                nature-inspired community rebelling against conventional career paths and mundane consumer culture.
              </p>
            </motion.div>

            {/* Table of Contents */}
            <motion.div variants={itemVariants} className={`mx-6 mb-6 border border-gray-300 w-fit pb-40 ${darkMode ? 'bg-light-1' : 'bg-gray-50'}`}>
              <div className={`px-3 py-2 border-b border-gray-300 ${darkMode ? 'bg-light-1' : 'bg-gray-50'}`}>
                <h3 className={`text-dark-1 font-bold text-sm`}>Contents</h3>
              </div>
              <div className="p-3">
                <ol className="space-y-1 text-sm">
                  {tableOfContents.map((item, index) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`text-blue-600 underline hover:text-blue-800 ${
                          activeSection === item.id ? 'font-bold' : ''
                        }`}
                      >
                        {index + 1}. {item.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* History Section */}
            <motion.section variants={itemVariants} id="history" className="p-6 border-t border-gray-200">
              <h2 className="font-times text-dark-1 text-2xl font-normal border-b-2 border-gray-300 pb-1 mb-4">History</h2>
              <div className="space-y-4 text-dark-1 leading-relaxed font-times">
                <p>
                  Mondain emerged in 2025 as a response to what its founders identified as the modern professional's struggle with 
                  <a href="#" className="text-blue-600 underline"> mundane</a> career expectations and mass-produced consumer goods. 
                  The brand name derives from the French word "mondain," meaning worldly or sophisticated, deliberately contrasting 
                  with the English "mundane" (ordinary, dull). This linguistic duality reflects the brand's core mission: transforming 
                  the ordinary aspects of daily life into something refined and intentional.
                </p>
                <p>
                  The design house was established with the principle that rebellion against conventional systems doesn't require 
                  destruction, but rather thoughtful creation. Mondain addresses the contemporary desire to escape soul-crushing routine work.
                </p>
              </div>
            </motion.section>

            {/* Philosophy Section */}
            <motion.section variants={itemVariants} id="philosophy" className="p-6 border-t border-gray-200">
              <h2 className="font-times text-dark-1 text-2xl font-normal border-b-2 border-gray-300 pb-1 mb-4">Philosophy</h2>
              <div className="space-y-4 text-dark-1 leading-relaxed font-times">
                <p>
                  Mondain operates according to four fundamental principles: identifying genuine human needs, mastering craft essentials, 
                  applying fresh perspective to established concepts, and maintaining unwavering belief in their vision.
                </p>
                <p>
                  The brand embraces what it terms "quiet rebellion" – challenging societal norms through deliberate action rather than 
                  conspicuous display. This approach aligns with historical <a href="#" className="text-blue-600 underline">avant-garde </a> 
                  movements that sought to provoke thought and inspire change through artistic expression.
                </p>
                
                {/* Design Ethos Subsection */}
                <h3 className="font-times text-xl font-normal border-b border-gray-300 pb-1 mt-6 mb-3">Design Ethos</h3>
                <p>
                  Mondain's aesthetic philosophy centers on creating "timeless over trendy" products, designed to remain relevant across 
                  generations. The brand draws inspiration from natural environments and emphasizes environmental stewardship, positioning 
                  itself against the <a href="#" className="text-blue-600 underline">fast fashion</a> industry's disposable culture.
                </p>
              </div>
            </motion.section>

            {/* Products Section */}
            <motion.section variants={itemVariants} id="products" className="p-6 border-t border-gray-200">
              <h2 className="font-times text-dark-1 text-2xl font-normal border-b-2 border-gray-300 pb-1 mb-4">Products</h2>
              <div className="space-y-4 text-dark-1 leading-relaxed font-times">
                <p>
                  The design house focuses on creating what it describes as "the quintessential uniform that prioritizes quality over flash". 
                  Products are designed with longevity in mind, intended to last 50+ years while maintaining contemporary relevance. 
                  The brand's approach to product development emphasizes small-batch production and thoughtful curation over mass market appeal.
                </p>
                <p>
                  Mondain aims to inspire through multiple channels including product fabrication, musical releases, and digital curation.
                </p>
              </div>
            </motion.section>

            {/* Cultural Impact Section */}
            <motion.section variants={itemVariants} id="cultural-impact" className="p-6 border-t border-gray-200">
              <h2 className="font-times text-dark-1 text-2xl font-normal border-b-2 border-gray-300 pb-1 mb-4">Cultural Impact</h2>
              <div className="space-y-4 text-dark-1 leading-relaxed font-times">
                <p>
                  The brand positions itself within a broader cultural movement of individuals choosing creative expression over corporate compliance. 
                  Mondain's community consists of what the brand terms "urban mavericks" – individuals who embody rebellion through purposeful 
                  lifestyle choices rather than superficial aesthetics.
                </p>
                <p>
                  This positioning reflects broader trends in contemporary culture, where consumers increasingly seek brands that align with 
                  their values and offer alternatives to conventional career paths. The brand's messaging resonates with themes explored in 
                  influential works about escaping mundane professional life.
                </p>
              </div>
            </motion.section>

            {/* References Section */}
            <motion.section variants={itemVariants} id="references" className="p-6 border-t border-gray-200">
              <h2 className="font-times text-dark-1 text-2xl font-normal border-b-2 border-gray-300 pb-1 mb-4">References</h2>
              <div className="text-sm text-dark-1 space-y-1 font-times">
                <ol className="space-y-1">
                  <li>1. ↑ <em>Mondain</em>. "About". Retrieved 2025.</li>
                  <li>2. ↑ <em>Mondain</em>. "About us | A Complete History ROW". Retrieved 2025.</li>
                  <li>3. ↑ <em>Mondain</em>. "About Us | The Worlds Best-Branding". Retrieved 2025.</li>
                  <li>4. ↑ <em>Mondain</em>. "Born in the Highlands of Montreal". Retrieved 2025.</li>
                  <li>5. ↑ Various sources on mundane definition and cultural connotations. Retrieved 2025.</li>
                </ol>
              </div>
            </motion.section>

            {/* Categories */}
            <motion.div variants={itemVariants} className={`p-6 border-t border-gray-200 ${darkMode ? 'bg-light-1' : 'bg-gray-50'}`}>
              <p className="text-sm text-dark-1">
                <strong>Categories:</strong> 
                <a href="#" className="text-blue-600 underline ml-1">Design companies</a> · 
                <a href="#" className="text-blue-600 underline ml-1">Fashion brands</a> · 
                <a href="#" className="text-blue-600 underline ml-1">Canadian companies</a> · 
                <a href="#" className="text-blue-600 underline ml-1">Companies established in 2025</a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;