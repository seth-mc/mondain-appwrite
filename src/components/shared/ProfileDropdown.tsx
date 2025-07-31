import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useSignOutAccount } from "@/lib/react-query/queries";
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { Loader } from '@/components/shared';
import { motion, Variants } from "framer-motion";
import { CirclePlus, LogOut, Moon, Settings, Sun, User } from 'lucide-react';

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

const ProfileDropdown = ({ isAdmin, darkMode, toggleDarkMode }: { isAdmin?: boolean, darkMode: boolean, toggleDarkMode: () => void }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const [isOpen, setIsOpen] = useState(false);


  const handleSignOut = async (
    e: MouseEvent
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(prevUser => ({ ...prevUser, ...INITIAL_USER }));
    navigate("/sign-in");
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !((dropdownRef.current as unknown) as HTMLElement).contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div>
      {isLoading ? (
        <div className="h-14">
          <Loader />
        </div>
      ) : (
        <motion.nav
          ref={dropdownRef}
          initial={false}
          animate={isOpen ? "open" : "closed"}
        >
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img src={user?.email ? user.imageUrl : "/assets/icons/m-profile.gif"} alt="profile" className={`d w-[32px] border border-1 border-dark-2 ${darkMode ? 'invert' : ''}`} />
          </motion.button>
          <motion.ul
            className="absolute d !z-20 right-0 top-0 mt-20 mr-2 bg-light-1 border-dark-1 shadow-lg overflow-hidden"
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
            {user?.email ? (
              <Link to={`/profile/${user.id}`}>
                <motion.li variants={itemVariants}
                  className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                >
                  <User className="mr-2" size={16} />
                  <span>Profile</span>
                </motion.li>
              </Link>
            ) : (
              <Link to={`/sign-up`}>
                <motion.li variants={itemVariants}
                  className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                >
                  <User className="mr-2" size={16} />
                  <span>Sign Up</span>
                </motion.li>
              </Link>

            )}
            <motion.li variants={itemVariants} onClick={toggleDarkMode} className="flex text-dark-1 hover:text-light-3 items-center p-2 px-8 hover:bg-gray-100">

              {darkMode ? (
                <>
                  <Sun className="mr-2" size={16} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2" size={16} />
                  <span>Dark Mode</span>
                </>
              )}

            </motion.li>

            {isAdmin ? (
              <div>
                <Link to={`/admin/settings`}>
                  <motion.li variants={itemVariants}
                    className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                  >
                    <Settings className="mr-2" size={16} />
                    <span>Settings</span>
                  </motion.li>
                </Link>
                <Link to={`/create-post`}>
                  <motion.li variants={itemVariants}
                    className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                  >
                    <CirclePlus className="mr-2" size={16} />
                    <span>Create Post</span>
                  </motion.li>
                </Link>
              </div>
            ) : (
              <div></div>
            )}
            {user?.email ? (
              <motion.li variants={itemVariants} onClick={(e: MouseEvent) => handleSignOut(e)} className="flex text-dark-1 hover:text-light-3 items-center p-2 px-8 hover:bg-gray-100">
                <LogOut className="mr-2" size={16} />
                <span>Log out</span>
              </motion.li>
            ) : (
              <div>
              </div>
            )}

          </motion.ul>
        </motion.nav>

      )}
    </div>
  );
};

export default ProfileDropdown;
