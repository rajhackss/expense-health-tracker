import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, Chrome, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const { login, signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSignUp && password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            if (isSignUp) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
            }
            navigate('/');
        } catch (err) {
            setError(isSignUp ? 'Failed to create an account.' : 'Failed to sign in.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await login();
            navigate('/');
        } catch (err) {
            setError('Google sign-in failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20 transform hover:scale-110 transition-transform duration-300">
                            {isSignUp ? <UserPlus className="text-white w-10 h-10" /> : <LogIn className="text-white w-10 h-10" />}
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {isSignUp ? 'Join LifeSync to start tracking' : 'Sign in to sync your life'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-700 rounded-2xl outline-none transition-all duration-300 text-gray-900 dark:text-white font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-700 rounded-2xl outline-none transition-all duration-300 text-gray-900 dark:text-white font-medium"
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="space-y-1 animate-fadeIn">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-700 rounded-2xl outline-none transition-all duration-300 text-gray-900 dark:text-white font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <span className="relative px-4 bg-white dark:bg-gray-800 text-gray-400 text-sm font-bold uppercase tracking-widest">or</span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 group disabled:opacity-50 uppercase text-xs font-bold tracking-widest text-gray-600 dark:text-gray-300"
                    >
                        <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                        <span>Continue with Google</span>
                    </button>

                    <p className="mt-10 text-center text-gray-500 dark:text-gray-400 font-medium">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-primary-600 hover:text-primary-500 font-bold hover:underline transition-all"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
