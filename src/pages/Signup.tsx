import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, User, UserPlus } from 'lucide-react';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#0B0F17]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#131924] p-8 md:p-12 rounded-[40px] shadow-2xl border border-gray-800"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#CCFF00] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-black text-3xl">N</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">CRIAR CONTA NEXUS</h1>
          <p className="text-gray-400 font-medium mt-2">Junte-se à maior comunidade de mantos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-950/30 text-red-400 text-sm font-bold rounded-xl border border-red-900/50">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0B0F17] border border-gray-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0B0F17] border border-gray-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0B0F17] border border-gray-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10"
          >
            Cadastrar <UserPlus size={20} />
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#131924] px-4 text-gray-500 font-bold tracking-widest">Ou continue com</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full py-4 bg-[#0B0F17] border border-gray-800 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 font-bold text-gray-300 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm font-medium mb-4">Já tem uma conta?</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs hover:text-[#CCFF00] transition-colors"
          >
            Entrar na Nexus <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
