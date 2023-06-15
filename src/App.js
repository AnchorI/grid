import React, { useEffect, useState } from 'react';
import MainTable from './components/main-table';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Radio } from 'antd';
import AddModal from './components/modals/add-modal';
import LoginPage from "./pages/LoginPage";
import RolesPage from "./pages/RolesPage";
import NoAccessPage from "./pages/NoAccessPage";
import SchemaPage from "./pages/SchemaPage";
import config from './config/config.json'

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
        },
        {
            name: 'test',
            fullrow: true,
            fields: ['test'],
            subTables: [],
        }
    ]);

    const [sessionTimeout, setSessionTimeout] = useState(0);

    useEffect(() => {
        const fetchSessionTimeout = async () => {
            try {
                const response = await import('./config/config.json');
                const { sessionTimeout } = response.default;
                setSessionTimeout(sessionTimeout);
            } catch (error) {
                console.error('Error fetching session timeout:', error);
            }
        };
        fetchSessionTimeout(); // Fetch initially

        const intervalId = setInterval(fetchSessionTimeout, 60000); // Fetch every 1 minute

        return () => {
            clearInterval(intervalId); // Clean up the interval when the component unmounts
        };
    }, []);

    const userGroups = localStorage.getItem('groups');

    const canAccessTable = (tableName) => {
        return isAuthenticated && accessResults[tableName] === true;
    };

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
            const arrUserGroup = userGroups.split(",");

            const requestBody = { groups: userGroups, table: tableName };

            try {
                const response = await fetch(`${config.url}/api/slave/check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();
                const hasAccess = result === false ? false : arrUserGroup.some(group => result[group]?.includes(tableName));
                setAccessResults(prevState => ({
                    ...prevState,
                    [tableName]: hasAccess
                }));
            } catch (error) {
                console.error('Error checking access:', error);
            }
        };

        mainTables.forEach((table) => {
            checkAccess(table.name);
        });
    }, []);



    return (
        <>
            <div>
                <h1>Session Timeout: {sessionTimeout} minutes</h1>
                {/* Other components */}
            </div>
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
                {isAuthenticated && (userGroups.includes('App-KMS-PO-BOKSU') || userGroups.includes('App-SSM-P-SecAdm')) &&
                    <Link key='Схемы' to='schema' style={{ color: 'white' }}>
                        <Radio.Button>Схемы</Radio.Button>
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
                <Route path="/schema" element={isAuthenticated && (userGroups.includes('App-KMS-PO-BOKSU') || userGroups.includes('App-SSM-P-SecAdm')) ? <SchemaPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/servers" />} />
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
