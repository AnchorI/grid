import { AgGridReact } from 'ag-grid-react'
import {Button, Col, Divider, Row} from 'antd'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import { useRolesList } from '../hooks/useRolesList'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import AuthStatus from "../components/auth-status";

const RolesPage = ({isAuthenticated, setIsAuthenticated, }) => {
    const [table, setTable] = useState()
    const gridRef = useRef(null);

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
    const { getRoles } = useRolesList({
        onSuccess: (response) => {
            setTable({
                ...table,
                pivotMode: true,
                columnDefs: Object.keys(response.data[0]).map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        hide: el === 'id',
                        filter: 'agTextColumnFilter',
                        sortable: true,
                        floatingFilter: true,
                        editable: el !== 'id',
                        onCellValueChanged: handleCellValueChanged
                    }
                }),
                rowData: response.data,
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const changedData = [];

    function handleCellValueChanged(event) {
        const { data, colDef, newValue, oldValue } = event;
        const { field } = colDef;
        data[field] = newValue;

        const existingDataIndex = changedData.findIndex(item => item.id === data.id);
        if (existingDataIndex !== -1) {
            changedData[existingDataIndex][field] = newValue;
        } else {
            changedData.push({ id: data.id, [field]: newValue });
        }

        const { id } = data;
        const changedItem = changedData.find(item => item.id === id);
        console.log('changedItem', changedItem)
        const fieldToUpdate = Object.keys(changedItem)[1];
        const changedValue = Object.values(changedItem)[1];
        const updateUrl = `http://localhost:8777/api/slave/querry?table=portal_roles&pole=${fieldToUpdate}&changedValue=${changedValue}&oldValue=${oldValue}&username=${localStorage.getItem('username')}&update=true&id=${id}`;

        fetch(updateUrl);
    }

    const handleDownloadCsv = () => {
        const params = {
            skipHeader: false,
            columnGroups: false,
            skipFooters: true,
            skipGroups: true,
            skipPinnedTop: true,
            skipPinnedBottom: true,
            allColumns: true,
            onlySelected: false,
            suppressQuotes: false,
            columnSeparator: ';',
            fileName: 'RolesPage.csv',
            processCellCallback: function(params) {
                if (params.node.rowPinned) {
                    return null; // Skip pinned rows
                }
                if (params.node.rowIndex === 0) {
                    return params.column.getColDef().headerName; // Return column name for the first row
                }
                if (params.node.rowIndex === 1) {
                    return params.value
                }
                return null; // Skip other rows
            },
        };

        const gridApi = gridRef.current.api;
        gridApi.exportDataAsCsv(params);
    };


    useEffect(() => {
        getRoles()
    }, [])

    return (
        <>
            <Row justify="end">
            <AuthStatus isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
        </Row>
        <div
            className="ag-theme-alpine"
            style={{
                height: '50vh',
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 100,
            }}
        >
            <Divider>Роли</Divider>
            <AgGridReact
                ref={gridRef}
                columnDefs={table?.columnDefs}
                rowData={table?.rowData}
                defaultColDef={{ flex: 2, minWidth: 200 }}
                statusBar={statusBar}
            />
            <button onClick={handleDownloadCsv}>Download CSV</button>
        </div>
        </>
    )
}

export default RolesPage
