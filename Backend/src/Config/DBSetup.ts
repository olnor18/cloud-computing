export const getDbConnectionString = () => {
    return `${process.env.MONGO_URL}`
}