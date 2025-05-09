import React, { useState, useEffect } from 'react';
import { User, Lock, LogIn, UserPlus, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { apiClient } from "../api/client.ts";
import Button from '../components/ui/Button';
import './LoginScreen.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/GeoSeeker.png'
import { Turnstile } from '@marsidev/react-turnstile'

const LoginScreen: React.FC = () => {
    const { appState, setAppState } = useGame();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        setTurnstileToken(null);
    }, [appState.isShowLogin]);

    const login = async (username: string, password: string) => {
        const response = await apiClient.login(username, password);
        return response.success;
    };
    const register = async (username: string, password: string) => {
        const response = await apiClient.register(username, password);
        return response.success;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let success;
            if (appState.isShowLogin) {
                success = await login(username, password);
                if (!success) {
                    setError('Invalid username or password');
                } else {
                    window.location.reload();
                }
            } else {
                // if (username.length < 3) {
                //     setError('Username must be at least 3 characters');
                //     setIsLoading(false);
                //     return;
                // }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsLoading(false);
                    return;
                }
                if (!turnstileToken) {
                    setError('Please complete the verification');
                    setIsLoading(false);
                    return;
                }
                success = await register(username, password);
                if (!success) {
                    setError('Username already exists');
                } else {
                    alert("登録が完了しました");
                    setError("");
                    setAppState({ isShowLogin: !appState.isShowLogin });
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="loginscreen-root">
            <div className="loginscreen-card">
                <div className="loginscreen-card-inner">
                    <div className="loginscreen-icon-row">
                        <div className="loginscreen-icon-bg">
                            <img src={logo} alt="GeoSeeker Title" className="loginscreen-icon" />
                        </div>
                    </div>
                    <h2 className="loginscreen-title">
                        {appState.isShowLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="loginscreen-subtitle">
                        {appState.isShowLogin ? 'Log in to continue your adventure' : 'Join GeoSeeker'}
                    </p>
                    <form onSubmit={handleSubmit} className="loginscreen-form">
                        <div>
                            <div className="loginscreen-input-wrapper">
                                <div className="loginscreen-input-icon">
                                    <User className="loginscreen-input-svg" />
                                </div>
                                <input
                                    type="text"
                                    className="loginscreen-input"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <div className="loginscreen-input-wrapper">
                                <div className="loginscreen-input-icon">
                                    <Lock className="loginscreen-input-svg" />
                                </div>
                                <input
                                    type="password"
                                    className="loginscreen-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {!appState.isShowLogin && (
                            <div className="loginscreen-turnstile">
                                <Turnstile
                                    siteKey="0x4AAAAAABboyYAL0-tkKG6v"
                                    onSuccess={setTurnstileToken}
                                    onError={() => setTurnstileToken(null)}
                                    options={{
                                        size: 'normal',
                                        theme: 'light',
                                        language: 'ja',
                                        refreshExpired: 'auto',
                                        appearance: 'always'
                                    }}
                                />
                            </div>
                        )}
                        {error && (
                            <div className="loginscreen-error">{error}</div>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={!appState.isShowLogin && !turnstileToken}
                            leftIcon={appState.isShowLogin ? <LogIn className="loginscreen-btn-icon" /> : <UserPlus className="loginscreen-btn-icon" />}
                        >
                            {appState.isShowLogin ? 'Log In' : 'Create Account'}
                        </Button>
                    </form>
                    <div className="loginscreen-switch-row">
                        <button
                            type="button"
                            className="loginscreen-switch-btn"
                            onClick={() => {setError(""); setAppState({ isShowLogin: !appState.isShowLogin })}}
                        >
                            {appState.isShowLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                        </button>
                        <button
                            type="button"
                            className="loginscreen-switch-btn"
                            onClick={() => setAppState({ isShowLoginScreen: false })}
                        >
                            <X />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;