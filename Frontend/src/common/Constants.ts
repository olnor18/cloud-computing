const constansts = {
    serverBaseURL: (process.env.NODE_ENV === 'production') ? 'https://api.gcp.n12.dk' : 'http://localhost:3000' //TODO: If deploying to heroku, change URL
}

export default constansts;
