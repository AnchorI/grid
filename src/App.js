import React, {useEffect, useState} from 'react';
import MainTable from './components/main-table';
import {Routes, Route, Link, Navigate, useNavigate} from 'react-router-dom';
import { Radio } from 'antd';
import AddModal from './components/modals/add-modal';
import LoginPage from "./pages/LoginPage";
import RolesPage from "./pages/RolesPage";

const App = () => {
    const history = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logoutTimer, setLogoutTimer] = useState(3600000);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [mainTables, setMainTables] = useState([
        {
            name: 'servers',
            fullrow: true,
            fields: ['test'],
            subTables: [],
        },
        {
            name: 'users',
            fullrow: true,
            fields: ['users'],
            subTables: [],
        }
    ]);

    const userGroups = localStorage.getItem('groups');

    async function hasAccess(userGroups, tableName) {
        if (!userGroups) return false;

        const requestBody = { group: userGroups, table: tableName };
        console.log('reqBody', requestBody)
        const response = await fetch('http://localhost:8777/api/slave/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        console.log('result', result)
        return result; // Возвращает true или false в зависимости от результата
    }

    useEffect(() => {
        const logoutTimerr = setTimeout(() => {
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('groups');
            history('/login')
        }, logoutTimer);

        return () => clearTimeout(logoutTimerr);
    }, [isAuthenticated, logoutTimer]);
    return (
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10, marginTop: 10 }} buttonStyle={'solid'}>
                { isAuthenticated && ( userGroups.includes('App-KSM-P-Admin') || userGroups.includes('App-SSM-P-SecAdm') ) &&
                    <Link key='Админ панель' to='admin' style={{color: 'white'}}>
                        <Radio.Button>Админ панель</Radio.Button>
                    </Link>
                }
                {mainTables.map((el) => {
                    const canAccess = isAuthenticated && hasAccess(userGroups, el.name);
                    return canAccess && (
                        <Link key={el.name} to={el.name} style={{color: 'white'}}>
                            <Radio.Button>{el.name}</Radio.Button>
                        </Link>
                    );
                })}
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/admin" element={isAuthenticated ? hasAccess(userGroups) && <RolesPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" /> }/>
                <Route path="/" element={isAuthenticated ? <Navigate to="/servers" /> : <Navigate to="/login" />} /> {/* Перенаправление на страницу логина, если пользователь не авторизован */}
                {mainTables.map((el) => (
                    hasAccess(userGroups, el.name) && (
                        <Route key={el.name} path={el.name} element={isAuthenticated ? <MainTable props={el} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
                    )
                ))}
            </Routes>
        </>
    )
}

export default App;