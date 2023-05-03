import React, { useState } from 'react'
import MainTable from './components/main-table'
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Radio } from 'antd'
import AddModal from './components/modals/add-modal'
import LoginPage from "./LoginPage";

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
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={mainTables}
                setTables={setMainTables}
            />
            <Radio.Group style={{ marginLeft: 10 }} buttonStyle={'solid'}>
                {mainTables.map((el) => (
                    <Radio.Button>
                        <Link to={el.name} style={{color: 'white'}}>{el.name}</Link>
                    </Radio.Button>
                ))}
            </Radio.Group>

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" />} />
                {mainTables.map((el) => (
                    <Route path={el.name} element={<MainTable props={el} />} />
                ))}
            </Routes>
        </>
    )
}

export default App
