import { Link } from "react-router-dom";

export function NotFound() {
    return (
        <div className="not-found">
            <h1>404 Not Found</h1>
            <Link to="/">Go to home page</Link>
        </div>
    );
}