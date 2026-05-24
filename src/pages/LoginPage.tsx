import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, Github, Chrome, ArrowRight, Sparkles } from 'lucide-react';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithGitHub, signInWithEmail, registerWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'login') {
      await signInWithEmail(email, password);
    } else {
      await registerWithEmail(email, password, name);
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleGitHub = async () => {
    clearError();
    await signInWithGitHub();
  };

  return (
    <div className="min-h-screen bg-[#06070B] flex overflow-hidden">
      {/* ── Left Panel (branding) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative p-12 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] to-[#06070B]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-blue/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Zap className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
            <span className="text-white font-black text-xl tracking-tight">StickyFlow</span>
          </div>
        </div>

        {/* Central hero block */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Your thoughts,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                everywhere.
              </span>
            </h1>
            <p className="mt-4 text-gray-400 text-lg font-medium leading-relaxed">
              Capture ideas, set reminders, and collaborate with your team — all synced instantly to the cloud.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['☁️ Cloud Sync', '🔔 Smart Reminders', '📝 Rich Text', '🖱️ Drag & Drop', '⌨️ Cmd+K'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm font-semibold backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>

          {/* Sticky notes preview */}
          <div className="flex gap-4 mt-4">
            {[
              { color: 'bg-yellow-400', text: 'Design system review', cat: 'Work' },
              { color: 'bg-pink-500', text: 'Buy mechanical keyboard', cat: 'Personal' },
              { color: 'bg-blue-500', text: 'Launch YT channel', cat: 'Ideas' },
            ].map((n, i) => (
              <motion.div
                key={n.text}
                initial={{ opacity: 0, y: 20, rotate: -5 + i * 5 }}
                animate={{ opacity: 1, y: 0, rotate: -5 + i * 5 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
                className={`${n.color} p-3 rounded-2xl shadow-xl w-28 h-28 flex flex-col gap-1 flex-shrink-0`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{n.cat}</span>
                <p className="text-xs font-bold text-black leading-tight">{n.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-gray-600 text-sm font-medium">
          © 2026 StickyFlow. Built with ❤️
        </div>
      </div>

      {/* ── Right Panel (auth form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-[#08090E]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
            <span className="text-white font-black text-xl">StickyFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Welcome back 👋' : 'Join StickyFlow ✨'}
            </h2>
            <p className="mt-2 text-gray-500 font-medium">
              {mode === 'login'
                ? 'Sign in to access your cloud-synced flows.'
                : 'Create your account and start flowing.'}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold"
              >
                ⚠️ {error.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Sign-in Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleGoogle}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={handleGitHub}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm"
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-sm font-bold">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-bold text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 font-medium focus:outline-none focus:border-accent-blue/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 font-medium focus:outline-none focus:border-accent-blue/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-gray-600 font-medium focus:outline-none focus:border-accent-blue/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#FACC15] hover:bg-yellow-300 text-black font-black rounded-xl transition-all duration-200 shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in to StickyFlow' : 'Create my account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <p className="text-center mt-6 text-gray-500 text-sm font-medium">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); }}
              className="text-white font-bold hover:text-yellow-400 transition-colors"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          {/* Skip for now */}
          <p className="text-center mt-3 text-gray-600 text-xs font-medium">
            Want to try first?{' '}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('skip-auth'))}
              className="underline hover:text-gray-400 transition-colors"
            >
              Continue without account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
