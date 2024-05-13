import Topbar from '@/components/shared/Topbar'
import { Outlet } from 'react-router-dom'
import { DarkModeProps } from '@/types'

const RootLayout = ({ isAdmin, darkMode, toggleDarkMode }: DarkModeProps) => {

  return (
    <div className="bg-light-1 transition h-screen w-screen overflow-y-scroll relative">
        <Topbar isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <section className=" w-full h-full">
          <Outlet />

        </section>
        
    </div>
  )
}

export default RootLayout