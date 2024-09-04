import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { sections } from '@/constants';
import { ProfileDropdown } from './ProfileDropdown';
import { DarkModeProps } from '@/types';
import { motion, Variants } from "framer-motion";
import { Headset, Home, Menu, Shirt } from 'lucide-react';


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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="!z-20 d flex justify-between w-full mt-5 pb-7 px-5">
    <div className="text-dark-1 flex items-center">
      {/* Hamburger Menu for small screens */}
      <div className="md:hidden">
      <motion.nav
        ref={dropdownRef}
        initial={false}
        animate={isOpen ? "open" : "closed"}
      >
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={() => setIsOpen(!isOpen)}
        >
              <Menu size={36} className="p-2"/>
              </motion.button>
              <motion.ul
            className="absolute !z-20 left-0 top-0 mt-20 ml-2 rounded-lg border-dark-1 shadow-lg overflow-hidden"
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
            
            <Link to={`/`}>
                <motion.li variants={itemVariants}
                  className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                >
                  <Home className="mr-2" size={16} />
                  <span>Home</span>
                </motion.li>
              </Link>

              <Link to={`/dj`}>
                <motion.li variants={itemVariants}
                  className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                >
                  <Headset className="mr-2" size={16} />
                  <span>DJ</span>
                </motion.li>
              </Link>

              <Link to={`/the-rack`}>
                <motion.li variants={itemVariants}
                  className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                >
                  <Shirt className="mr-2" size={16} />
                  <span>The Rack</span>
                </motion.li>
              </Link>


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
