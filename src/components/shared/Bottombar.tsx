import { Link } from 'react-router-dom'

const Bottombar = () => {
  return (
    <section className="bottom-bar">
      <Link to={`/create-post`}>
        <div className="icon rounded-full bg-dark-1">
          <img src="/assets/icons/plus.svg" alt="add-post" />
        </div>
      </Link>
    </section>
  )
}

export default Bottombar