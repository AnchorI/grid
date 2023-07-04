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
    const [selectedRowData, setSelectedRowData] = useState(null);

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
                    };
                }),
                rowData: response.data,
            });
        },
        onError: (error) => {
            console.log(error);
        },
    });

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
        setSelectedRowData(null);
    };

    const handleEditRow = (selectedRow) => {
        console.log('selectedRowInEditRow', selectedRow)
        if (selectedRow) {
            setSelectedRowData(selectedRow);
            setIsPopupVisible(true);
        } else {
            notification.warning({
                message: 'Warning',
                description: 'Please select a row to edit.',
            });
        }
    };


    const handlePopupSave = () => {
        popupForm.validateFields().then((values) => {
            const updatedRow = { ...selectedRowData };

            table?.columnDefs.forEach((column) => {
                const { field } = column;
                if (field !== 'id') {
                    updatedRow[field] = values[field];
                }
            });

            const updateUrl = `${config.url}/api/slave/roles/${updatedRow.id}`;

            fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRow),
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

    const handleRowSelection = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        console.log('selectedNodes', selectedNodes)
        const selectedRow = selectedNodes[0]?.data; // Получаем данные из первого выбранного узла
        console.log('selectedRow', selectedRow)
        handleEditRow(selectedRow); // Передаем выбранную строку в функцию handleEditRow
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
                    onRowDoubleClicked={(event) => handleRowSelection(event)} // Изменено обработчик события
                    rowSelection="single"
                />
                <Button type="primary" onClick={handleDownloadCsv} style={{ marginLeft: 10, marginTop: 10 }}>
                    Скачать CSV
                </Button>
                <Button type="primary" onClick={handleAddRecord} style={{ marginLeft: 10, marginTop: 10 }}>
                    Добавить запись
                </Button>
                <Button
                    type="primary"
                    onClick={selectedRowData ? handleEditRow : () =>
                        notification.warning({ message: 'Warning', description: 'Please select a row to edit.' })
                    }
                    style={{ marginLeft: 10, marginTop: 10 }}
                >
                    Edit Row
                </Button>
                <Modal
                    visible={isPopupVisible}
                    title={selectedRowData ? 'Edit Row' : 'Добавить запись'}
                    onCancel={handlePopupCancel}
                    onOk={handlePopupSave}
                >
                    <Form form={popupForm} layout="vertical">
                        {table?.columnDefs.map((column) => {
                            if (column.field !== 'id') {
                                return (
                                    <Form.Item
                                        key={column.field}
                                        label={column.field}
                                        name={column.field}
                                        rules={[{ required: true, message: `Please enter ${column.field}` }]}
                                        initialValue={selectedRowData ? selectedRowData[column.field] : undefined}
                                    >
                                        {column.field === 'text' ? (
                                            <Input placeholder="Надо вводить через ," />
                                        ) : (
                                            <Input />
                                        )}
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
