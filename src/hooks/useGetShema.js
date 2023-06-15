export const useGetSchema = ({ onSuccess, onError }) => {
    const getSchemaData = async (type, subtype) => {

        const getRolesList = `http://localhost:8777/api/slave/roles/schema`
        const requestBody = {
            type: `${type}`,
            subtype: `${subtype}`
        }

        await fetch(getRolesList, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
            .then(async (response) => {
                if (response.status === 200) {
                    return await response.json();
                } else {
                    throw await response.json()
                }
            })
            .then((result) => {
                onSuccess(result)
            })
            .catch((error) => {
                onError(error.message)
            })
    }

    return {
        getSchema: (type, subtype) => {
            getSchemaData(type, subtype)
        },
    }
}
