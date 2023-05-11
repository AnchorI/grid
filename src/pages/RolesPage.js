import { AgGridReact } from 'ag-grid-react'
import {Button, Col, Divider, Row} from 'antd'
import React, {useEffect, useMemo, useState} from 'react'
import { useRolesList } from '../hooks/useRolesList'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const RolesPage = ({isAuthenticated, setIsAuthenticated, setLogoutTimer, logoutTimer}) => {
    const [table, setTable] = useState()
    const [tempLogoutTimer, setTempLogoutTimer] = useState(logoutTimer);

    function handleTimerChange(e) {
        setLogoutTimer(e.target.value === '' || e.target.value === '0' ? 60 * 1000 : e.target.value * 60 * 1000);
    }

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
                columnDefs: Object.keys(response.data[0]).filter(key => key !== "id").map((el) => {
                    return {
                        field: el,
                        rowDarag: true,
                        filter: 'agTextColumnFilter',
                        sortable: true,
                        floatingFilter: true,
                    }
                }),
                rowData: response.data,
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })
    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        setIsAuthenticated(false);
    };

    useEffect(() => {
        getRoles()
    }, [])

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
                columnDefs={table?.columnDefs}
                rowData={table?.rowData}
                defaultColDef={{ flex: 2, minWidth: 200 }}
                statusBar={statusBar}
            />
            <label>
                Auto Logout Time {tempLogoutTimer / 1000 / 60} (in minutes):
                <input
                    type="number"
                    onChange={handleTimerChange}
                />
            </label>
        </div>
        </>
    )
}

export default RolesPage
