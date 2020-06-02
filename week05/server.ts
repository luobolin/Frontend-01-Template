const http = require('http')

const server = http.createServer((req, res) => {
    res.setHeader('Content-type', 'text/html')
    res.setHeader('access-token', Math.random().toString(36))
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    })

    // const body = {
    //     status: 0,
    //     msg: 'request success.'
    // }

    res.end(`<html maaa=a >
    <head>
        <style>
    #container{
        width:500px;
        height:300px;
        display:flex;
        background-color:rgb(255,255,255);
    }
    #container #myid{
      width:200px;
      height:100px;
      background-color:rgb(255,0,0)
    }
    #container .c1{
      flex:1;
      background-color:rgb(0,255,0)
    }
        </style>
    </head>
    <body>
        <div id="container">
          <div id="myid"></div>
          <div class="c1"></div>
        </div>
    </body>
</html>`)
})

server.listen(5000, () => {
    console.log('监听端口：5000')
})