import express from "express";
import bodyParser from 'body-parser'
import *  as controllers from './controllers'
import { RequestHandler, RouteHandler } from './plugin'
const app = express();
app.all('*', function (req, res, next:any) {

    res.header('Access-Control-Allow-Origin', '*');
    
    //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
    
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    res.header('Access-Control-Allow-Methods', '*');
    
    res.header('Content-Type', 'application/json;charset=utf-8')
    if (req.method.toLowerCase() == 'options') {
        res.send(200);  //让options尝试请求快速结束
    }
    else {
        next()
    }
    
    
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

RouteHandler(app, controllers)

app.use(RequestHandler)

app.listen("7001",()=>{
    console.log("http://localhost:7001");
});

module.exports = app;