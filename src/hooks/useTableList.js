export const useTableList = ({ onSuccess, onError }) => {
    const getData = async ({page, name}) => {
        await fetch(`https://reqres.in/api/${name}?page=${page}`)
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
        tableUpdate: ({page, name}) => {
            getData({page, name})
        },
    }
}
