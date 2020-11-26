import { UserInfo } from './UserInfo';
import { ViewResult, JsonResult } from './ViewResult';
import * as core from "express-serve-static-core";



/**
 *控制器基类
 *
 * @export
 * @class BaseController
 */
export class BaseController {
    constructor(request: core.Request, response: core.Response) {
        this._request = request;
        this._response = response;

        var _req: any = this.Request;
        this._UserInfo = _req.UserInfo;
    }
    /**
     * 当前请求的request对象
     * 
     * @type {core.Request}
     * @memberof BaseController
     */
    private _request: core.Request;
    public get Request(): core.Request {
        return this._request;
    }

    /**
     * 当前请求的response对象
     * 
     * @type {core.Response}
     * @memberof BaseController
     */
    private _response: core.Response;
    public get Response(): core.Response {
        return this._response;
    }
    /**
     * 当前登录的用户
     * 
     * @type {UserInfo}
     * @memberof BaseController
     */
    private _UserInfo: UserInfo;
    public get UserInfo(): UserInfo {
        return this._UserInfo;
    }

    /**
     * 返回view由视图引擎在服务端进行渲染
     * 
     * @param {string} viewName 当前视图的名称
     * @param {*} [viewData] 需要传递给视图的数据
     * @returns {ViewResult} 
     * @memberof BaseController
     */
    public View(viewName: string, viewData?: any): ViewResult {
        return new ViewResult(viewName, viewData)
    }

    /**
     *返回json对象数据
     *
     * @param {*} jsonData
     * @returns {JsonResult}
     * @memberof BaseController
     */
    public Json(jsonData: any): JsonResult {
        return new JsonResult(JsonResult)
    }
}


