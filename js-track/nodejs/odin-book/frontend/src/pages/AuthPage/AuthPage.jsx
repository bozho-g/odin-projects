import logo from '/src/assets/odin_logo.png';
import styles from './AuthPage.module.css';
import { Button } from '../../components/Elements/Button/Button';
import { useState } from 'react';
import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useAuth } from '../../context/AuthContext';

export function AuthPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSignIn, setIsSignIn] = useState(true);
    const { login } = useAuth();

    return (
        <div className={styles.authPage}>
            <div className={`${styles.flexChild} ${styles.logoContainer}`}>
                <img className={styles.logo} src={logo} alt="odin logo" />
            </div>
            <div className={`${styles.flexChild} ${styles.infoContainer}`}>
                <h1>Welcome to Odin Book</h1>
                <h2>Join today.</h2>

                <div className={styles.buttonGroup}>
                    <Button onClick={() => { setIsSignIn(true); setIsAuthModalOpen(true); }}>Sign In</Button>
                    <Button onClick={() => { setIsSignIn(false); setIsAuthModalOpen(true); }}>Register</Button>
                    <Button variant='outline' onClick={() => login({ username: "guest", password: "123456" })}>Continue as guest</Button>
                </div>
            </div>
            <AuthModal isSignIn={isSignIn} isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>);
}