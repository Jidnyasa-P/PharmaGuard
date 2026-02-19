
import React, { useState } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('dr.smith@pharma-guard.io');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Clinical Pharmacist');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: 'Dr. Sarah Smith',
      role: 'Chief Medical Geneticist',
      email: email
    });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'New User',
      role: role,
      email: email
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const renderView = () => {
    switch (view) {
      case 'signup':
        return (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="Dr. Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Medical Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-white"
              >
                <option>Clinical Pharmacist</option>
                <option>Medical Geneticist</option>
                <option>Oncologist</option>
                <option>Research Scientist</option>
                <option>General Practitioner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="doctor@hospital.org"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Secure Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              Create Clinical Account
            </button>
            <p className="text-center text-sm text-slate-500 pt-2">
              Already have an account? <button type="button" onClick={() => setView('login')} className="text-sky-600 font-bold hover:underline">Sign In</button>
            </p>
          </form>
        );

      case 'forgot':
        return (
          <div className="space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm text-slate-500 text-center mb-4">Enter your institutional email and we'll send you a link to reset your password.</p>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Institutional Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    placeholder="doctor@hospital.org"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <Icons.Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Check your email</h3>
                <p className="text-sm text-slate-500 mt-2">We've sent password reset instructions to <strong>{email}</strong>.</p>
              </div>
            )}
            <button 
              type="button" 
              onClick={() => { setView('login'); setIsSubmitted(false); }}
              className="w-full text-center text-sm text-sky-600 font-bold hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        );

      default:
        return (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Institutional Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="doctor@hospital.org"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Secure Password</label>
                <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-sky-600 hover:underline">Forgot password?</button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              Sign In to Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>

            <p className="text-center text-sm text-slate-500 pt-2">
              New to PharmaGuard? <button type="button" onClick={() => setView('signup')} className="text-sky-600 font-bold hover:underline">Request Access</button>
            </p>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-sky-500/20">
            <Icons.Dna className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">PharmaGuard</h1>
          <p className="text-slate-400">Clinical Pharmacogenomic Decision Support</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 transition-all duration-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          {renderView()}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {view === 'signup' ? 'By joining, you agree to our clinical data processing terms.' : 'Authorized clinical personnel only. Secure connection established.'}
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs">
          &copy; 2024 PharmaGuard AI Systems. HIPAA Compliant Interface.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
