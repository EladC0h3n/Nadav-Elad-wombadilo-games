import { useState } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from'react-router-dom'

import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import ChatsPage from './pages/ChatsPage'
import GamePage from './pages/GamePage'


function App() {

  return (
    <div>
      <Navbar/>

      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/singup' element={<SignupPage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/settings' element={<SettingsPage/>} />
        <Route path='/profile' element={<ProfilePage/>} />
        <Route path='/chats' element={<ChatsPage/>} />
        <Route path='/game' element={<GamePage/>} />
      </Routes>
    </div>
  )
}

export default App
