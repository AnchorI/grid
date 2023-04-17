import {Col, Row, Select} from 'antd'
import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Divider } from 'antd'
import { useTableList } from '../hooks/useTableList'
import Table from './table'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MainTable = ({ props }) => {
    const [table, setTable] = useState()
    const [row, setRow] = useState()
    const [filter, setFilter] = useState({
        as_mnemokod: null,
    });
    const { Option } = Select;

    const { tableUpdate } = useTableList({
        onSuccess: (response) => {
            setTable({
                ...table,
                name: props.name,
                columnDefs: Object.keys(response.data[0]).filter(key => key !== "id").map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        rowGroupIndex: el === 'server_os' ? 0 : '',
                        filter: 'agTextColumnFilter',
                    }
                }),
                rowData: response.data,
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const handleRowClicked = (event) => {
        if (!props.fields) return
        const updatedTables = props.fields.map((table) => {
            return {
                name: table,
                id: event.data.id,
            }
        })
        setRow(updatedTables)
        setTable({ ...table, subTables: updatedTables })
    }

    const colWidth = (length) => {
        if (length <= 4) {
            return 24 / length
        } else {
            return 6
        }
    }

    useEffect(() => {
        tableUpdate({ name: props.name, mnemokod: filter.as_mnemokod })
    }, [props.name, filter.as_mnemokod])

    return (
        <>
            <Row>
                <Col>
                    <div>AS Mnemokod:</div>
                    <Select
                        style={{ width: 200 }}
                        value={filter.as_mnemokod === null ? '' : filter.as_mnemokod}
                        showSearch
                        onChange={(value) => {
                            setFilter({ ...filter, as_mnemokod: value });
                        }}
                    >
                        <Option value={''}>Все</Option>
                        <Option value={"PLC"}>PLC</Option>
                        <Option value={"PLD"}>PLD</Option>
                        <Option value={"STD"}>STD</Option>

                    </Select>
                </Col>
                <Col span={24}>
                    <div
                        className="ag-theme-alpine"
                        style={{
                            height: 350,
                            marginLeft: 10,
                            marginRight: 10,
                            marginBottom: 100,
                        }}
                    >
                        <Divider>{table?.name}</Divider>
                        <AgGridReact
                            columnDefs={table?.columnDefs}
                            rowData={table?.rowData}
                            defaultColDef={{ flex: 2, minWidth: 200 }}
                            rowSelection="single"
                            suppressRowClickSelection={true}
                            onRowClicked={handleRowClicked}
                            sideBar={'columns'}
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                {table?.subTables?.map((el) => (
                    <Col span={colWidth(table.subTables.length)}>
                        <Table props={el} update={row} name={table.name} />
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default MainTable
