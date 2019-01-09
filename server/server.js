
// Server logic for both 'http' and 'https' servers
export default function unifiedServer(req,res) {

    // get url and parse it
    var parsedUrl = url.parse(req.url,true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get query string as an object
    var queryStringObject = parsedUrl.query;

    // get http method
    var method = req.method.toLowerCase();

    // get headers as an object
    var headers = req.headers;

    // get the payload if any
    var decorder = new StringDecoder('utf-8')
    var buffer = '';

    // request on event 'data' calls the callback function
    req.on('data',function(data){
        buffer += decorder.write(data);
    });
    req.on('end', function(){
        buffer += decorder.end();

        // choose handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 

        // construct data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // use the statusCode called back by the handler or use the default
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // use the payload called back by the handler or use the default
            payload = typeof(payload) === 'object' ? payload : {};

            // convert the payload to the string
            var payloadString = JSON.stringify(payload);
            
            // return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response : ',statusCode, payloadString);
        });

    });
}