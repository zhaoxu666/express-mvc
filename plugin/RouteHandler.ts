import * as core from "express-serve-static-core";
import "reflect-metadata";

import { UserInfo } from './UserInfo';
import { ViewResult, JsonResult } from './ViewResult';
import { GetActionDescriptor, SetActionDescriptor } from './RouteFactory';
import { ActionDescriptor } from './ActionDescriptor';

function getRouteTokens(path: string) {
    var pathArr = path.split('/');
    var arr: string[] = [];
    pathArr.forEach(element => {
        if (element) arr.push(element)
    });
    return arr
}

function find(controllers: any) {
    // console.log('finding all controllers and actions')
    var _reg_controller_names = Object.getOwnPropertyNames(controllers)
    for (var index = 0; index < _reg_controller_names.length; index++) {
        var _reg_controller_name = _reg_controller_names[index];
        // console.log('finded controller:' + _reg_controller_name)
        var _reg_controller_Desc = Object.getOwnPropertyDescriptor(controllers, _reg_controller_name) as PropertyDescriptor
        if (_reg_controller_name === '__esModule') continue;

        var cType = _reg_controller_Desc.value;
        var cName = cType.name;

        var aNames = Object.getOwnPropertyNames(cType.prototype)
        
        for (var index2 = 0; index2 < aNames.length; index2++) {
            var aName = aNames[index2];
            if (aName === 'constructor') continue;
            var aType = (Object.getOwnPropertyDescriptor(cType.prototype, aName) as PropertyDescriptor).value
            SetActionDescriptor(cName, aName, undefined, undefined, _reg_controller_name, cType, aType)
           
        }
    }
}

/**
 * 请求处理中间件
 * 
 * @export
 * @param {core.Request} req 
 * @param {core.Response} res 
 * @param {(core.NextFunction | undefined)} next 
 */
export function RequestHandler(req: core.Request, res: core.Response, next: core.NextFunction | undefined) {
    var desc: ActionDescriptor = res.locals.actionDescriptor
    if (!desc) {
        return next && next();
    }
    var cname = desc.ControllerName;
    new Promise((reslove, reject) => {
        var cType = desc.ControllerType;//*controller class对象
        var c = new cType(req, res);//new 一个controller 对象出来
        // var actionResult = desc.ActionType.call(c);//调用action方法，指定this对象为新new出来的controller对象。
        var agrs = bindActionParameter(desc.ControllerType, desc.ControllerTypeName as string, desc.ActionType, desc.ActionName as string, req)
        var actionResult = desc.ActionType.apply(c, agrs)
        return reslove(actionResult)
    }).then(actionResult => {
        if (actionResult instanceof ViewResult) {
            var viewName = actionResult.name;
            Promise.resolve(actionResult.data).then(ViewActionResultData => {
                var findViewNamePath = viewName[0] === '/' ? viewName.substr(1) : (cname + '/' + viewName)
                res.render(findViewNamePath, ViewActionResultData, (err, html) => {
                    if (err) {
                        next && next(err);
                    } else {
                        res.send(html);
                        res.end();
                    }
                });
            }).catch(function (viewDataError) {
                next && next(viewDataError);
            });
        } else if (typeof actionResult !== 'undefined') {
            //process object send response json
            if (actionResult instanceof JsonResult)
                actionResult = actionResult.data as any;

            var jsonCallBack = getCompatibleParam(req.query, 'callback') || getCompatibleParam(req.query, 'jsoncallback');
            let resultData = jsonCallBack ? jsonCallBack + '(' + JSON.stringify(actionResult) + ')' : actionResult;
            res.send(resultData);
            res.end()
        } else {
            //process not response or origin response.render or response.send.
            process.nextTick((_res: any) => {
                if (!_res.finished) {
                    _res.end();
                }
            }, res)
        }
    }).catch(processRequestError => {
        next && next(processRequestError);
    })

}
/**
 * 路由选择处理中间件
 * 
 * @export
 * @param {core.Express} app 
 * @param {*} controllers 
 */
