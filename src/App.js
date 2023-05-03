import React, { useState } from 'react'
import MainTable from './components/main-table'
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Radio } from 'antd'
import AddModal from './components/modals/add-modal'
import LoginPage from "./LoginPage";
import { AuthProvider } from './AuthContext';
import { PrivateRoute } from './PrivateRoute';

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
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
    ])

    return (
        <AuthProvider>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10 }} buttonStyle={'solid'}>
                {mainTables.map((el) => (
                    <Link key={el.name} to={el.name} style={{color: 'white'}}>
                        <Radio.Button>{el.name}</Radio.Button>
                    </Link>
                ))}
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated />} />
                <Route path="/" element={<Navigate to="/login" />} />
                {mainTables.map((el) => (
                    <Route key={el.name} path={el.name} element={<PrivateRoute props={el} />} />
                ))}
            </Routes>

        </AuthProvider>
    )
}

export default App