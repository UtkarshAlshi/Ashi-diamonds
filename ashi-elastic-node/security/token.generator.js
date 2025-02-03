const config = require('../config.json');
const jwt = require('jsonwebtoken');


module.exports=generateToken

function generateToken(){
    const token = jwt.sign({ email: 'praveen@hilextech.com', company_code: 'HLX001'}, config.secret);
    //console.log(token) ;
    return token ; 
}


generateToken() ;