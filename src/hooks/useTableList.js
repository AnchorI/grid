export const useTableList = ({ onSuccess, onError }) => {
    const getData = async ({page, name, brand_id}) => {

        const getList = `http://localhost:8777/api/slave/${name}`
        const get = `http://localhost:8777/api/slave/brand/${brand_id}`

        await fetch(brand_id ? get : getList)
            .then(async (response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw await response.json()
                }
            })
            .then((response) => {
                onSuccess(response)
            })
            .catch((error) => {
                onError(error.message)
            })
    }

    return {
        tableUpdate: ({page, name, brand_id}) => {
            getData({page, name, brand_id})
        },
    }
}
