export const useRolesList = ({ onSuccess, onError }) => {
    const getRolesData = async () => {

        const getRolesList = `http://localhost:8777/api/slave/querry?table=roles`

        await fetch(getRolesList)
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
        getRoles: () => {
            getRolesData()
        },
    }
}
