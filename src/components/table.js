import { AgGridReact } from 'ag-grid-react'
import { Divider } from 'antd'
import React, { useEffect, useState } from 'react'
import { useTableList } from '../hooks/useTableList'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const Table = ({ props, setMainTable}) => {
    const [isMain] = useState(!!props.subTables)
    const [table, setTable] = useState(props)
    const { tableUpdate } = useTableList({
        onSuccess: (response) => {
            setTable({
                ...table,
                columnDefs: Object.keys(isMain ? response.data[0] : response.data).map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        filter: 'agTextColumnFilter',
                    }
                }),
                rowData: isMain ? response.data : [response.data],
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const handleRowClicked = (event) => {
        if (isMain) {
            //Основная таблица
            const updatedTables = props.fields.map((table) => {
                return {
                    name: table,
                    id: event.data.id,
                }
            })
            setMainTable({ ...props, subTables: updatedTables })
        }
    }

    useEffect(() => {
        tableUpdate({ name: table.name, brand_id: table.id })
    }, [])

    return (
        <div
            className="ag-theme-alpine"
            style={{
                height: 350,
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 100,
            }}
        >
            <Divider>{table.name}</Divider>
            <AgGridReact
                columnDefs={table.columnDefs}
                rowData={table.rowData}
                defaultColDef={{ flex: 2, minWidth: 200 }}
                onRowClicked={handleRowClicked}
                rowSelection="single"
                suppressRowClickSelection={true}
            />
        </div>
    )
}

export default Table
