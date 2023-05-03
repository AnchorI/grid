import React, { useState } from 'react';
import MainTable from './components/main-table';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Radio } from 'antd';
import AddModal from './components/modals/add-modal';
import LoginPage from "./LoginPage";

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

    return (
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10 }} buttonStyle={'solid'}>
                {mainTables.map((el) => (
                    <Link key={el.name} to={el.name} style={{color: 'white'}}>
                        { isAuthenticated &&
                            <Radio.Button>{el.name}</Radio.Button>
                        }
                    </Link>
                ))}
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/servers" /> : <Navigate to="/login" />} /> {/* Перенаправление на страницу логина, если пользователь не авторизован */}
                {mainTables.map((el) => (
                    <Route key={el.name} path={el.name} element={isAuthenticated ? <MainTable props={el} /> : <Navigate to="/login" />} />
                    ))}
            </Routes>
        </>
    )
}

export default App;