import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.login(username, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-glass relative overflow-hidden"
        >
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white font-display tracking-tight">Welcome Back</h2>
                    <p className="text-zinc-400 text-sm mt-2">Enter your credentials to access the portal.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 ml-1 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                            placeholder="admin"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 ml-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-6 flex flex-col items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </motion.button>

                        <div className="text-sm text-zinc-500 flex gap-4">
                            <button type="button" className="hover:text-zinc-300 transition-colors">Forgot Password?</button>
                            <span className="text-zinc-700">|</span>
                            <Link to="/auth/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create Account</Link>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};
