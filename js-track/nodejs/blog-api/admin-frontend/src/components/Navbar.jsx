import { Link } from 'react-router-dom';
import AuthContext from '../contexts/authContext';
import { useContext } from 'react';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <Link id="navbar-brand" to="/">Admin Dashboard</Link>
            <div className="right">
                {
                    user && user.role === 'AUTHOR' && (
                        <Link to="/posts">Posts</Link>
                    )
                }
                {user ? (
                    <>
                        <button onClick={logout} className="btn secondary hover-bg-secondary-90">Logout</button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;