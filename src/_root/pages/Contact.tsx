import { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { DarkModeProps } from '@/types';
import { useRef } from 'react';
import Sidebar from '@/components/shared/Sidebar';

// Image transition data - add your own images here
const transitionImages = [
  '/assets/icons/mondain-1.svg',
  '/assets/icons/mondain-2.svg',
  '/assets/icons/mondain-3.svg',
  '/assets/icons/mondain-4.svg',
  '/assets/icons/mondain-5.svg',
];

// Contact emails for the slot machine animation
const contactEmails = [
  { label: 'FOR ALL INQUIRIES:', email: 'CONTACT@MONDAIN.PAGE' }
];

// Social media links
const socialLinks = [
  { name: 'INSTAGRAM', url: 'https://www.instagram.com/m.ondain/' },
  { name: 'PINTEREST', url: 'https://ca.pinterest.com/m0ndain/' },
  { name: 'YOUTUBE', url: 'https://www.youtube.com/@m.ondain' }
];

// Footer social links (including additional platforms)
const footerSocialLinks = [
  { name: 'INSTAGRAM', url: 'https://www.instagram.com/m.ondain/' },
  { name: 'PINTEREST', url: 'https://ca.pinterest.com/m0ndain/' },
  { name: 'YOUTUBE', url: 'https://www.youtube.com/@m.ondain' }
];

const Contact = ({ darkMode }: DarkModeProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const contactRef = useRef(null);
  const isContactInView = useInView(contactRef, { once: true, amount: 0.3 });

  // Auto-rotate images
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % transitionImages.length);
    }, 3000);

    return () => clearInterval(imageTimer);
  }, []);



  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-1' : 'bg-gray-50'} font-courier`}>
     <Sidebar />

             {/* Main Content */}
       <main className="pt-40 pb-20 md:ml-64">
         <div className="max-w-7xl mx-auto px-6">
          {/* Page Load Animation Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[80vh]"
          >
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                                 <motion.h1
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.5 }}
                   className={`contact-heading mb-6 ${darkMode ? 'text-light-1' : 'text-black'}`}
                 >
                   REACH US.
                 </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`text-lg leading-relaxed max-w-2xl ${darkMode ? 'text-light-3' : 'text-gray-700'}`}
                >
                  We're always open to new opportunities, collaborations, and conversations. 
                  Whether you're looking to work with us, join our team, or simply want to say hello, 
                  we'd love to hear from you.
                </motion.p>

                {/* Contact Details with Slot Machine Animation */}
                <motion.div
                  ref={contactRef}
                  className="mt-16 space-y-8"
                >
                  {contactEmails.map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.8 + index * 0.3,
                        ease: "easeOut"
                      }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: 60 }}
                        animate={isContactInView ? { y: 0 } : { y: 60 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: 0.8 + index * 0.3,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                                                 <p className={`contact-label mb-2 ${darkMode ? 'text-light-3' : 'text-gray-600'}`}>
                           {contact.label}
                         </p>
                         <motion.a
                           href={`mailto:${contact.email.toLowerCase()}`}
                           whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                           className={`contact-email hover:opacity-70 transition-opacity block ${darkMode ? 'text-light-1' : 'text-black'}`}
                         >
                           {contact.email}
                         </motion.a>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Right Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="space-y-8">
                {/* Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3 className={`text-sm tracking-wider mb-4 ${darkMode ? 'text-light-3' : 'text-gray-600'}`}>
                    ON THE WEB
                  </h3>
                  <address className={`text-base leading-relaxed not-italic ${darkMode ? 'text-light-1' : 'text-black'}`}>
                    MONTREAL, CANADA<br />
                    MONDAIN.PAGE<br />
                    COPYRIGHT 2025
                  </address>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <h3 className={`text-sm tracking-wider mb-4 ${darkMode ? 'text-light-3' : 'text-gray-600'}`}>
                    FOLLOW US
                  </h3>
                  <div className="space-y-2">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        className={`block text-base tracking-wider hover:opacity-70 transition-all duration-200 ${darkMode ? 'text-light-1' : 'text-black'}`}
                      >
                        {social.name}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

             {/* Sticky Image Transition Component */}
       <motion.div
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.6, delay: 1.2 }}
         className="hidden sm:block fixed bottom-8 right-8 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 z-40"
       >
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={transitionImages[currentImageIndex]}
              alt="Mondain"
              initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 10, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={`d w-full h-full object-contain ${darkMode ? 'invert' : ''}`}
            />
          </AnimatePresence>
        </div>
      </motion.div>

             {/* Footer */}
       <motion.footer
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, delay: 1.5 }}
         className={`${darkMode ? 'bg-dark-2 border-light-4' : 'bg-white border-gray-200'} border-t py-16 md:ml-64`}
       >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo and Main Nav */}
            <div>
              <div className="font-times font-bold text-lg tracking-widest mb-6">
                <span className={darkMode ? 'text-light-1' : 'text-black'}>MONDAIN</span>
                <sup className="text-xs">®</sup>
              </div>
              <nav className="space-y-3">
                {['COMPANY', 'CULTURE', 'RESEARCH', 'CONTACT'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`block text-sm tracking-wider hover:opacity-70 transition-opacity ${darkMode ? 'text-light-3' : 'text-gray-600'}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Column 2 - Projects */}
            <div>
              <h4 className={`text-sm tracking-wider mb-6 ${darkMode ? 'text-light-1' : 'text-black'}`}>
                PROJECTS
              </h4>
              <nav className="space-y-3">
                {['MONDAIN BOOK', 'MONDAIN FOR GOOD', 'CREATIVE LAB', 'INNOVATION HUB'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className={`block text-sm tracking-wider hover:opacity-70 transition-opacity ${darkMode ? 'text-light-3' : 'text-gray-600'}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Column 3 - Social */}
            <div>
              <h4 className={`text-sm tracking-wider mb-6 ${darkMode ? 'text-light-1' : 'text-black'}`}>
                SOCIAL
              </h4>
              <nav className="space-y-3">
                {footerSocialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-sm tracking-wider hover:opacity-70 transition-opacity ${darkMode ? 'text-light-3' : 'text-gray-600'}`}
                  >
                    {social.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Column 4 - Legal */}
            <div>
              <h4 className={`text-sm tracking-wider mb-6 ${darkMode ? 'text-light-1' : 'text-black'}`}>
                LEGAL
              </h4>
              <nav className="space-y-3">
                <address className={`text-sm not-italic leading-relaxed ${darkMode ? 'text-light-3' : 'text-gray-600'}`}>
                  MONTREAL, CANADA<br />
                  MONDAIN.PAGE<br />
                  COPYRIGHT 2025
                </address>
                <a
                  href="#legal-terms"
                  className={`block text-sm tracking-wider hover:opacity-70 transition-opacity mt-4 ${darkMode ? 'text-light-3' : 'text-gray-600'}`}
                >
                  LEGAL TERMS
                </a>
              </nav>
            </div>
          </div>

          {/* Bottom Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className={`mt-16 pt-8 ${darkMode ? 'border-light-4' : 'border-gray-200'} border-t`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-lg md:text-xl font-bold tracking-widest ${darkMode ? 'text-light-1' : 'text-black'}`}>
                THE CREATIVE POWERHOUSE OF YOUTH CULTURE.
              </span>
              <span className={`text-lg md:text-xl font-bold tracking-widest ${darkMode ? 'text-light-1' : 'text-black'}`}>
                THE CREATIVE POWERHOUSE OF YOUTH CULTURE.
              </span>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Contact;
