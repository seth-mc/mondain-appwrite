import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sections } from '@/constants';
import { ProfileDropdown } from './ProfileDropdown';
import { DarkModeProps } from '@/types';
import { motion, Variants } from "framer-motion";


const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

const Topbar = ({ isAdmin, darkMode, toggleDarkMode }: DarkModeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="!z-10 flex justify-between w-full mt-5 pb-7 px-5">
    <div className="flex items-center">
      {/* Hamburger Menu for small screens */}
      <div className="md:hidden">
      <motion.nav
        initial={false}
        animate={isOpen ? "open" : "closed"}
      >
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={() => setIsOpen(!isOpen)}
        >
              <img src="/assets/icons/menu.svg" alt="Menu" className="p-2 text-dark-1 font-spacemono rounded-full" />
              </motion.button>
              <motion.ul
        className="absolute left-0 top-0 mt-20 ml-2 rounded-lg bg-light-1 text-dark-1  border-dark-1 shadow-lg overflow-hidden"
        variants={{
          open: {
            clipPath: "inset(0% 0% 0% 0% round 10px)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.7,
              delayChildren: 0.3,
              staggerChildren: 0.05
            }
          },
          closed: {
            clipPath: "inset(10% 50% 90% 50% round 10px)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.3
            }
          }
        }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
            
              {sections.map((section) => (
                <motion.li variants={itemVariants} key={section.label}
                className="flex items-center p-2 px-8 hover:bg-gray-100">
                    <Link to={section.route} className="font-spacemono rounded-full">
                      {section.label}
                    </Link>
                    </motion.li>
              ))}
            </motion.ul>
                </motion.nav>
        </div>

       {/* Navigation Links for medium screens and larger */}
       <div className="hidden md:flex flex-grow justify-between">
          {sections.map((section) => (
            <div key={section.label} className="px-2">
              <Link to={section.route} className="p-2 font-spacemono text-dark-1 rounded-full">
                {section.label}
              </Link>
            </div>
          ))}
        </div>
      </div>

        {/* Profile Dropdown always on the right */}
      <div className="max-w-[40px] flex gap-3">
        <ProfileDropdown isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode || (() => {})}/>
      </div>
    </div>
  );
};

export default Topbar;
