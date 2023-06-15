import config from '../config/config.json'

export const useTypeSchema = ({ onSuccess, onError }) => {
    const getTypeSchema = async () => {

        const getTypes = `${config.url}/api/slave/roles/schema-type`

        await fetch(getTypes)
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
        getTypes: () => {
            getTypeSchema()
        },
    }
}
