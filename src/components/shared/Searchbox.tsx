import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Searchbox = () => {
  const [searchValue, setSerchValue] = useState('')
  const navigate = useNavigate();

  return (
    <div className="px-8 sm:px-10 md:px-20 lg:px-80 flex gap-2 w-full mt-5 pb-7 scroll-transition-fade">
      <div className="flex justify-start items-center w-full px-2 rounded-xl bg-light-1 border border-2 border-black focus-within:shadow-sm">
        <Search className="ml-1"/>
        <input
          type="text"
          onChange={(e) => setSerchValue(e.target.value)}
          placeholder="Search"
          value={searchValue}
          onFocus={() => navigate('/search')}
          className="d p-2 w-full bg-light-1 outline-none font-spacemono"
        />
      </div>
    </div>
  )
}

export default Searchbox