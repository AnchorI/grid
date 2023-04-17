import { AgGridReact } from 'ag-grid-react'
import { Divider } from 'antd'
import React, { useEffect, useState } from 'react'

import { useTableList } from '../hooks/useTableList'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const Table = ({ props, update, name }) => {
    const [table, setTable] = useState()
    const { tableUpdate } = useTableList({
        onSuccess: (response) => {
            console.log('res', response)
            setTable({
                ...table,
                pivotMode: true,
                columnDefs: Object.keys(response.data).filter(key => key !== "id").map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        filter: 'agTextColumnFilter',
                    }
                }),
                rowData: [response.data],
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })

    useEffect(() => {
        tableUpdate({ name: props.name, brand_id: props.id })
    }, [update])

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
            <Divider>{props.name}</Divider>
            <AgGridReact
                columnDefs={table?.columnDefs}
                rowData={table?.rowData}
                defaultColDef={{ flex: 2, minWidth: 200 }}
            />
        </div>
    )
}

export default Table
