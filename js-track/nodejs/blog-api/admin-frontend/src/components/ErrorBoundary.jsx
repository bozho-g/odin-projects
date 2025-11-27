import { Component } from "react";
import Error from "./Error";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return Error({
                children: <>
                    <h2>Something went wrong.</h2>
                    <p>Please try again later.</p>
                    <p>Go back  <Link to="/" >home</Link></p>
                </>
            });
        }
        return this.props.children;
    }
}

export default ErrorBoundary;