import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated }) => {
    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const requestBody = {
            username: username,
            password: password
        };

        const response = await fetch('http://localhost:8777/api/slave/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        const { data } = await response.json();

        if (data) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('groups', data.group.toString())
            localStorage.setItem('username', requestBody.username)
            localStorage.setItem('as', data.as.toString())
            setIsAuthenticated(true);
            history('/');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <>
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
        </>
    );
};

export default LoginPage;