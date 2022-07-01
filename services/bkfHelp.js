const { async } = require("crypto-random-string");
const cryptoRandomString = require("crypto-random-string");
const genActiveCode = async () => {
    return await cryptoRandomString({ length: 8, type: "alphanumeric" })
}

const customDataHaveEmail = async (data) => {
    let newData = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].emailAddress != null) {
// "employeeId"
// "givenName"
// "surname"
// "department"
// "emailAddress"
// "phoneNumber"  
            var obj = {
                "employeeId": data[i].employeeId,
                "fname": data[i].givenName,
                "lname": data[i].surname,
                "department": data[i].department,
                "email": data[i].emailAddress,
                "phone": data[i].phoneNumber
            }
            newData.push(obj)
        }
    }
    return newData
}
const isAuthenticated = async (req, res, next) =>{
    if (req.session.assertion) {
        let nTime = Math.floor(new Date().getTime() / 1000)
        if(nTime<=req.session.assertion.expires_at){
            return next();
        }else{
            return res.redirect('/');
        }     
    } else {
      return res.redirect('/');
    }
  }

module.exports = {
    genActiveCode,
    customDataHaveEmail,
    isAuthenticated
}