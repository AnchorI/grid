export const useTableList = ({ onSuccess, onError }) => {
    const getData = async ({ name, brand_id, mnemokod }) => {

        // const getList = `https://reqres.in/api/${name}`
        // const get = `https://reqres.in/api/${name}/${brand_id}`
        const getServerList = `http://localhost:8777/api/slave/querry?table=${name}&mnemokod=${mnemokod}`
        // const getServer = `http://localhost:8777/api/slave/servers/${name}/${brand_id}`

        await fetch(getServerList)
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
        tableUpdate: ({ name, brand_id, mnemokod }) => {
            getData({ name, brand_id, mnemokod })
        },
    }
}
