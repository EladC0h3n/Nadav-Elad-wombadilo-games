import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="h-screen grid">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              {/* <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div> */}
              <h1 className="text-3xl font-bold mt-2">Welcome To Wombadilo!</h1>
              <p className="text-base-content/60">Here you can chat with your friends and play together</p>
              <p className="text-base-content/60">we are working on some new games and features, stay turn</p>
            </div>
            
          </div>
        </div>
      </div>

    </div>







    // <div className="h-screen grid">
    //   <h1 className="text-2xl font-bold mt-2">Welcome To Wombadilo!</h1>
    //   <Link to='/login' className='btn'>Login</Link>
    //   <Link to='/signup' className='btn'>Signup</Link>
    //   <p>Feel free to explore the other pages in the navigation bar.</p>
    //   <p>Powered by React {React.version}.</p>
    // </div>
  )
}

export default HomePage