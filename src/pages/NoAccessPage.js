import React from 'react';
import './NoAccessPage.css'
import {Button, Col, Row} from "antd";
import AuthStatus from "../components/auth-status";

const NoAccessPage = ({ isAuthenticated, setIsAuthenticated }) => {
    return (
        <>
            <Row justify="end">
                <AuthStatus isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
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
