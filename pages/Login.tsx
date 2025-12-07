
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Il listener su App.tsx gestirà il reindirizzamento
    } catch (error: any) {
      alert("Errore login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen font-sans flex justify-center items-center overflow-hidden bg-slate-900 relative">
        {/* Background Image */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                background: `url('https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png') no-repeat center center fixed`,
                backgroundSize: 'cover',
                opacity: 0.3 // Leggermente oscurato per contrasto
            }}
        ></div>
        
        {/* Overlay Scuro */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <style>{`
            @keyframes floatIn {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-float-in {
                animation: floatIn 1s ease-out forwards;
            }
        `}</style>

        {/* Login Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 w-[350px] shadow-[0_0_40px_rgba(0,255,224,0.2)] animate-float-in">
            <h2 className="text-center text-white mb-6 font-semibold text-2xl tracking-wide">Welcome Back</h2>
            
            <form onSubmit={handleLogin}>
                <div className="mb-5 relative">
                    <input 
                        type="email" 
                        name="email" 
                        required 
                        placeholder="Email" 
                        className="w-full p-3 pl-4 rounded-[10px] bg-white/10 border border-white/20 text-white text-sm outline-none transition-all duration-300 focus:border-[#00ffe0] focus:shadow-[0_0_8px_#00ffe0aa] placeholder-gray-300"
                    />
                </div>
                <div className="mb-5 relative">
                    <input 
                        type="password" 
                        name="password" 
                        required 
                        placeholder="Password" 
                        className="w-full p-3 pl-4 rounded-[10px] bg-white/10 border border-white/20 text-white text-sm outline-none transition-all duration-300 focus:border-[#00ffe0] focus:shadow-[0_0_8px_#00ffe0aa] placeholder-gray-300"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full p-3 bg-[#00ffe0] text-black font-semibold rounded-[10px] cursor-pointer transition-all duration-300 hover:bg-[#00c6b5] hover:shadow-[0_0_15px_#00ffe0aa] mb-5"
                >
                    Log In
                </button>
            </form>

            <div className="text-center text-[#aaa] text-sm my-3">or continue with</div>

            <button onClick={() => alert("Google login coming soon.")} className="w-full p-3 bg-white/10 text-white border border-white/20 rounded-[10px] font-medium mt-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_10px_#00ffe0aa]">
                 <img src="https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png" className="w-[18px]" alt="Google" />
                 Continue with Google
            </button>

            <button onClick={() => alert("Apple login coming soon.")} className="w-full p-3 bg-white/10 text-white border border-white/20 rounded-[10px] font-medium mt-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_10px_#00ffe0aa]">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/500px-Apple_logo_black.svg.png?20220821121934" className="w-[18px] invert" alt="Apple" />
                Continue with Apple
            </button>

            <div className="text-center text-xs text-[#888] mt-6">
                Forgot password? | <span onClick={() => navigate('/register')} className="text-[#00ffe0] no-underline cursor-pointer hover:underline ml-1">Sign up</span>
            </div>
        </div>
    </div>
  );
};
