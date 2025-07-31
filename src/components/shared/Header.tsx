import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { ProfileDropdown } from '@/components/shared';

interface HeaderProps {
  darkMode: boolean;
  isAdmin?: boolean;
  toggleDarkMode: () => void;
  resetFilters?: () => void;
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'DJ', to: '/dj' },
  { label: 'Shop', to: '/shop' }
];

const Header = ({ darkMode, isAdmin, toggleDarkMode, resetFilters }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCartClick = () => {
    // Look for the main cart from Shop.tsx first
    const mainCart = document.querySelector('#main-cart') as any;
    const globalCart = document.querySelector('#global-cart') as any;
    const anyShopifyCart = document.querySelector('shopify-cart') as any;
    const cart = mainCart || globalCart || anyShopifyCart;
    
    if (cart && typeof cart.showModal === 'function') {
      cart.showModal();
    } else {
      // Fallback: redirect to shop page
      window.location.href = '/shop';
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-light-1 border-b border-dark-4 z-50">
      <div className="flex items-center justify-between h-full w-full">
        {/* Left side - Logo and hamburger */}
        <div className="flex items-center pl-4 md:pl-8">
          {/* Hamburger for mobile */}
          <button
            className="md:hidden p-2 mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          
          {/* Logo - always visible, positioned to the left */}
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/icons/mondain-5.svg" 
              alt="icon" 
              className={`d w-[48px] cursor-pointer hover:opacity-80 transition-opacity duration-200 ${darkMode ? 'invert' : ''}`}
              onClick={resetFilters}
            />
          </Link>
        </div>

        {/* Center - Nav links (desktop only) */}
        <nav className="hidden md:flex gap-16 font-courier absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`text-base italic uppercase text-dark-1 hover:text-red transition-colors duration-200`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Cart and Profile dropdown */}
        <div className="flex items-center gap-4 pr-4 md:pr-8">
          {/* Shopping Cart Button */}
          <button
            onClick={handleCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Cart"
          >
            <ShoppingCart size={20} className="text-dark-1" />
            {/* Cart item count badge - Using dangerouslySetInnerHTML for proper Shopify component rendering */}
            <div 
              dangerouslySetInnerHTML={{
                __html: `
                  <shopify-store 
                    store-domain="m-ondain.myshopify.com"
                    country="US" 
                    language="en"
                    public-access-token="8c6d7e13254333199d913e533d62f9f2"
                  >
                    <shopify-context type="cart">
                      <template>
                        <div 
                          style="position: absolute; top: -4px; right: -4px; background: #dc2626; color: white; font-size: 12px; border-radius: 50%; height: 20px; width: 20px; display: flex; align-items: center; justify-content: center; min-width: 20px; font-weight: 600;"
                          id="cart-badge"
                        >
                          <shopify-data query="cart.totalQuantity"></shopify-data>
                        </div>
                      </template>
                      <template slot="empty">
                        <!-- No badge when cart is empty -->
                      </template>
                    </shopify-context>
                  </shopify-store>
                `
              }}
            />
          </button>
          
          <ProfileDropdown darkMode={darkMode} isAdmin={isAdmin} toggleDarkMode={toggleDarkMode} />
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full bg-light-1 border-b border-dark-4 flex flex-col items-center z-50 font-courier">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`py-4 w-full text-center border-b border-dark-4 italic uppercase text-dark-1 hover:text-red transition-colors duration-200`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header; 