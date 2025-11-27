import { useContext } from "react";
import AuthContext from "../contexts/authContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role !== "AUTHOR") {
        return <Navigate to="/error" replace />;
    }

    return children;
}

export default PrivateRoute;