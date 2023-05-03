import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated }) => { // Добавлено новое свойство setIsAuthenticated
    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:8777/api/slave/auth?username=${username}&password=${password}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const { data } = await response.json();
        if (data) {
            localStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            history('/servers');
        } else {
            alert('Invalid credentials');
        }

    };

    return (
        <form onSubmit={handleLogin} className="login-form">
            <label className="login-label">
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="login-input" />
            </label>
            <label className="login-label">
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" />
            </label>
            <button type="submit" className="login-button">Login</button>
        </form>
    );
};

export default LoginPage;