const net = require('net')

interface ResponseParserProps {
    WAITING_STATUS_LINE: 0; // 初始状态
    WAITING_STATUS_LINE_END: 1; // 结束状态 \r
    WAITING_HEADER_NAME: 2; // :
    WAITING_HEADER_SPACE: 3;
    WAITING_HEADER_VALUE: 4;
    WAITING_HEADER_LINE_END: 5;
    WAITING_HEADER_BLOCK_END: 6;
    WAITING_HEADER_BODY: 7;
    current: ResponseParserProps['WAITING_STATUS_LINE'] |
    ResponseParserProps['WAITING_STATUS_LINE_END'] |
    ResponseParserProps['WAITING_HEADER_NAME'] |
    ResponseParserProps['WAITING_HEADER_SPACE'] |
    ResponseParserProps['WAITING_HEADER_VALUE'] |
    ResponseParserProps['WAITING_HEADER_LINE_END'] |
    ResponseParserProps['WAITING_HEADER_BLOCK_END'] |
    ResponseParserProps['WAITING_HEADER_BODY'];
    statusLine: string;
    headers: {
        'Transfer-Encoding'?: 'chunked';
        [key: string]: any;
    };
    headerName: string;
    headerValue: string;
    bodyParser: {
        isFinished: boolean;
        content: any[];
        receiveChar: (char: string) => void
    };
}

class ResponseParser implements ResponseParserProps {
    WAITING_STATUS_LINE: ResponseParserProps['WAITING_STATUS_LINE'];
    WAITING_STATUS_LINE_END: ResponseParserProps['WAITING_STATUS_LINE_END'];
    WAITING_HEADER_NAME: ResponseParserProps['WAITING_HEADER_NAME'];
    WAITING_HEADER_SPACE: ResponseParserProps['WAITING_HEADER_SPACE'];
    WAITING_HEADER_VALUE: ResponseParserProps['WAITING_HEADER_VALUE'];
    WAITING_HEADER_LINE_END: ResponseParserProps['WAITING_HEADER_LINE_END'];
    WAITING_HEADER_BLOCK_END: ResponseParserProps['WAITING_HEADER_BLOCK_END'];
    WAITING_HEADER_BODY: ResponseParserProps['WAITING_HEADER_BODY'];

    current: ResponseParserProps['current'];
    statusLine: ResponseParserProps['statusLine'];
    headers: ResponseParserProps['headers'];
    headerName: ResponseParserProps['headerName'];
    headerValue: ResponseParserProps['headerValue'];
    bodyParser: ResponseParserProps['bodyParser'];

    constructor() {
        this.WAITING_STATUS_LINE = this.WAITING_STATUS_LINE
        this.WAITING_STATUS_LINE_END = this.WAITING_STATUS_LINE_END
        this.WAITING_HEADER_NAME = this.WAITING_HEADER_NAME
        this.WAITING_HEADER_SPACE = this.WAITING_HEADER_SPACE
        this.WAITING_HEADER_VALUE = this.WAITING_HEADER_VALUE
        this.WAITING_HEADER_LINE_END = this.WAITING_HEADER_LINE_END
        this.WAITING_HEADER_BLOCK_END = this.WAITING_HEADER_BLOCK_END
        this.WAITING_HEADER_BODY = this.WAITING_HEADER_BODY

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = ''
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)

        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }

    receiveChar(char: string) {
        if (this.current === this.WAITING_STATUS_LINE) {
            switch (char) {
                case '\r':
                    this.current = this.WAITING_STATUS_LINE_END
                    break
                case '\n':
                    this.current = this.WAITING_HEADER_NAME
                    break
                default:
                    this.statusLine += char
            }

            return
        }

        if (this.current === this.WAITING_STATUS_LINE_END) {
            this.current = this.WAITING_HEADER_NAME

            return
        }

        if (this.current === this.WAITING_HEADER_NAME) {
            switch (char) {
                case ':':
                    this.current = this.WAITING_HEADER_SPACE
                    break
                case '\r':
                    this.current = this.WAITING_HEADER_BLOCK_END
                    if (this.headers["Transfer-Encoding"] === 'chunked') {
                        this.bodyParser = new TrunkedBodyParse()
                    }
                    break
                default:
                    this.headerName += char
            }

            return
        }

        if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            }
            return
        }

        if (this.current === this.WAITING_HEADER_VALUE) {
            if (char !== '\r') {
                this.headerValue += char
            }

            this.current = this.WAITING_HEADER_LINE_END
            this.headers[this.headerName] = this.headerValue
            this.headerName = ''
            this.headerValue = ''

            return
        }

        if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_BODY
            }

            return
        }

        if (this.current === this.WAITING_HEADER_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}

