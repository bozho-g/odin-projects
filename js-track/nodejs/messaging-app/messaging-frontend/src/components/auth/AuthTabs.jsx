import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthTabs() {
    const [tab, setTab] = useState('login');
    const [showWakeBanner, setShowWakeBanner] = useState(() => {
        return localStorage.getItem('railwayWakeBannerDismissed') !== '1';
    });

    const dismissBanner = () => {
        localStorage.setItem('railwayWakeBannerDismissed', '1');
        setShowWakeBanner(false);
    };

    return (
        <div className="auth-container">
            {showWakeBanner && (
                <div className="wake-banner">
                    <div className="wake-banner-inner">
                        <strong>Note:</strong> The API is hosted on Railway - the first request after inactivity may take 30s-1min while the service wakes up.
                    </div>
                    <button className="wake-banner-dismiss" onClick={dismissBanner}>
                        <svg width="24px" height="24px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 21.32L21 3.32001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 3.32001L21 21.32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </button>
                </div>
            )}
            <div className="auth-hero">
                <h1>Welcome to Messaging App</h1>
                <p>Jump back into your conversations or create an account to get started.</p>
            </div>

            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={tab === 'login' ? 'active' : ''}
                        onClick={() => setTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={tab === 'register' ? 'active' : ''}
                        onClick={() => setTab('register')}
                    >
                        Register
                    </button>
                </div>

                <div className="auth-body">
                    {tab === 'login' ? <Login /> : <Register />}
                </div>
            </div>
        </div>
    );
}
