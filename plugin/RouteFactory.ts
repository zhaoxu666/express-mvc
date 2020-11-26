import { ActionDescriptor } from './ActionDescriptor';



/**
 *获得当前请求匹配的请求处理函数描述对象
 *
 * @export
 * @param {string} controllerName 路由中的controller name
 * @param {string} actionName 路由中的 action name
 * @param {string} [method] 请求的 httpmethod
 * @returns {(ActionDescriptor | undefined)}
 */
export function GetActionDescriptor(controllerName: string, actionName: string, method?: string): ActionDescriptor | undefined {
    if (!_dic_buid_routes) build();

    var c = _dic_buid_routes.get(controllerName)
    if (!c)
        return;
    var a = c.get(actionName + (method ? '_' + method.toLowerCase() : ''));
    if (!a)
        a = c.get(actionName)
    return a;
}
function build() {
    _dic_buid_routes = new Map<string, Map<string, ActionDescriptor>>();
    _dic_override.forEach((v, k, m) => {
        if (v.size <= 0)
            return;
        var cname = '';
        var aMap = new Map<string, ActionDescriptor>();
        v.forEach((av, ak, am) => {
            cname = av.ControllerName;
            aMap.set(av.Id.toLowerCase(), av);
        })
        _dic_buid_routes.set(cname.toLowerCase(), aMap)
    })
}

/**
 *
 *
 * @export
 * @param {string} controllerTypeName 控制器类型名字
 * @param {string} actionTypeName 方法类型名字
 * @param {string} [httpMethod] 请求方法类型
 * @param {string} [actionName] 路由action名字
 * @param {string} [controllerName] 路由控制器名字
 * @param {*} [controllerType] 控制器对象
 * @param {*} [actionType] action 对象
 * @returns {ActionDescriptor}
 */
export function SetActionDescriptor(controllerTypeName: string, actionTypeName: string, httpMethod?: string, actionName?: string, controllerName?: string, controllerType?: any, actionType?: any, isAuth?: boolean): ActionDescriptor {
    var _actions = _dic_override.get(controllerTypeName)
    if (!_actions) {
        _actions = new Map<string, ActionDescriptor>();
        _dic_override.set(controllerTypeName, _actions)
    }
    var _action = _actions.get(actionTypeName);
    if (!_action) {
        _action = new ActionDescriptor();
        _actions.set(actionTypeName, _action)
    }
    _action.ControllerTypeName = controllerTypeName;
    _action.ActionTypeName = actionTypeName;

    if (!_action.ActionName)
        _action.ActionName = actionTypeName

    if (httpMethod)
        _action.HttpMethod = httpMethod.toUpperCase();

    if (controllerType)
        _action.ControllerType = controllerType;
    if (controllerName)
        _action.ControllerName = controllerName;

    if (actionName)
        _action.ActionName = actionName;
    if (actionType)
        _action.ActionType = actionType

    if (isAuth === true || isAuth === false)
        _action.isAuth = isAuth;

    _action.Id = _action.ActionName + (_action.HttpMethod ? ('_' + _action.HttpMethod) : '')

    return _action
}


let _dic_override = new Map<string, Map<string, ActionDescriptor>>();
let _dic_buid_routes: Map<string, Map<string, ActionDescriptor>>;
