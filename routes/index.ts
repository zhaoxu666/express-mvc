import express, { Request, Response } from "express";

import fs from 'fs'

let router = express.Router();
let files = fs.readdirSync(__dirname + '/modules');

files
    // .filter(function(file:string, index:number){
    //     return file !== 'loader.js';
    // })
    .forEach(function(file: string, index: number){
        let route = require('./modules/' + file.replace('.js', ''));
        router.use('/' + file.replace('.js', ''), route);
    });

router.get('/', (req: Request, res: Response) => {
    res.send('hello 自动加载路由')
})   

export default router;