import { Row } from 'antd'
import React, { useState, useEffect } from 'react'
import AddModal from './components/modals/add-modal'
import { ButtonAdd } from './components/styled/button-add'
import TableGrid from './components/table-grid'

const App = () => {
    const [tables, setTables] = useState([
        { name: 'users', fullrow: true },
        { name: 'cars', fullrow: false },
        { name: 'customers', fullrow: false },
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
                            {/* {fullrow === false && (
                                <ButtonAdd
                                    onClick={() => {
                                        setIsModalOpen(true)
                                    }}
                                    type={'primary'}
                                >
                                    Add table
                                </ButtonAdd>
                            )} */}
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
