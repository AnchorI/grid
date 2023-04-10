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

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const TableGrid = ({ tableName, fullrow, index, tables, setTables }) => {
    const [table, setTable] = useState({})
    const { tableUpdate } = useTableList({
        onSuccess: (data) => {
            setTable({
                ...table,
                column: Object.keys(data.data[0]).map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        filter: 'agTextColumnFilter',
                    }
                }),
                data: data.data,
                total: data.total,
                page: data.page,
                total_pages: data.total_pages,
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

    useEffect(() => {
        tableUpdate({ page: 1, name: tableName })
    }, [])

    return (
        <>
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
                    style={{marginLeft:'10vh'}}
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
                <AgGridReact rowData={table.data} columnDefs={table.column} />
                <ButtonRow>
                    <Button
                        onClick={() => {
                            setTable({ ...table, page: --table.page })
                            tableUpdate({ page: table.page, name: tableName })
                        }}
                        disabled={table.page < 2}
                        type={'primary'}
                    >
                        Prev page
                    </Button>
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
                            updatedObject[index].fullrow = !updatedObject[index].fullrow
                            setTables(updatedObject)
                        }}
                    />
                    <Button
                        onClick={() => {
                            setTable({ ...table, page: ++table.page })
                            tableUpdate({ page: table.page, name: tableName })
                        }}
                        disabled={table.total_pages === table.page}
                        type={'primary'}
                    >
                        Next page
                    </Button>
                </ButtonRow>
            </div>
        </>
    )
}

export default TableGrid
