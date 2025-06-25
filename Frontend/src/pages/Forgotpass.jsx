import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        try {
            const response = await API.post("/forgot-password", { email });
            setMessage(response.data.message || "A password reset link has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-700">
            <div className="w-[400px] p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Forgot Password</h2>
                <p className="text-gray-600 text-center mt-2">Enter your email to receive a reset link.</p>
                
                {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
                {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="mt-6">
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                        required
                    />
                    <button type="submit" className="w-full mt-4 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all">
                        Send Reset Link
                    </button>
                </form>
                
                <div className="text-center mt-4">
                    <button onClick={() => navigate("/login")} className="text-teal-600 hover:underline">Back to Login</button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
