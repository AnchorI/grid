import {Col, Row, Select} from 'antd'
import React, {useEffect, useMemo, useState} from 'react'
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
    const statusBar = useMemo(() => {
        return {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agTotalRowCountComponent', align: 'center' },
                { statusPanel: 'agFilteredRowCountComponent' },
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' },
            ],
        };
    }, []);

    const [filter, setFilter] = useState({
        as_mnemokod: null,
    });

    const { Option } = Select;

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            enableValue: true,
            enableRowGroup: true,
            enablePivot: true,
            sortable: true,
            filter: true,
        };
    }, []);

    const { tableUpdate } = useTableList({
        onSuccess: (response) => {
            setTable({
                ...table,
                name: props.name,
                columnDefs: Object.keys(response.data[0]).filter(key => key !== "id").map((el) => {
                    return {
                        field: el,
                        autoComplete: true,
                        rowDarag: true,
                        rowGroupIndex: el === 'email' ? 0 : '',
                        filter: 'agTextColumnFilter',
                        enableValue: true,
                        sortable: true
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
        console.log('event', event.data)
        const updatedTables = props.fields.map((table) => {
            return {
                name: table,
                id: event.data ? event.data.id : null,
                mnemokod: ''
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
        console.log('props', props)
    }, [props.name, filter.as_mnemokod])

    return (
        <>
            <Row>
                <Col>
                    <br></br>
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
                            height: 400,
                            marginLeft: 10,
                            marginRight: 10,
                            marginBottom: 100,
                        }}
                    >
                        <Divider>{table?.name}</Divider>
                        <AgGridReact
                            columnDefs={table?.columnDefs}
                            rowData={table?.rowData}
                            defaultColDef={defaultColDef}
                            rowSelection="single"
                            suppressRowClickSelection={true}
                            onRowClicked={handleRowClicked}
                            sideBar={true}
                            statusBar={statusBar}

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
