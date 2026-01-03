import { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const [errors, setErrors] = useState([]);

    let navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const username = e.target.username.value.trim();
        const password = e.target.password.value.trim();

        const errorsLocal = [];
        if (username.length < 4) {
            errorsLocal.push("Username must be at least 4 characters long.");
        }

        if (password.length < 6) {
            errorsLocal.push("Password must be at least 6 characters long.");
        }

        setErrors(errorsLocal);
        if (errorsLocal.length > 0) {
            return;
        }

        try {
            await login({ username, password });
            navigate('/');
        } catch (err) {
            let errors = err.message ? err.message.includes(',') ? err.message.split(',') : [err.message] : ['Login failed. Please try again.'];

            setErrors(errors);
        }
    };

    return (
        <div>
            <form className="form" onSubmit={handleLogin}>
                <div className="input-box">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" required minLength={4} />
                </div>

                <div className="input-box">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required minLength={6} />
                </div>

                <button type="submit" className="primary btn">Login</button>
            </form>
            {errors.length > 0 && (
                <div className="error-messages">
                    {errors.map((error, index) => (
                        <p className="error" key={index}>{error}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
