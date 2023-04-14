export const useTableList = ({ onSuccess, onError }) => {
    const getData = async ({ name, brand_id }) => {
        const getList = `https://reqres.in/api/${name}`
        const get = `https://reqres.in/api/${name}/${brand_id}`

        // const getList = `http://185.150.155.18:8777/api/slave/${name}`
        // const get = `http://185.150.155.18:8777/api/slave/brand/${brand_id}`
        //const getList = `http://localhost:8777/api/slave/${name}`
        //const get = `http://localhost:8777/api/slave/brand/${brand_id}`

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
        tableUpdate: ({ name, brand_id}) => {
            getData({ name, brand_id})
        },
    }
}
