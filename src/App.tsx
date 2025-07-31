import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './globals.css'
import AuthLayout from './_auth/AuthLayout';
import { useUserContext } from "@/context/AuthContext";
import RootLayout from './_root/RootLayout';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import { Admin, CreatePost, Home, PostDetails, Profile, UpdateProfile, Dj, Contact} from './_root/pages';
import { Toaster } from './components/ui/toaster';
import AboutUs from './_root/pages/AboutUs';
import Recent from './_root/pages/Recent';
import PlayerComponent from './components/shared/Player';
import Shop from './_root/pages/Shop';


const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Global player state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Player control functions
  const togglePlayer = () => {
    setIsPlayerOpen(prev => !prev);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
  };

  const { user } = useUserContext();

  // Check if the user has the "admin" label
  const isAdmin = user && user.admin;

  // Load Shopify Web Components on app start
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://cdn.shopify.com/storefront/web-components.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <main className={`hello ${darkMode ? "dark" : ""} flex h-screen`}>
      {/* Global Shopify Store Configuration */}
      <shopify-store 
        store-domain="m-ondain.myshopify.com"
        country="US" 
        language="en"
        public-access-token="8c6d7e13254333199d913e533d62f9f2"
      ></shopify-store>
      
      {/* Global Shopping Cart */}
      <shopify-cart id="global-cart"></shopify-cart>
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/sign-up" element={<SignupForm darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Route>
        <Route element={<RootLayout isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<Home isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/dj" element={<Dj />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/about-us" element={<AboutUs darkMode={darkMode} toggleDarkMode={toggleDarkMode}   />} />
          <Route path="/recent" element={<Recent darkMode={darkMode} isAdmin={isAdmin} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/shop" element={<Shop darkMode={darkMode} isAdmin={isAdmin} toggleDarkMode={toggleDarkMode} />} />
          

          {/* private routes */}
          {isAdmin && (
            <Route>
              <Route path="/admin" element={<Admin darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/create-post" element={<CreatePost />} />
            </Route>
          )}
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
        </Route>

      </Routes>

      {/* Global Player Component with click-outside functionality */}
      <PlayerComponent 
        isOpen={isPlayerOpen}
        onToggle={togglePlayer}
        onClose={closePlayer}
        darkMode={darkMode}
      />

      <Toaster />
    </main>

  )
}

export default App