import React from 'react';
import {Button, Col} from 'antd'
import {useNavigate} from "react-router-dom";

const AuthStatus = ({ setIsAuthenticated, isAuthenticated }) => {
    const history = useNavigate();

    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        setIsAuthenticated(false);
        history('/login')
    };

    return (
        <Col>
            <div className="auth-status">
                {isAuthenticated ? (
                    <span>Залогинен {localStorage.getItem('username')}</span>
                ) : (
                    <span>Не залогинен</span>
                )}
            </div>
            <Button onClick={handleLogout}>Log out</Button>
        </Col>
    );
};

export default AuthStatus;
