import config from '../config/config.json'

export const useRolesList = ({ onSuccess, onError }) => {
    const getRolesData = async () => {

        const getRolesList = `${config.url}/api/slave/querry?table=roles`

        await fetch(getRolesList)
            .then(async (response) => {
                // console.log('res', response.json())

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
        getRoles: () => {
            getRolesData()
        },
    }
}
