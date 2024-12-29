import { useEffect } from 'react';
import { Routes, Route, Navigate } from'react-router-dom';
import { Toaster } from "react-hot-toast";

import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ChatsPage from './pages/ChatsPage';
import GamePage from './pages/GamePage';
import { useAuthStore } from './store/useAuthStore';

import {Loader} from 'lucide-react';
import Navbar from './components/Navbar';


function App() {

  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(authUser);
  

  if (isCheckingAuth)
    return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin'/>
    </div>
    )

  return (
    <div>
      <Navbar/>

      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/signup' element={!authUser ? <SignupPage/> : <Navigate to='/' />} />
        <Route path='/login' element={!authUser ?  <LoginPage/> : <Navigate to='/' />} />
        <Route path='/settings' element={<SettingsPage/>} />
        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to='/login' />} />
        <Route path='/chats' element={authUser ? <ChatsPage/> : <Navigate to='/login' />} />
        <Route path='/game' element={authUser ? <GamePage/> : <Navigate to='/login' />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
