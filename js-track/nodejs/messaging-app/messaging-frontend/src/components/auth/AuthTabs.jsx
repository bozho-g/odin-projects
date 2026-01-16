import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthTabs() {
    const [tab, setTab] = useState('login');

    return (
        <div className="auth-container">
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
