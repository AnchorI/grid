import { AgGridReact } from 'ag-grid-react'
import {Col, Divider, Row, Select, notification} from 'antd'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios';
import { Upload, Button } from 'antd';

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import AuthStatus from "../components/auth-status";
import {useGetSchema} from "../hooks/useGetShema";
import {useTypeSchema} from "../hooks/useTypeSchema";
import {useSubtypeSchema} from "../hooks/useSubtypeSchema";
const { Option } = Select;

const SchemaPage = ({isAuthenticated, setIsAuthenticated, }) => {
    const [table, setTable] = useState()
    const [type, setType] = useState()
    const [subtype, setSubtype] = useState()
    const [file, setFile] = useState(null);

    const [filter, setFilter] = useState({
        type: '',
        subtype: ''
    });
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
    const { getSchema } = useGetSchema({
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
                    }
                }),
                rowData: response.data,
            })
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const { getTypes } = useTypeSchema({
        onSuccess: (data) => {
            setType(data);
        },
        onError: (error) => {
            console.log('Error in SchemaPage', error)
        },
    });

    const { getSubtypes } = useSubtypeSchema({
        onSuccess: (data) => {
            setSubtype(data);
        },
        onError: (error) => {
            console.log('Error in SchemaPage', error)
        },
    });

    const handleDownloadCsv = () => {
        const columnIdToRemove = 'id'; // The ID of the column to remove

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
            processCellCallback: function(params) {
                if (params.node.rowPinned) {
                    return null; // Skip pinned rows
                }
                if (params.node.rowIndex === 0) {
                    if (params.column.getColDef()?.field === "id") {
                        return null; // Skip the "id" column header
                    }
                    return params.value;
                }
                return null; // Skip other rows
            },
        };

        const gridApi = gridRef.current.api;
        const originalColumnDefs = gridApi.getColumnDefs();
        const updatedColumnDefs = originalColumnDefs.filter(columnDef => columnDef.field !== columnIdToRemove);
        gridApi.setColumnDefs(updatedColumnDefs);
        gridApi.exportDataAsCsv(params);
    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:8777/api/slave/roles/upload/json', formData);
                console.log('File uploaded successfully:', response.data);
                notification.success({
                    message: `${response.data.file_name} успешно загружен`
                })
                // Handle the response or any other necessary actions
            } catch (error) {
                console.error('Error uploading file:', error);
                notification.error({
                    message: `Произошла ошибка: ${error}`,
                });
                // Handle the error or display an error message
            }
        }
    };



    useEffect(() => {
        getTypes()
    }, [])

    useEffect(() => {
        getSubtypes(filter.type)
        filter.subtype = ''
    }, [filter.type])

    useEffect(() => {
        getSchema(filter.type, filter.subtype)
    }, [filter.subtype])

    return (
        <>
            <Row justify="end">
                <AuthStatus isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
            </Row>
            <Col className="gutter-row" span={4}>
                <div>Type:</div>
                <Select
                    value={filter.type}
                    style={{ width: "80%" }}
                    onChange={(value) => {
                        setFilter({ ...filter, type: value })
                    }}
                >
                    {type?.filter((el, index, arr) =>
                        arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(el)) === index
                    ).map((el) => (
                        <Option value={el.type}>{el.type}</Option>
                    ))}
                </Select>
            </Col>
            {filter.type &&
                <Col className="gutter-row" span={4}>
                    <div>Subtype</div>
                    <Select
                        value={filter.subtype}
                        style={{ width: "80%" }}
                        onChange={(value) => {
                            setFilter({ ...filter, subtype: value })
                        }}
                    >
                        {subtype?.filter((el, index, arr) => arr.indexOf(el) === index).map((el) => (
                            <Option value={el.subtype}>{el.subtype}</Option>
                        ))}
                    </Select>
                </Col>
            }
            <div
                className="ag-theme-alpine"
                style={{
                    height: '50vh',
                    marginLeft: 10,
                    marginRight: 10,
                    marginBottom: 100,
                }}
            >
                <Divider>Схема</Divider>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={table?.columnDefs}
                    rowData={table?.rowData}
                    defaultColDef={{ flex: 2, minWidth: 200 }}
                    statusBar={statusBar}
                />
                <button onClick={handleDownloadCsv}>Download CSV</button>
                <div>
                    <Upload
                        beforeUpload={(uploadedFile) => {
                            setFile(uploadedFile);
                            return false; // Prevent automatic upload
                        }}
                    >
                        <Button>Select CSV File</Button>
                    </Upload>
                    <Button type="primary" onClick={handleUpload} disabled={!file}>
                        Upload CSV
                    </Button>
                </div>
            </div>
        </>
    )
}

export default SchemaPage
