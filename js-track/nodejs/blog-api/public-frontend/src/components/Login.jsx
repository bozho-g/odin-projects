import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import { useContext, useState } from "react";

function Login({ isRegister }) {
    const { login, register } = useContext(AuthContext);
    const [error, setError] = useState(null);

    let navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password.length <= 5) {
            setError("Password must be longer than 5 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(username, password, confirmPassword);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card">
            <form className="form" action="" onSubmit={isRegister ? handleRegister : handleLogin}>
                <h2>{isRegister ? "Register" : "Login"}</h2>
                <div className="input-box">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>

                <div className="input-box">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>

                {isRegister && (
                    <div className="input-box">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required />
                    </div>
                )}

                <button type="submit" className="btn primary hover-bg-primary-90">{isRegister ? "Register" : "Login"}</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Login;