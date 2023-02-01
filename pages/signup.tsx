import { ChangeEvent, useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/router"
import { AppDispatch } from '../src/store'
import { setUsername, setToken } from '@/features/auth/authSlice'
import { useDispatch } from 'react-redux'

//         email: "asdoiajsd",
//         password: "iuahhf"

export default function Signup(){
    const [email, setEmail] = useState<any>("");
    const [password, setPassword] = useState<any>("");
    const [confirmPassword, setConfirmPassword] = useState<any>("");
    const [error, setError] = useState<String>("");

    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        if(username && token) {
            dispatch(setUsername(username))
            dispatch(setToken(token))
            router.push('/');
        }
    } ,[])

    async function handleSubmit(e: ChangeEvent<HTMLFormElement>){
        e.preventDefault();

        const response = await axios.post("http://localhost:3001/login", {
            email: email,
            password: password
        })

        console.log(response)
        
        if(response.status === 200){
            const username = response.data.username;
            const token = response.data.token;

            localStorage.setItem("token", token);
            localStorage.setItem("username", username);

            dispatch(setUsername(username));
            dispatch(setToken(token));

            router.push('/');
        } else {
            setError("Authentication Failed");
        }
    }

    return (
        <div className="w-screen h-screen relative justify-center items-center flex">
            <div className="bg-gray-400 w-1/5 h-1/2 rounded-lg flex flex-col justify-center relative">
                <div className="h-1/3 flex items-center justify-center">
                    <h2 className="mx-auto text-center font-bold md:w-2/3 md:text-2xl sm:text-sm mt-2">Welcome to Exposure</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col justify-center w-4/5 mx-auto h-2/3">
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email..." className="bg-gray-200 placeholder-gray-600 !outline-none m-2 rounded-sm indent-2 h-1/4" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password..." className="bg-gray-200 placeholder-gray-600 m-2 !outline-none rounded-sm indent-2 h-1/4" />
                    <div className="h-1/2 flex items-center justify-center">
                        <button className="bg-gray-500 transition-all rounded-md duration-300 h-1/2 font-bold w-4/5 mx-auto hover:bg-gray-600 relative">
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}