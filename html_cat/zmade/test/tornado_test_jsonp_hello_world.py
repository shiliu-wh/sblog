import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options

import json


define("port", default=8888, help="run on the given port", type=int)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        arguments = self.request.arguments
        print(json.dumps(arguments, indent=2))
        backObj = {
            "success": True,
            "name": "jack-zh",
            "blognum": 1,
            "test_argument": "plus"
        }
        backStr = json.dumps(backObj)
        self.write("jsonpcallback('%s')" % backStr)


def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application([
        (r"/", MainHandler),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
