import { useAuth } from '../../context/AuthContext';
import { AuthPage } from '../AuthPage/AuthPage';
import styles from './HomePage.module.css';
import { Navbar } from '../../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';

function HomePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <span className="loader"></span>;
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className={styles.container}>
            <aside>
                <Navbar />
            </aside>
            <div className={styles.mainContent}>
                <Outlet />
            </div>
        </div>
    );
}

export default HomePage;