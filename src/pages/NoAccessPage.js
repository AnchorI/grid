import React from 'react';
import './NoAccessPage.css'
import {Button, Col, Row} from "antd";
import {useNavigate} from "react-router-dom";

const NoAccessPage = ({ isAuthenticated, setIsAuthenticated }) => {
    const history = useNavigate();

    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        setIsAuthenticated(false);
        history('/login')
    };

    return (

        <>
            <Row justify="end">
                <Col>
                    <div className="auth-status">
                        {isAuthenticated ? (
                            <span>Залогинен {localStorage.getItem('groups')}</span>
                        ) : (
                            <span>Не залогинен</span>
                        )}
                    </div>
                    <Button onClick={handleLogout}>Log out</Button>
                </Col>
            </Row>
            <div className="no-access-page">
                <h1>Если вы не видите ярлыков вверху слева, обновите страницу</h1>
                <h2>Если после обновления у вас ничего не появилось, видимо у вас нет доступа ни к одному разделу</h2>
                <p>Обратитесь к администратору для получения доступа.</p>
            </div>
        </>
    );
};

export default NoAccessPage;
