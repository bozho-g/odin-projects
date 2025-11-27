import { Link } from 'react-router-dom';
import AuthContext from '../contexts/authContext';
import { useContext } from 'react';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <Link id="navbar-brand" to="/">Frosty Blog</Link>
            <div className="right">

                {user ? (
                    <>
                        <button onClick={logout} className="btn secondary hover-bg-secondary-90">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;