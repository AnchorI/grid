import { Modal, Input, Button } from 'antd'
import { useState } from 'react'
const AddModal = ({ isModalOpen, setIsModalOpen, tables, setTables }) => {
    const [tableName, setTableName] = useState(null)
    const [querryName, setQuerryName] = useState(null)
    const handleOk = () => {
        setTables([...tables, {name: tableName, fullrow: false, querry: querryName}])
        handleCancel()
    }
    const handleCancel = () => {
        setIsModalOpen(false)
        setTableName(null)
    }
    return (
        <>
            <Modal
                title="Enter table name"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button type="primary" onClick={handleOk}>
                        Add table
                    </Button>,
                ]}
            >
                <Input
                    value={tableName}
                    onChange={(event) => {
                        setTableName(event.target.value)
                    }}
                ></Input>
                Querry
                <Input
                    value={querryName}
                    onChange={(event) => {
                        setQuerryName(event.target.value)
                    }}
                ></Input>
            </Modal>
        </>
    )
}
export default AddModal
