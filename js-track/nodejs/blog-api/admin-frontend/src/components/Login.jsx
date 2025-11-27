import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import { useContext, useState } from "react";

function Login() {
    const { login } = useContext(AuthContext);
    const [error, setError] = useState(null);

    let navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            await login(username, password);
            navigate("/posts");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card">
            <form className="form" action="" onSubmit={handleLogin}>
                <h2>Login</h2>
                <p>This is the author login page.</p>
                <div className="input-box">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>

                <div className="input-box">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>

                <button type="submit" className="btn primary hover-bg-primary-90">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Login;