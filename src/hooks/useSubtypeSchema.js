import config from '../config/config.json'

export const useSubtypeSchema = ({ onSuccess, onError }) => {
    const getSubtypeSchema = async (type) => {

        const getSubtypes = `${config.url}/api/slave/roles/schema-subtype?type=${type}`

        await fetch(getSubtypes)
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
        getSubtypes: (type) => {
            getSubtypeSchema(type)
        },
    }
}
