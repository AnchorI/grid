import React, { useEffect, useState } from 'react';
import MainTable from './components/main-table';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Radio } from 'antd';
import AddModal from './components/modals/add-modal';
import LoginPage from "./pages/LoginPage";
import RolesPage from "./pages/RolesPage";
import NoAccessPage from "./pages/NoAccessPage";

const App = () => {
    const history = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logoutTimer, setLogoutTimer] = useState(3600000);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [accessResults, setAccessResults] = useState({}); // Состояние для хранения результатов проверки доступа
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

    const canAccessTable = (tableName) => {
        return isAuthenticated && accessResults[tableName] === true;
    };
    console.log(';canAccessTable(el.name)', canAccessTable('servers'))
    console.log('isAuthenticated', isAuthenticated)
    console.log('userGroups', userGroups)

    useEffect(() => {
        const logoutTimerr = setTimeout(() => {
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('groups');
            history('/login')
        }, logoutTimer);

        return () => clearTimeout(logoutTimerr);
    }, [isAuthenticated, logoutTimer]);

    useEffect(() => {
        const checkAccess = async (tableName) => {
            if (!userGroups) return false;

            const requestBody = { groups: userGroups, table: tableName };

            try {
                const response = await fetch('http://localhost:8777/api/slave/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();
                console.log('result', result)
                const hasAccess = result === false ? false : result[`${userGroups}`].includes(tableName);

                setAccessResults(prevState => ({
                    ...prevState,
                    [tableName]: hasAccess
                }));
                console.log('accessResults', accessResults)
            } catch (error) {
                console.error('Error checking access:', error);
            }
        };

        mainTables.forEach((table) => {
            checkAccess(table.name);
        });
    }, []);
    console.log('userGroups', userGroups)
    console.log('isAuthenticated', isAuthenticated)
    return (
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10, marginTop: 10 }} buttonStyle={'solid'}>
                {isAuthenticated && (userGroups.includes('App-KMS-PO-BOKSU') || userGroups.includes('App-SSM-P-SecAdm')) &&
                    <Link key='Админ панель' to='admin' style={{ color: 'white' }}>
                        <Radio.Button>Админ панель</Radio.Button>
                    </Link>
                }
                {mainTables.map((el) => {
                    const canAccess = canAccessTable(el.name);
                    return canAccess && (
                        <Link key={el.name} to={el.name} style={{ color: 'white' }}>
                            <Radio.Button>{el.name}</Radio.Button>
                        </Link>
                    );
                })}
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/no_access" element={isAuthenticated ? <NoAccessPage isAuthenticated = {isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to='/login' />} />
                <Route path="/admin" element={isAuthenticated && (userGroups.includes('App-KMS-PO-BOKSU') || userGroups.includes('App-SSM-P-SecAdm')) ? <RolesPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/servers" />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/no_access" /> : <Navigate to="/login" />} />
                {mainTables.map((el) => (
                    (
                        <Route
                            key={el.name}
                            path={el.name}
                            element={isAuthenticated && canAccessTable(el.name) ? (
                                <MainTable
                                    props={el}
                                    isAuthenticated={isAuthenticated}
                                    setIsAuthenticated={setIsAuthenticated}
                                />
                            ) : (
                                <Navigate to="/no_access" />
                            )}
                        />
                    )
                ))}
            </Routes>
        </>
    )
}

export default App;
