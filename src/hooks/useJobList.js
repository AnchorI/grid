import config from '../config/config.json'

export const useJobList = ({ onSuccess, onError }) => {
    const getJobData = async () => {

        const getJobList = `${config.url}/api/slave/querry?table=job_schedules`

        await fetch(getJobList)
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
        getJob: () => {
            getJobData()
        },
    }
}
