import config from '../config/config.json'

export const useTableList = ({ onSuccess, onError }) => {
    const getData = async ({ name, brand_id, mnemokod }) => {
        const getServerList = `${config.url}/api/slave/querry?table=${name}&mnemokod=${mnemokod}`

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
