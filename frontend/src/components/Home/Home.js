import React, {useEffect, useState} from 'react';
import './Home.css';
import {useNavigate} from 'react-router-dom';
import { toast } from "react-toastify";

function Home() {
    
    const [loggedInUser, setLoggedInUser] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'))
    }, [])
    

    const handleSuccess = () => {
    toast.success("Logout successful!");
  };

    const handleLogout =(e) => {

        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Loggedout');
        setTimeout(()=>{
            navigate('/login');

        },1000)



    }







  return (
    <div className="home">

        <h1>Home Page</h1>

        <button onClick={handleLogout}>Logout</button>

    </div>
  );
}

export default Home;
