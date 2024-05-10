import { useState } from 'react';
import { useSignOutAccount } from "@/lib/react-query/queries";
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { Loader } from '@/components/shared';
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

export function ProfileDropdown({ isAdmin, darkMode, toggleDarkMode }: { isAdmin?: boolean, darkMode: boolean, toggleDarkMode: () => void }) {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const [isOpen, setIsOpen] = useState(false);


  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(prevUser => ({ ...prevUser, ...INITIAL_USER }));
    navigate("/sign-in");
  };


  return (
    <div>
      {isLoading ? (
        <div className="h-14">
          <Loader />
        </div>
      ) : (
        <motion.nav
          initial={false}
          animate={isOpen ? "open" : "closed"}
        >
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img src={user?.email ? user.imageUrl : "/assets/icons/profile-placeholder.svg"} alt="profile" className="d w-32 h-25 rounded-full border border-1 border-dark-1" />
          </motion.button>
          <motion.ul
            className="absolute right-0 top-0 mt-20 mr-2 rounded-lg bg-light-1  border-dark-1 shadow-lg overflow-hidden"
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
                <img className="mr-2 h-4 w-4" src="/assets/icons/user.svg" alt="user" />
                <span>Profile</span>
              </motion.li>
            </Link>
            ) : (
              <Link to={`/sign-up`}>
              <motion.li variants={itemVariants}
                className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
              >
                <img className="mr-2 h-4 w-4" src="/assets/icons/user.svg" alt="user" />
                <span>Sign Up</span>
              </motion.li>
            </Link>

            )}
            <motion.li variants={itemVariants} onClick={toggleDarkMode} className="flex text-dark-1 hover:text-light-3 items-center p-2 px-8 hover:bg-gray-100">

              {darkMode ? (
                <>
                  <img className="mr-2 h-4 w-4" src="/assets/icons/sun.svg" alt="sun" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <img className="mr-2 h-4 w-4" src="/assets/icons/moon.svg" alt="sun" />
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
                    <img className="mr-2 h-4 w-4" src="/assets/icons/settings.svg" alt="user" />
                    <span>Settings</span>
                  </motion.li>
                </Link>
                <Link to={`/create-post`}>
                  <motion.li variants={itemVariants}
                    className="flex items-center p-2 px-8 text-dark-1 hover:text-light-3 hover:bg-gray-100"
                  >
                    <img className="mr-2 h-4 w-4" src="/assets/icons/create-post.svg" alt="user" />
                    <span>Create Post</span>
                  </motion.li>
                </Link>
              </div>
            ) : (
              <div></div>
            )}
            <motion.button variants={itemVariants} onClick={(e) => handleSignOut(e)} className="flex text-dark-1 hover:text-light-3 items-center p-2 px-8 hover:bg-gray-100">
              <img className="mr-2 h-4 w-4" src="/assets/icons/logout.svg" alt="logout" />
              <span>Log out</span>
            </motion.button>

          </motion.ul>
        </motion.nav>

      )}
    </div>
  );
}
