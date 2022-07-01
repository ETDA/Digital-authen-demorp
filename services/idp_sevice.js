var axios = require('axios');
const help = require ("./bkfHelp")
const sendmail = async (obj,token)=> {
    try {
        var config = {
            method: 'post',
            // url: 'http://api-uat-k8s-01.teda.th:30080/idp/v1/SendEmail',
            url: process.env.API_EMAIL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            data: obj
        };
        const response = await axios(config)
        return response.data

    } catch (error) {
        console.error(error.message);
        const message = {
            "result": "error",
            "description": "INTERNAL ERROR"
        }
        return message
    }
}
const callGetUser = async (token)=> {
    try {
        var config = {
            method: 'get',
            headers:{
                Authorization: token
            },
            // url: 'http://api-uat-k8s-01.teda.th:30080/idp/v1/GetAllProfile'
            url: process.env.API_GETALLPROFILE,
        };
        const response = await axios(config)
        console.log("suess");
        return response.data

    } catch (error) {
        console.error(error.message);
        const message = {
            "result": "error",
            "description": "INTERNAL ERROR"
        }
        return message
    }
}

module.exports = {
    sendmail,
    callGetUser,
}