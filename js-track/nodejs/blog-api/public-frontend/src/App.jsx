import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Posts from './components/Posts';
import Error from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';
import FullPost from './components/FullPost';

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Posts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login isRegister />} />
        <Route path="/posts/:postId" element={<FullPost />} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
