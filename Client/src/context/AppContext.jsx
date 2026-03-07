import { createContext, useEffect, useState } from "react";
import axios from 'axios';
export const AppContent = createContext();
import { toast } from 'react-toastify'

export const AppContextProvider = (props) => { 

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [userData, setUserData] = useState(false);  


    const getUserData =  async () =>{
        try {

            const {data} =await axios.get(backendUrl+'/api/user/data')

            if(data.success){
                setUserData(data.userData);
            }else{
                toast.error(error.message)

            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getUserAuth = async ()=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth')
            
            if(data.success){
                setIsLoggedIn(true);
                await getUserData();
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    
    useEffect(() => {
        getUserAuth(); 
    }, []);

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}