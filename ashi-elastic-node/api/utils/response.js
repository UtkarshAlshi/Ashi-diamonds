class ElasticResponse
{
  constructor(statuscode, message, dataarray, datajson){
    this.statuscode = statuscode;
    this.message = message;
    this.dataArray = dataarray;
    this.dataJson = datajson

  }
  
}

module.exports = { ElasticResponse }