import {Button, Col, Row, Select} from 'antd'
import React, {useEffect, useMemo, useState} from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Divider } from 'antd'
import { useTableList } from '../hooks/useTableList'
import Table from './table'
import {useNavigate} from "react-router-dom";
import './main-table.css'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MainTable = ({ props, isAuthenticated, setIsAuthenticated }) => {
    const [table, setTable] = useState()
    const [row, setRow] = useState()
    const history = useNavigate();
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

    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        setIsAuthenticated(false);
        history('/login')
    };

    useEffect(() => {
        tableUpdate({ name: props.name, mnemokod: localStorage.getItem('as') })
    }, [props.name])

    return (
        <>
            <Row justify="end">
                <Col>
                    <div className="auth-status">
                        {isAuthenticated ? (
                            <span>Залогинен {localStorage.getItem('groups')}</span>
                        ) : (
                            <span>Не залогинен</span>
                        )}
                    </div>
                    <Button onClick={handleLogout}>Log out</Button>
                </Col>
            </Row>
            <Row>
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
