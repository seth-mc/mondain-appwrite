import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './globals.css'
import AuthLayout from './_auth/AuthLayout';
import { useUserContext } from "@/context/AuthContext";
import RootLayout from './_root/RootLayout';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import { Admin, CreatePost, Home, PostDetails, Profile, UpdateProfile, Dj } from './_root/pages';
import { Toaster } from './components/ui/toaster';


const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const { user } = useUserContext();


  // Check if the user has the "admin" label
  const isAdmin = user && user.admin;

  return (
    <main className={`hello ${darkMode ? "dark" : ""} flex h-screen`}>
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm darkMode={darkMode} />} />
          <Route path="/sign-up" element={<SignupForm darkMode={darkMode}/>} />
        </Route>
        <Route element={<RootLayout isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<Home isAdmin={isAdmin}darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/dj" element={<Dj />} />

          {/* private routes */}
          {isAdmin && (
            <Route>
              <Route path="/admin" element={<Admin darkMode={darkMode} />} />
              <Route path="/create-post" element={<CreatePost />} />
            </Route>
          )}
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
        </Route>

      </Routes>

      <Toaster />
    </main>

  )
}

export default App