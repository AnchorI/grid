import {AgGridReact} from 'ag-grid-react';
import {Button, Divider, Form, Input, Modal, notification, Row, Select, Tooltip} from 'antd';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import config from '../config/config.json';

import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AuthStatus from '../components/auth-status';
import {useJobList} from '../hooks/useJobList';
import TextArea from 'antd/es/input/TextArea';

const JobSchedulePage = ({ isAuthenticated, setIsAuthenticated }) => {
    const [table, setTable] = useState();
    const [originalRowData, setOriginalRowData] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupForm] = Form.useForm();
    const [selectedRowData, setSelectedRowData] = useState(null);
    const gridRef = useRef(null);
    const { Option } = Select;

    const mustFields = [
        'name',
        'direction',
        'system',
        'type'
    ]

    const jsonCellRenderer = (params) => {
        if (params.value != null) {
            return JSON.stringify(params.value)
        }
        return null
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

    const { getJob } = useJobList({
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

    const columnDefs = useMemo(() => {
        return table?.columnDefs.map((column) => {
            if (column.field === 'params') {
                return {
                    ...column,
                    cellRenderer: 'jsonCellRenderer',
                };
            }
            return column;
        });
    }, [table?.columnDefs]);

    const handleAddRecord = () => {
        setIsPopupVisible(true);
        setSelectedRowData(null);
        setOriginalRowData(null); // Clear the original row data
        popupForm.resetFields();
    };


    const handleEditRow = (selectedRow) => {
        if (selectedRow) {
            setSelectedRowData(selectedRow);
            setOriginalRowData({ ...selectedRow }); // Store the original row data
            setIsPopupVisible(true);
            if (typeof selectedRow.params === 'string') {
                selectedRow.params = JSON.parse(selectedRow.params); // Parse JSON back to an object
            }
            popupForm.setFieldsValue({ ...selectedRow, params: JSON.stringify(selectedRow.params, null, 2) });
        } else {
            notification.warning({
                message: 'Warning',
                description: 'Please select a row to edit.',
            });
        }
    };


    const handlePopupCancel = () => {
        if (originalRowData) {
            setSelectedRowData(originalRowData); // Restore the row data from the original object
        }
        setIsPopupVisible(false);
        popupForm.resetFields();
    };

    const handlePopupSave = () => {
        popupForm.validateFields().then((values) => {
            const updatedRow = { ...selectedRowData, params: values.params }; // Use the updated value directly

            columnDefs.forEach((column) => {
                const { field } = column;
                if (field !== 'id') {
                    updatedRow[field] = values[field];
                }
            });

            // Проверка валидности JSON
            try {
                JSON.parse(updatedRow.params); // Попытка разбора JSON
            } catch (error) {
                notification.error({
                    message: 'Invalid JSON',
                    description: 'Please enter a valid JSON object.',
                });
                return;
            }

            if (
                updatedRow.params &&
                typeof JSON.parse(updatedRow.params).test !== 'boolean'
            ) {
                notification.error({
                    message: 'Invalid Value',
                    description: 'The field "test" in the JSON should be a boolean value.',
                });
                return;
            }

            const apiUrl = `${config.url}/api/slave/job${
                selectedRowData
                    ? `/update?username=${localStorage.getItem('username')}`
                    : `/create?username=${localStorage.getItem('username')}`
            }`;

            fetch(apiUrl, {
                method: selectedRowData ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRow),
            })
                .then((response) => response.json())
                .then(() => {
                    getJob();
                    handlePopupCancel();
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    };


    const handleRowSelection = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedRow = selectedNodes[0]?.data;

        if (selectedRow && selectedRow.params) {
            if (typeof selectedRow.params !== 'string') {
                selectedRow.params = JSON.stringify(selectedRow.params, null, 2);
            }
        }

        handleEditRow(selectedRow);
        setSelectedRowData(selectedRow);
    };

    function getCronDescription(cronExpression) {
        const cronParts = cronExpression.split(' ');
        const minute = cronParts[0];
        const hour = cronParts[1];
        const daysOfMonth = cronParts[2];
        const months = cronParts[3];
        const daysOfWeek = cronParts[4];

        // Преобразование дней недели из числового формата в текстовый
        const weekdaysMapping = {
            '0': 'Воскресенье',
            '1': 'Понедельник',
            '2': 'Вторник',
            '3': 'Среда',
            '4': 'Четверг',
            '5': 'Пятница',
            '6': 'Суббота',
            'Sun': 'Воскресенье',
            'Mon': 'Понедельник',
            'Tue': 'Вторник',
            'Wed': 'Среда',
            'Thu': 'Четверг',
            'Fri': 'Пятница',
            'Sat': 'Суббота',
        };

        const monthNames = {
            '1': 'Январь',
            '2': 'Февраль',
            '3': 'Март',
            '4': 'Апрель',
            '5': 'Май',
            '6': 'Июнь',
            '7': 'Июль',
            '8': 'Август',
            '9': 'Сентябрь',
            '10': 'Октябрь',
            '11': 'Ноябрь',
            '12': 'Декабрь',
        };

        const cronMonths = months === '*' ? 'каждый месяц' : `только в ${months.split(',').map((month) => monthNames[month]).join(', ')}`;

        const cronDaysOfMonth = daysOfMonth === '*' ? 'каждый день' : `только ${daysOfMonth} числа`;

        const cronDaysOfWeek = daysOfWeek === '*' ? 'каждый день недели' : `только в ${daysOfWeek.split(',').map((day) => weekdaysMapping[day]).join(', ')}`;

        // Генерация описания
        return `В ${hour}:${minute}, ${cronDaysOfWeek}, ${cronMonths}, ${cronDaysOfMonth}.`;
    }

    useEffect(() => {
        getJob();
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
                    columnDefs={columnDefs}
                    rowData={table?.rowData}
                    defaultColDef={{ flex: 2, minWidth: 200 }}
                    statusBar={statusBar}
                    onRowDoubleClicked={(event) => handleRowSelection(event)}
                    rowSelection="single"
                    frameworkComponents={{
                        jsonCellRenderer: jsonCellRenderer,
                    }}
                    // Добавьте cellStyle для поля params
                    // Определите, что контент в ячейке не должен обрамляться кавычками и экранироваться
                    cellStyle={(params) => {
                        if (params.colDef.field === 'params') {
                            return { whiteSpace: 'pre-wrap' };
                        }
                        return null;
                    }}
                />

                <Button type="primary" onClick={handleAddRecord} style={{ marginLeft: 10, marginTop: 10 }}>
                    Добавить запись
                </Button>
                <Modal
                    visible={isPopupVisible}
                    title={selectedRowData ? 'Редактировать' : 'Добавить запись'}
                    onCancel={handlePopupCancel}
                    onOk={handlePopupSave}
                >
                    <Form form={popupForm} layout="vertical">
                        {columnDefs &&
                            columnDefs.map((column) => {
                                if (column.field !== 'id') {
                                    const mustBe = mustFields.includes(column.field);
                                    const isCronField = column.field === 'cron';

                                    return (
                                        <Tooltip
                                            key={column.field}
                                            title={isCronField && selectedRowData ? getCronDescription(selectedRowData[column.field]) : ''}
                                        >
                                            <Form.Item
                                                label={column.field}
                                                name={column.field}
                                                rules={[
                                                    {
                                                        required: mustBe,
                                                        message: `${column.field} - обязательное поле`,
                                                    },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (column.field === 'enabled' && value !== 'true' && value !== 'false') {
                                                                return Promise.reject(new Error('Пожалуйста, введите true или false'));
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    }),
                                                ]}
                                            >
                                                {column.field === 'params' ? <TextArea rows={4} /> : column.field === 'enabled' ? (
                                                    <Select>
                                                        <Option value="true">true</Option>
                                                        <Option value="false">false</Option>
                                                    </Select>
                                                ) : (
                                                    <Input />
                                                )}
                                            </Form.Item>
                                        </Tooltip>
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

export default JobSchedulePage;
