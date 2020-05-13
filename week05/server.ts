const http = require('http')

const server = http.createServer((req, res) => {
    res.setHeader('Content-type', 'text/html')
    res.setHeader('access-token', Math.random().toString(36))
    res.writeHead(200, {
        'Content-type': 'text/plain'
    })
    res.end('ok')
})

server.listen(1234, () => {
    console.log('监听端口：1234')
})