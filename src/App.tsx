import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './globals.css'
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import { Admin, CreatePost, Home, PostDetails, Profile, Search, UpdateProfile } from './_root/pages';
import { Toaster } from './components/ui/toaster';


const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  return (
    <main className={`hello ${darkMode ? "dark" : ""} flex h-screen`}>
        <Routes>
            {/* public routes */ }
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SigninForm />} />
              <Route path="/sign-up" element={<SignupForm />} />
            </Route>
            {/* private routes */}
              <Route element={<RootLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
              <Route index element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>} />
              <Route path="/admin" element={<Admin darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/posts/:id" element={<PostDetails/>} />
              <Route path="/profile/:id/*" element={<Profile />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
            </Route>

        </Routes>

        <Toaster />
    </main>

  )
}

export default App