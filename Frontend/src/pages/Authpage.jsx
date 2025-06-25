import { useState } from "react";
import API from "../services/api"; // Axios instance
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            if (isSignup) {
                const response = await API.post("auth/signup", formData);
                alert("Signup successful!");
    
                const loginResponse = await API.post("auth/login", { email: formData.email, password: formData.password });
                localStorage.setItem("token", loginResponse.data.token);
    
                navigate("/compiler");
            } else {
                const response = await API.post("/login", { email: formData.email, password: formData.password });
                alert("Login successful!");
                localStorage.setItem("token", response.data.token);
    
                navigate("/compiler");
            }
        } catch (err) {
            // Handle response errors properly
            const errorMessage = err.response?.data?.message || "Something went wrong";
            setError(errorMessage);
            alert(errorMessage); // Show detailed error message in alert
        }
    };
    
    
    

    return (
        <div className="flex justify-center items-center h-screen bg-slate-700">
            <div className="relative w-[868px] h-[580px] bg-white rounded-lg overflow-hidden transition-all duration-500">
                
                {/* Sign Up Form */}
                <div className={`absolute top-0 left-0 w-1/2 h-full p-10 space-y-6 flex flex-col justify-center items-center transition-all duration-500 ${isSignup ? "translate-x-full opacity-100 z-10" : "opacity-0 z-0"}`}>
                    <h1 className="text-2xl font-bold text-gray-900 ">Create Account</h1>
                 
                    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full space-y-6">
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 mt-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" required />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 mt-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 mt-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" required />
                        <button type="submit" className="mt-5 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all">Sign Up</button>
                    </form>
                </div>

                {/* Login In Form */}
                <div className={`absolute top-0 left-0 w-1/2 h-full space-y-6 p-10 flex flex-col justify-center items-center transition-all duration-500 ${isSignup ? "opacity-0 z-0" : "opacity-100 z-10"}`}>
                    <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
                 
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8 items-center w-full">
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 mt-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 mt-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" required />
                        <button type="button" onClick={() => navigate("/Forgotpass")} className="text-teal-600 text-sm mt-2 hover:underline">Forgot your password?</button>
                        <button type="submit" className="mt-5 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all">Log In</button>
                    </form>
                </div>

                {/* Overlay Panel */}
                <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-teal-400 to-teal-600 text-white flex flex-col justify-center items-center z-50 transition-all duration-500 ${isSignup ? "-translate-x-full" : ""}`}>
                    {isSignup ? (
                        <div className="flex flex-col items-center text-center space-y-6 px-5">
                            <h1 className="text-4xl font-bold">Welcome Back!</h1>
                            <p>To keep connected with us, please log in with your personal info</p>
                            <button onClick={() => setIsSignup(false)} className="mt-5 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-teal-600 transition-all">Log In</button>
                        </div>
                    ) : (
                        <div className=" flex flex-col items-center text-center space-y-4">
                            <h1 className="text-4xl font-bold">Hello, Friend!</h1>
                            <p className="">Enter your details and start your journey with us</p>
                            <button onClick={() => setIsSignup(true)} className="mt-5 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-teal-600 transition-all">Sign Up</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
