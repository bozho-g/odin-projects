import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Posts from './components/Posts';
import PrivateRoute from './components/PrivateRoute';
import Error from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';
import FullPost from './components/FullPost';

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts" element={<PrivateRoute><Posts /></PrivateRoute>} />
        <Route path="/posts/:postId" element={<PrivateRoute><FullPost /></PrivateRoute>} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
