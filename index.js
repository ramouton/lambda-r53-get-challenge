exports.handler = (event, context, callback) => {

  if (event.keepalive) {
    callback(null,{"alive":true});
  } else {
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();

    var s3_content_bucket = process.env.S3_CONTENT_BUCKET;
    var s3_challenge_file = process.env.S3_CHALLENGE_PATH;

    if (event.httpMethod == 'GET') {
      if ('system-user' in event.headers) {
        if (event.headers['System-User'] != process.env.AUTHORIZED_USER) {
          request_response = {
            statusCode: 401,
            headers: {'Content-type':'application/json'},
            body: JSON.stringify({'error':'Access Denied','reason':'Invalid Authentication'})
          };
          callback(null,request_response);
        }
      } else {
        request_response = {
          statusCode: 401,
          headers: {'Content-type':'application/json'},
          body: JSON.stringify({'error':'Access Denied','reason':'Invalid Authentication'})
        };
        callback(null,request_response);
      }
      var s3_params = {
        Bucket: s3_content_bucket,
        Key: s3_challenge_file
      };
      s3.getObject(s3_params, function(err, data) {
        if (err) {
          request_response = {
            statusCode: 404,
            headers: {'Content-type':'application/json'},
            body: JSON.stringify({'error':err,'error_stack': err.stack})
          };
          callback(null,request_response);
        } else {
          request_response = {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {'Content-type':data.ContentType,'Content-length':data.ContentLength},
            body: data.Body.toString()
          };
          callback(null,request_response);
        }
      });

    }
  }
};
