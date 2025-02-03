var { ElasticResponse } = require('../utils/response')
const constants = require('../utils/constants')

module.exports = {
    validateResponse,
    getSafeString
};

function validateResponse(response, key=''){


    if (response.data.responseCode == constants.S2S_SUCCESS){
        if (key == ''){
            return new ElasticResponse(constants.SUCCESS_CODE, response.data.responseMessage, response.data.responseData, {})
        }
        else{
            return new ElasticResponse(constants.SUCCESS_CODE, response.data.responseMessage, [], {[key]: response.data.responseData})
        }
    }
    else{
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data from main server " + response.data.responseMessage, [], {})    
    }
}


function getSafeString(input) {
    if (input === null || input === undefined || input === '') {
        return '';
    }
    return input;
}

