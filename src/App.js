import { Row } from 'antd'
import React, { useState, useEffect } from 'react'
import AddModal from './components/modals/add-modal'
import { ButtonAdd } from './components/styled/button-add'
import TableGrid from './components/table-grid'

const App = () => {
    const [tables, setTables] = useState([
        { name: 'brand', fullrow: true },
        { name: 'brand_json', fullrow: false },
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <AddModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tables={tables}
                setTables={setTables}
            />

            <Row>
                {tables.map(({ name, fullrow }, index) => {
                    return (
                        <>
                            <TableGrid
                                tableName={name}
                                fullrow={fullrow}
                                index={index}
                                tables={tables}
                                setTables={setTables}
                            />
                        </>
                    )
                })}
                <ButtonAdd
                    onClick={() => {
                        setIsModalOpen(true)
                    }}
                    type={'primary'}
                >
                    Add table
                </ButtonAdd>
            </Row>
        </>
    )
}

export default App
