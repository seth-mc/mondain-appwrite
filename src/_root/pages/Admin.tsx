import { DarkModeProps } from "@/types"

const Admin = ({ darkMode }: DarkModeProps) => {

  return (
    <div>
    <div className="flex justify-center">
        <img
          className={`d cursor-pointer w-80 ${darkMode ? 'invert' : ''}`}
          src="/assets/icons/mondain-admin.svg"
          alt="logo"
        />
      </div>
      
    </div>

  )
}

export default Admin