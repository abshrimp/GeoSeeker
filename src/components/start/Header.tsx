import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, History, LogOut, LogIn, UserPlus, Calendar, HelpCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import './Header.css';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import HowToModal from './HowToModal';
import logo from '../../assets/images/GeoSeeker.png'

interface HeaderProps {
    setIsShowHistory: (isShowHistory: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsShowHistory }) => {
    const { appState, setAppState } = useGame();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showHowToModal, setShowHowToModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const logout = async () => {
        if (window.confirm('ログアウトしますか？')) {
            const res = await apiClient.logout();
            if (res.success) {
                window.location.reload();
            } else {
                alert('ログアウトに失敗しました');
            }
        }
    };

    return (
        <>
            <header className="startscreen-header">
                <div className="startscreen-header-inner">
                    <div className="startscreen-header-row">
                        <div className="startscreen-header-logo">
                            <img src={logo} alt="GeoSeeker Title" className="startscreen-header-logoicon" />
                        </div>
                        <div className="startscreen-header-userarea" ref={menuRef}>
                            <div
                                className="startscreen-user-btn"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="startscreen-user-avatar">
                                    {appState.username.charAt(0)}
                                </div>
                                <span className="startscreen-user-name">{appState.username}</span>
                                <ChevronDown className="startscreen-user-chevron" />
                            </div>
                            {showUserMenu && (
                                <div className="startscreen-user-menu">
                                    {appState.isAuthenticated ? (
                                        <>
                                            <button
                                                className="startscreen-user-menuitem"
                                                onClick={() => {
                                                    navigate('/daily');
                                                }}
                                            >
                                                <Calendar className="startscreen-user-menuicon" />
                                                <span>DAILY</span>
                                            </button>
                                            <button
                                                className="startscreen-user-menuitem"
                                                onClick={() => {
                                                    setShowHowToModal(true);
                                                    setShowUserMenu(false);
                                                }}
                                            >
                                                <HelpCircle className="startscreen-user-menuicon" />
                                                <span>How to</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsShowHistory(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className="startscreen-user-menuitem"
                                            >
                                                <History className="startscreen-user-menuicon" />
                                                <span>History</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                }}
                                                className="startscreen-user-menuitem startscreen-user-menuitem-logout"
                                            >
                                                <LogOut className="startscreen-user-menuicon" />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="startscreen-user-menuitem startscreen-user-menuitem-daily"
                                                onClick={() => {
                                                    navigate('/daily');
                                                }}
                                            >
                                                <Calendar className="startscreen-user-menuicon" />
                                                <span>DAILY</span>
                                            </button>
                                            <button
                                                className="startscreen-user-menuitem startscreen-user-menuitem-how-to"
                                                onClick={() => {
                                                    setShowHowToModal(true);
                                                    setShowUserMenu(false);
                                                }}
                                            >
                                                <HelpCircle className="startscreen-user-menuicon" />
                                                <span>How to</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAppState({
                                                        isShowLoginScreen: true,
                                                        isShowLogin: false
                                                    });
                                                }}
                                                className="startscreen-user-menuitem startscreen-user-menuitem-signup"
                                            >
                                                <UserPlus className="startscreen-user-menuicon" />
                                                <span>Signup</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAppState({
                                                        isShowLoginScreen: true,
                                                        isShowLogin: true
                                                    });
                                                }}
                                                className="startscreen-user-menuitem startscreen-user-menuitem-login"
                                            >
                                                <LogIn className="startscreen-user-menuicon" />
                                                <span>Login</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <HowToModal
                isOpen={showHowToModal}
                onClose={() => setShowHowToModal(false)}
            />
        </>
    );
};

export default Header;