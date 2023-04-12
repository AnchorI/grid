import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { useTableList } from '../hooks/useTableList'
import { Button, Divider } from 'antd'
import { ButtonRow } from './styled/button-row'
import {
    FullscreenExitOutlined,
    FullscreenOutlined,
    DeleteOutlined,
} from '@ant-design/icons'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const TableGrid = ({ tableName, fullrow, index, tables, setTables, id }) => {
    const [table, setTable] = useState({})
    const [selectedRow, setSelectedRow] = useState(null);
    const { tableUpdate } = useTableList({
        onSuccess: (data) => {
            setTable({
                ...table,
                column: Object.keys(id ? data.data : data.data[0]).map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        filter: 'agTextColumnFilter',
                    }
                }),
                defaultColDef: {
                    flex: 2,
                },
                data: id ? [data.data] : data.data,
            })
        },
        onError: (error) => {
            setTable({
                column: [],
                data: [],
            })
            console.log(error)
        },
    })

    function handleRowClicked(event) {
        const tableIndex = tables.findIndex((table) => table.name === "user");
        if (tableIndex !== -1) {
            const updatedTable = Object.assign({}, tables[tableIndex], {
                fullrow: false,
                id: event.data.id,
            });
            const updatedTables = tables.slice();
            updatedTables.splice(tableIndex, 1, updatedTable);
            setTables(updatedTables);
        } else {
            setTables([
                ...tables,
                { name: "user", fullrow: false, id: event.data.id },
            ]);
        }
        setSelectedRow(event.data);
    }

    useEffect(() => {
        tableUpdate({ name: tableName, brand_id: id })
    }, [])

    return (
            <div
                className="ag-theme-alpine"
                style={{
                    height: 400,
                    width: fullrow ? '98%' : '48%',
                    marginLeft: '1%',
                    marginRight: '1%',
                    marginBottom: 100,
                }}
            >
                <Divider>
                    {tableName}
                    <Button
                        style={{ marginLeft: '10vh' }}
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            const arr = [...tables]
                            arr.splice(index, 1)
                            setTables(arr)
                        }}
                        type={'primary'}
                        danger
                    />
                </Divider>
                <AgGridReact
                    defaultColDef={table.defaultColDef}
                    rowData={table.data}
                    columnDefs={table.column}
                    onRowClicked={handleRowClicked}
                    rowSelection='single'
                    suppressRowClickSelection={true}
                    getRowClass={(params) => {
                        return selectedRow && selectedRow.id === params.data.id ? 'selected' : '';
                    }}
                />
                <ButtonRow>
                    <Button
                        icon={
                            fullrow ? (
                                <FullscreenExitOutlined />
                            ) : (
                                <FullscreenOutlined />
                            )
                        }
                        onClick={() => {
                            const updatedObject = [...tables]
                            updatedObject[index].fullrow =
                                !updatedObject[index].fullrow
                            setTables(updatedObject)
                        }}
                    />
                </ButtonRow>
            </div>
    )
}

export default TableGrid
