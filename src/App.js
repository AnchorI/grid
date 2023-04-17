import React, { useState } from 'react'
import MainTable from './components/main-table'
import { Routes, Route, Link } from 'react-router-dom'
import { Radio } from 'antd'
import AddModal from './components/modals/add-modal'
import { ButtonAdd } from './components/styled/button-add'

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [mainTables, setMainTables] = useState([
        {
            name: 'servers',
            fullrow: true,
            fields: ['users', 'soft', 'services'],
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
            <ButtonAdd
                onClick={() => {
                    setIsModalOpen(true)
                }}
                type={'primary'}
            >
                Add table
            </ButtonAdd>
            <Radio.Group style={{ marginLeft: 10 }} buttonStyle={'solid'}>
                {mainTables.map((el) => (
                    <Radio.Button>
                        <Link to={el.name} style={{color: 'white'}}>{el.name}</Link>
                    </Radio.Button>
                ))}
            </Radio.Group>

            <Routes>
                {mainTables.map((el) => (
                    <Route path={el.name} element={<MainTable props={el} />} />
                ))}
            </Routes>
        </>
    )
}

export default App
