import React, {useEffect, useState} from 'react';
import MainTable from './components/main-table';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Radio } from 'antd';
import AddModal from './components/modals/add-modal';
import LoginPage from "./pages/LoginPage";
import RolesPage from "./pages/RolesPage";

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    function hasAccess(userGroups, tableName) {
        // Проверяем, может ли пользователь получить доступ к данной таблице
        if (userGroups.includes('App-KSM-P-Admin') || userGroups.includes('App-SSM-P-SecAdm')) {
            // Администраторы имеют доступ ко всем таблицам
            return true;
        } else if (userGroups.includes('App-SSM-P-OMN-Viewers') && tableName === 'servers') {
            // App-SSM-P-OMN-Viewers имеют доступ только к таблице "servers"
            return true;
        } else if (userGroups.includes('App-SSM-P-Admins') && tableName === 'users') {
            // App-SSM-P-Admins имеют доступ только к таблице "users"
            return true;
        } else {
            return false;
        }
    }
    return (
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10 }} buttonStyle={'solid'}>
                {mainTables.map((el) => {
                    const canAccess = isAuthenticated && hasAccess(userGroups, el.name);

                    return canAccess && (
                        <Link key={el.name} to={el.name} style={{color: 'white'}}>
                            <Radio.Button>{el.name}</Radio.Button>
                        </Link>
                    );
                })}
                { isAuthenticated && ( userGroups.includes('App-KSM-P-Admin') || userGroups.includes('App-SSM-P-SecAdm') ) &&
                    <Link key='Админ панель' to='admin' style={{color: 'white'}}>
                        <Radio.Button>Админ панель</Radio.Button>
                    </Link>
                }
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/admin" element={isAuthenticated ? hasAccess(userGroups) && <RolesPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/login" /> }/>
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