
import { SetActionDescriptor } from './RouteFactory';
import { ActionParamDescriptor, SetActionParamDescriptor, parameterFromType } from './RouteHandler';
/**
 * 标记当前方法只接受post请求
 * 
 * @export
 * @returns 
 */
export function post() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptor(target.constructor.name, propertyKey, 'post')
    }
}
/**
 * 标记当前方法只接受get请求
 * 
 * @export
 * @returns 
 */
export function get() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptor(target.constructor.name, propertyKey, 'get')
    }
}
/**
 * 重写当前方法的名字，请求使用重写后的名字进行调用
 * 
 * @export
 * @param {string} actionName 
 * @returns 
 */
export function actionName(actionName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptor(target.constructor.name, propertyKey, undefined, actionName)
    }
}
/**
 * 指示当前参数从request对象的body中解析
 * 
 * @export
 * @returns {Function} 
 */
export function fromBody(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('body', thatArg, target, propertyKey, parameterIndex);
    }
}
/**
 * 标记class的属性需要自动参数解析
 * 
 * @export
 * @returns {Function} 
 */
export function property(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('auto', thatArg, target, propertyKey, parameterIndex);
    }
}
/**
 *  指示当前参数从request对象的cookie中解析
 * 
 * @export
 * @returns {Function} 
 */
export function fromCookie(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('cookie', thatArg, target, propertyKey, parameterIndex);
    }
}
/**
 *  指示当前参数从request对象的header中解析
 * 
 * @export
 * @returns {Function} 
 */
export function fromHeader(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('header', thatArg, target, propertyKey, parameterIndex);
    }
}
/**
 *  指示当前参数从request对象的form中解析（即form表单提交方式）
 * 
 * @export
 * @returns {Function} 
 */
export function fromForm(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('form', thatArg, target, propertyKey, parameterIndex);
    }
}
/**
 *  指示当前参数从request对象的query中解析
 * 
 * @export
 * @param {(target?: any) => Function} type 
 * @returns {Function} 
 */
export function fromQuery(type: (target?: any) => Function): Function;
/**
 * 指示当前参数从request对象的query中解析
 * 
 * @export
 * @returns {Function} 
 */
export function fromQuery(): Function {
    var thatArg = arguments;
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        makeActionParameterDescriptor('query', thatArg, target, propertyKey, parameterIndex);
    }
}
function makeActionParameterDescriptor(parameterFromType: parameterFromType, thatArg: IArguments, target: Object, propertyKey: string, parameterIndex: number) {
    //非声明在属性和参数上
    if (!propertyKey) return;
    var paramType = undefined;
    var val = new ActionParamDescriptor();
    val.parameterName = propertyKey;
    val.target = target;
    val.parameterIndex = parameterIndex;
    val.parameterFromType = parameterFromType;
    val.parameterTypeType = 'simple'

    if (typeof parameterIndex === 'undefined') {
        //声明在类的属性上
        val.localtionType = 'classProperty'

    } else {
        //声明在action的参数上
        val.localtionType = 'methodParameter'
        val.actionMethodName = propertyKey;
        val.parameterName = getArgs((target as any)[propertyKey])[parameterIndex];

    }
    //复杂类型
    if (thatArg.length > 0) {

        val.parameterTypeType = 'complex'
        val.parameterType = thatArg[0](target);
    }
    SetActionParamDescriptor(val);
}
function getArgs(func: Object) {
    //匹配函数括号里的参数  
    var method = func.toString();
    method = method.length > 500 ? method.substring(0, 500) : method;
    method = method.replace("\r|\n|\\s", "")
    var args = method.match(/.*?\(.*?\)/i);
    if (args == null) throw Error('can not match method parameters');
    method = args[0];
    method = method.replace(/.*?\(|\)/, "").replace(')', '');
    //分解参数成数组  
    var arr = method.split(",").map(function (arg) {
        //去空格和内联注释  
        return arg.replace(/\/\*.*\*\//, "").trim();
    }).filter(function (args) {
        //确保没有undefineds  
        return args;
    });
    return arr
}

/**
 * 标记当前action必须要验证用户登录状态
 * 
 * @export
 * @param {boolean} [isOnlyuserId=false] 
 * @returns 
 */
export function auth() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptor(target.constructor.name, propertyKey, undefined, undefined, undefined, undefined, undefined, true)
    }
}