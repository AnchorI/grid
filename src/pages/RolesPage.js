import { AgGridReact } from 'ag-grid-react';
import { Button, Col, Divider, Form, Input, Modal, notification, Row } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRolesList } from '../hooks/useRolesList';
import config from '../config/config.json';

import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AuthStatus from '../components/auth-status';

const RolesPage = ({ isAuthenticated, setIsAuthenticated }) => {
    const [table, setTable] = useState();
    const [changedData, setChangedData] = useState([]);
    const [oldValue, setOldValue] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupForm] = Form.useForm();

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
                        rowDrag: false,
                        hide: el === 'id',
                        filter: 'agTextColumnFilter',
                        sortable: true,
                        floatingFilter: true,
                        editable: el !== 'id',
                        onCellValueChanged: handleCellValueChanged,
                    };
                }),
                rowData: response.data,
            });
        },
        onError: (error) => {
            console.log(error);
        },
    });

    function handleCellValueChanged(event) {
        const { data, colDef, newValue, oldValue } = event;
        const { field } = colDef;

        data[field] = newValue;
        setOldValue(oldValue);

        const existingDataIndex = changedData.findIndex((item) => item.id === data.id);
        if (existingDataIndex !== -1) {
            changedData[existingDataIndex][field] = newValue;
        } else {
            changedData.push({ id: data.id, [field]: newValue });
        }
        if (changedData.length > 0 && Object.keys(changedData[0]).length > 2) {
            notification.error({
                message: `Сохранится только первая измененная ячейка. Сохраните данные и обновите страницу`,
            });
            return;
        }
        setIsButtonDisabled(changedData.length === 0);
    }

    const handleSaveChanges = async () => {
        try {
            for (const changedItem of changedData) {
                const { id } = changedItem;
                const fieldToUpdate = Object.keys(changedItem)[1];
                const changedValue = Object.values(changedItem)[1];
                const updateUrl = `${config.url}/api/slave/querry?table=portal_roles&pole=${fieldToUpdate}&changedValue=${changedValue}&oldValue=${oldValue}&username=${localStorage.getItem(
                    'username'
                )}&update=true&id=${id}`;

                await fetch(updateUrl);
            }
            setChangedData([]);
            setIsButtonDisabled(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDownloadCsv = () => {
        const columnIdToRemove = 'id';

        const params = {
            skipHeader: false,
            columnGroups: false,
            skipFooters: true,
            skipRowGroups: true,
            skipPinnedTop: true,
            skipPinnedBottom: true,
            allColumns: true,
            onlySelected: false,
            suppressQuotes: false,
            columnSeparator: ';',
            fileName: 'RolesPage.csv',
            processCellCallback: function (params) {
                if (params.node.rowPinned) {
                    return null;
                }
                if (params.node.rowIndex === 0) {
                    if (params.column.getColDef()?.field === 'id') {
                        return null;
                    }
                    return params.value;
                }
                return null;
            },
        };

        const gridApi = gridRef.current.api;
        const originalColumnDefs = gridApi.getColumnDefs();
        const updatedColumnDefs = originalColumnDefs.filter(
            (columnDef) => columnDef.field !== columnIdToRemove
        );
        gridApi.setColumnDefs(updatedColumnDefs);
        gridApi.exportDataAsCsv(params);
    };

    const handleAddRecord = () => {
        setIsPopupVisible(true);
    };

    const handlePopupCancel = () => {
        setIsPopupVisible(false);
        popupForm.resetFields();
    };

    const handlePopupSave = () => {
        popupForm.validateFields().then((values) => {
            const newRow = {};

            table?.columnDefs.forEach((column) => {
                const { field } = column;
                if (field !== 'id') {
                    newRow[field] = values[field];
                }
            });

            console.log('newRow', newRow);

            const createUrl = `${config.url}/api/slave/roles/create`;

            fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRow),
            })
                .then((response) => response.json())
                .then(() => {
                    getRoles();
                    handlePopupCancel();
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    };


    useEffect(() => {
        getRoles();
    }, []);

    return (
        <>
            <Row justify="end">
                <AuthStatus isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
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
                <Button
                    type="primary"
                    onClick={handleSaveChanges}
                    disabled={isButtonDisabled}
                    style={{ marginTop: 10 }}
                >
                    Сохранить изменения
                </Button>
                <Button type="primary" onClick={handleAddRecord} style={{ marginLeft: 10, marginTop: 10 }}>
                    Добавить запись
                </Button>
                <Modal
                    visible={isPopupVisible}
                    title="Добавить запись"
                    onCancel={handlePopupCancel}
                    onOk={handlePopupSave}
                >
                    <Form form={popupForm} layout="vertical">
                        {table?.columnDefs.map((column) => {
                            if (column.field !== 'id') { // Exclude the column with field name 'id'
                                return (
                                    <Form.Item
                                        key={column.field}
                                        label={column.field}
                                        name={column.field}
                                        rules={[{ required: true, message: `Please enter ${column.field}` }]}
                                    >
                                        {column.field === 'text' ? <Input placeholder={"Надо вводить через ,"}/> : <Input/>}
                                    </Form.Item>
                                );
                            }
                            return null;
                        })}
                    </Form>
                </Modal>

            </div>
        </>
    );
};

export default RolesPage;
