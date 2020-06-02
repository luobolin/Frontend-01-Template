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
    body div #myid{
        width:100px;
        background-color: #ff5000;
    }
    body div img{
        width:30px;
        background-color: #ff1111;
    }
        </style>
    </head>
    <body>
        <div>
            <img id="myid"/>
            <img />
        </div>
    </body>
    </html>`)
})

server.listen(5000, () => {
    console.log('监听端口：5000')
})