import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div>
      <h1>Welcome To Wombadilo!</h1>
      <Link to='/login' className='btn'>Login</Link>
      <Link to='/signup' className='btn'>Signup</Link>
      <p>Feel free to explore the other pages in the navigation bar.</p>
      <p>Powered by React {React.version}.</p>
    </div>
  )
}

export default HomePage