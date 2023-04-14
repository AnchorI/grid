import { Row } from 'antd'
import React, { useState } from 'react'
import MainTable from './components/main-table'

const App = () => {
    const [mainTables, setMainTables] = useState([
        {
            name: 'brand',
            fullrow: true,
            fields: ['testFirst', 'testSecond', 'testThird', 'testFourth'],
            subTables: [],
        },
    ])

    return (
        <>
            {mainTables.map((el, index) => (
                <MainTable {...mainTables[index]}/>
            ))}
        </>
    )
}

export default App
