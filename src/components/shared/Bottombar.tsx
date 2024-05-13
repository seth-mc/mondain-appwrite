import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const Bottombar = () => {
  return (
    <section className="bottom-bar">
      <Link to={`/create-post`}>
        <div className="icon rounded-full bg-dark-1">
          <Plus />
        </div>
      </Link>
    </section>
  )
}

export default Bottombar