export function RouteHandler(app: core.Express, controllers: any) {
    find(controllers)

    app.use('/', (req, res, next) => {
        var ua = req.header('user-agent') || '';
        var clientVersionInfo: any = {};
        clientVersionInfo.isWechat = /MicroMessenger/i.test(ua);
        clientVersionInfo.isAndroid = /Android|Linux/i.test(ua);
        clientVersionInfo.isIos = /\(i[^;]+;( U;)? CPU.+Mac OS X/i.test(ua);
        clientVersionInfo.appVersion = ua.match(/appVersion\/[0-9]\.[0-9]\.[0-9]/);
        clientVersionInfo.appVersion = clientVersionInfo.appVersion && clientVersionInfo.appVersion.length ? clientVersionInfo.appVersion[0] : 0;
        var _req: any = req;
        _req.clientVersionInfo = clientVersionInfo;

        var pathArr = getRouteTokens(req.path)

        var controller = (pathArr[0] && pathArr[0].toLowerCase()) || 'home';
        var action = (pathArr[1] && pathArr[1].toLowerCase()) || 'index'

        var desc = GetActionDescriptor(controller, action, req.method)
        if (!desc) {
            desc = GetActionDescriptor(controller, '_default', req.method)
        }
        if (desc && (!desc.HttpMethod || (desc.HttpMethod && desc.HttpMethod === req.method))) {

            res.locals.authInfo = { isAuth: desc.isAuth };
            res.locals.actionDescriptor = desc;
        }
        next && next()
    })
}

export declare type parameterFromType = 'query' | 'body' | 'form' | 'header' | 'cookie' | 'auto'

export class ActionParamDescriptor {
    /**
     * action参数的action名称
     * 
     * @type {string}
     * @memberof ActionParamDescriptor
     */
    actionMethodName: string | undefined
    /**
     * 参数名称
     * 
     * @type {string}
     * @memberof ActionParamDescriptor
     */
    parameterName: string | undefined
    /**
     * 参数所在类
     * 
     * @type {Object}
     * @memberof ActionParamDescriptor
     */
    target: Object | undefined
    /**
     * 参数类型的类别
     * 
     * @type {('complex' | 'simple')}
     * @memberof ActionParamDescriptor
     */
    parameterTypeType: 'complex' | 'simple' | undefined
    /**
     * 参数对象的类型(class)对象
     * 
     * @type {Function}
     * @memberof ActionParamDescriptor
     */
    parameterType: Function | undefined
    /**
     * 参数所在参数类别的顺序
     * 
     * @type {(number | undefined)}
     * @memberof ActionParamDescriptor
     */
    parameterIndex: number | undefined

    /**
     * 当前参数属性属于什么类型
     * 
     * @type {('classProperty'|'methodParameter')}
     * @memberof ActionParamDescriptor
     */
    localtionType: 'classProperty' | 'methodParameter' | undefined
    /**
     * 标记参数应该从什么地方解析
     * 
     * @type {parameterFromType}
     * @memberof ActionParamDescriptor
     */
    parameterFromType: parameterFromType | undefined
}


const fromQueryMetadataKey = Symbol("fromQuery");

/**
 *设置请求处理函数的参数描述配置对象
 *
 * @export
 * @param {ActionParamDescriptor} val
 */
export function SetActionParamDescriptor(val: ActionParamDescriptor) {
    (val as any).targetName = (val.target as Object).constructor.name
    if (val.parameterType) (val as any).parameterTypeName = val.parameterType.name
    console.log('SetActionParamDescriptor', JSON.stringify(val));
    var arr: ActionParamDescriptor[] = [];
    if (val.localtionType === 'methodParameter') {
        arr = Reflect.getMetadata(fromQueryMetadataKey,(val.target as Object), (val.actionMethodName as string)) || [];
        arr.push(val);
        Reflect.defineMetadata(fromQueryMetadataKey, arr, (val.target as Object), (val.actionMethodName as string));
    } else {
        arr = Reflect.getMetadata(fromQueryMetadataKey, (val.target as Object)) || [];
        arr.push(val);
        Reflect.defineMetadata(fromQueryMetadataKey, arr, (val.target as Object));
    }
}


function bindActionParameter(controllerType: Function, controllerName: string, actionType: Object, actionName: string, req: core.Request) {

    var arr = Reflect.getMetadata(fromQueryMetadataKey, controllerType.prototype, actionName) || [] as ActionParamDescriptor[];
    var args = [arr.length];
    for (let index = 0; index < arr.length; index++) {
        args[arr[index].parameterIndex as number] = getParameterValue(req, arr[index], arr[index])
    }
    return args;
}
function bindClassParameter(req: core.Request, target: any, methodParmeterdesc: ActionParamDescriptor): any {
    var arr = Reflect.getMetadata(fromQueryMetadataKey, target.prototype) as ActionParamDescriptor[];
    var obj = new target();
    for (let index = 0; index < arr.length; index++) {
        var desc = arr[index];
        obj[(desc.parameterName as string)] = getParameterValue(req, desc, methodParmeterdesc);
    }
    return obj;
}
function getParameterValue(req: core.Request, desc: ActionParamDescriptor, methodParmeterdesc: ActionParamDescriptor): any {

    if (desc.parameterTypeType === 'simple' || (desc.localtionType === 'methodParameter' && desc.parameterFromType === 'body')) {
        return getparameterInRequest(desc.parameterFromType, desc.parameterName, req, methodParmeterdesc);
    } else if (desc.parameterTypeType === 'complex') {
        return bindClassParameter(req, desc.parameterType, methodParmeterdesc)
    }
    else throw Error('not support parameter type ' + desc.parameterTypeType)
}

function getparameterInRequest(fromType: parameterFromType, parameterName: string, req: core.Request, methodParmeterdesc: ActionParamDescriptor): any {
    switch (fromType) {
        case 'query':
            return getCompatibleParam(req.query, parameterName)
        case 'body':
            return req.body
        case 'header':
            return getCompatibleParam(req.headers, parameterName)
        case 'cookie':
            return getCompatibleParam(req.cookies, parameterName)
        case 'form':
            return getCompatibleParam(req.body, parameterName)
        case 'auto':
            return getparameterInRequest((methodParmeterdesc as any).parameterFromType, parameterName, req, methodParmeterdesc);
    }
    return undefined;
}

function getCompatibleParam(obj: any, propertyName: string) {
    var lower = propertyName.toLowerCase();
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && key.toLowerCase() == lower) {
            return obj[key];
        }
    }
}