interface TrunkedBodyParseProps {
    WAITING_LENGTH: 0;
    WAITING_LENGTH_LINE_END: 1;
    READING_TRUNK: 2;
    WAITING_NEW_LINE: 3;
    WAITING_NEW_LINE_END: 4;

    length: number;
    content: any[];
    isFinished: boolean;
    current: TrunkedBodyParseProps['WAITING_LENGTH'] |
    TrunkedBodyParseProps['WAITING_LENGTH_LINE_END'] |
    TrunkedBodyParseProps['READING_TRUNK'] |
    TrunkedBodyParseProps['WAITING_NEW_LINE'] |
    TrunkedBodyParseProps['WAITING_NEW_LINE_END'];
}

class TrunkedBodyParse implements TrunkedBodyParseProps {
    WAITING_LENGTH: TrunkedBodyParseProps['WAITING_LENGTH'];
    WAITING_LENGTH_LINE_END: TrunkedBodyParseProps['WAITING_LENGTH_LINE_END'];
    READING_TRUNK: TrunkedBodyParseProps['READING_TRUNK'];
    WAITING_NEW_LINE: TrunkedBodyParseProps['WAITING_NEW_LINE'];
    WAITING_NEW_LINE_END: TrunkedBodyParseProps['WAITING_NEW_LINE_END'];

    length: TrunkedBodyParseProps['length'];
    content: TrunkedBodyParseProps['content'];
    isFinished: TrunkedBodyParseProps['isFinished'];
    current: TrunkedBodyParseProps['current'];

    constructor() {
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_TRUNK = 2
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4

        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }

    receiveChar(char: string) {
        if (this.current === this.WAITING_LENGTH) {
            if (char !== '\r') {
                this.length *= 10
                this.length += char.charCodeAt(0) - '0'.charCodeAt(0)
                return
            }

            if (this.length === 0) {
                this.isFinished = true
            }
            this.current = this.WAITING_LENGTH_LINE_END

            return
        }

        if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_TRUNK
            }
            return
        }

        if (this.current === this.READING_TRUNK) {
            this.content.push(char)
            this.length--
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
            return
        }

        if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END
            }
            return
        }

        if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH
            }

            return
        }
    }
}

interface LRequestOptions {
    method?: 'GET' | 'POST';
    host?: string;
    port?: number;
    path?: string;
    body?: { [key: string]: any }
    headers?: {
        'Content-type'?: 'application/json' | 'application/x-www-form-urlencoed';
        'Content-length'?: number;
        [key: string]: any
    }
}

class LRequest implements LRequestOptions {
    method: LRequestOptions['method'];
    host: LRequestOptions['host'];
    port: LRequestOptions['port'];
    path: LRequestOptions['path'];
    body: LRequestOptions['body'];
    headers: LRequestOptions['headers'];

    bodyText: string;

    constructor(options: LRequestOptions) {
        this.method = options.method || 'GET'
        this.host = options.host
        this.port = options.port || 80
        this.path = options.path || '/'
        this.body = options.body || {}
        this.headers = options.headers || {}

        // 设置默认 Content-type
        if (!this.headers['Content-type']) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoed"
        }

        switch (this.headers["Content-type"]) {
            case 'application/json':
                this.bodyText = JSON.stringify(this.body)
                break
            case 'application/x-www-form-urlencoed':
                this.bodyText = Object.entries(this.body).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&')
        }

        this.headers["Content-length"] = this.bodyText.length
    }

    toString() {
        return `
${this.method} ${this.path} HTTP/1.1\r
${Object.entries(this.headers).map(([key, val]) => `${key}: ${val}`).join('\r\n')}\r
\r
${this.bodyText}
        `
    }

    send(connection?: any) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser()

            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }

            connection.on('data', (data) => {
                console.log(data.toString())

                parser.receive(data.toString())
                if (parser.isFinished) {
                    resolve(parser.response)
                }

                connection.end()
            })
            connection.on('error', err => {
                reject(err)
                connection.end()
            })
        })
    }
}

const go = async (): Promise<void> => {
    const request = new LRequest({
        method: 'POST',
        host: '127.0.0.1',
        path: "/",
        port: 1234,
        headers: {
            ["device-uuid"]: "iwvixlhdapqmvhaesfhqwonvsowehfoi"
        },
        body: {
            name: "Lorin",
            age: 26
        }
    })

    const response = await request.send()
    console.log('response :', response);
}