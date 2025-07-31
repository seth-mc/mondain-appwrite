import { Link } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  darkMode?: boolean;
}

const Sidebar = ({ darkMode }: SidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger for small screens */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
    
      {/* Sidebar for desktop and as drawer on mobile */}
      <div
        className={`font-courier fixed left-0 top-0 h-screen w-64 border-r border-dark-4 bg-light-1 p-6 z-40 transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:block ${open ? 'block' : 'hidden'} md:!block`}
        style={{ boxShadow: open ? '0 0 0 100vw rgba(0,0,0,0.3)' : undefined }}
      >
        {/* Close button for mobile drawer */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 bg-light-1 border border-dark-4 rounded focus:outline-none"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div className="mb-12">
          <Link to="/" className="block" onClick={() => setOpen(false)}>
            <h1 className={`font-courier text-3xl font-bold italic uppercase text-dark-1 hover:text-red transition-colors duration-200`}>
              My Work
            </h1>
          </Link>
        </div>

        <section>
            <h2 className={`font-times font-bold text-md uppercase tracking-wider mb-3 text-dark-1 transition-colors duration-200`}>
              Mondain
            </h2>
            <div className="h-px my-[-10px] mb-2 bg-dark-1 w-full"></div>
            <nav className="space-y-2">
            <Link to="/about-us" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>About Us</Link>
              <Link to="/dj" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Music</Link>
              <Link to="/contact" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Contact</Link>
            </nav>
          </section>

        <div className="space-y-8 mt-12">
          <section>
            <h2 className={`font-times font-bold text-md uppercase tracking-wider mb-3 text-dark-1 transition-colors duration-200`}>
              Recent
            </h2>
            <div className="h-px my-[-10px] mb-2 bg-dark-1 w-full"></div>
            <nav className="space-y-2">
              <Link to="/recent" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Recent Posts</Link>
              <Link to="/" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Video</Link>
              <Link to="/shop" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Shop</Link>
            </nav>
          </section>

         

          {/* <section>
            <h2 className={`font-times font-bold text-md uppercase tracking-wider mb-3 text-dark-1 transition-colors duration-200`}>
              More Mondain
            </h2>
            <div className="h-px my-[-10px] mb-2 bg-dark-1 w-full"></div>
            <nav className="space-y-2">
              <Link to="/press" className={`block text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`} onClick={() => setOpen(false)}>Press Coverage</Link>
            </nav>
          </section> */}
        </div>

          {/* Mondain Logo at bottom center */}
        <div className="d absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <img 
            src="/assets/icons/mondain-3.svg" 
            alt="Mondain Logo" 
            className={`${darkMode ? 'invert' : ''} w-16 h-auto transition-opacity duration-200`}
          />
        </div>
        
      </div>

      

      {/* Overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 