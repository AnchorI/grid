import React, { useState } from 'react'
import MainTable from './components/main-table'
import { Routes, Route, Link } from 'react-router-dom'
import { Radio } from 'antd'

const App = () => {
    const [mainTables, setMainTables] = useState([
        {
            name: 'brand',
            fullrow: true,
            fields: ['testFirst', 'testSecond', 'testThird', 'users'],
            subTables: [],
        },
        {
            name: 'small_test',
            fullrow: true,
            fields: ['users', 'b', 'c'],
            subTables: [],
        },
        {
            name: 'big_test',
            fullrow: true,
            fields: ['users', 'two'],
            subTables: [],
        },
        {
            name: 'users',
            fullrow: true,
            fields: ['users', 'testSecond', 'testThird', 'testFourth'],
            subTables: [],
        },
    ])

    return (
        <>
            <Radio.Group>
                {mainTables.map((el) => (
                    <Radio.Button>
                        <Link to={el.name}>{el.name}</Link>
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
