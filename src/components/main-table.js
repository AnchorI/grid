import { Col, Row } from 'antd'
import Table from './table'
import React, { useState } from 'react'

const MainTable = (props) => {
    const [mainTable, setMainTable] = useState({...props})

    const colWidth = (length) => {
        if (length <= 4) {
            return 24 / length
        } else {
            return 6
        }
    }

    return (
        <>
            <Row>
                <Col span={24}>
                    <Table props={mainTable} setMainTable={setMainTable} />
                </Col>
            </Row>
            <Row>
                {mainTable.subTables.map((el) => (
                    <Col span={colWidth(mainTable.subTables.length)}>
                        <Table props={el}/>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default MainTable
