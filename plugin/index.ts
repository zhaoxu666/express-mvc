export * from './ActionDescriptor'
export * from './BaseController'
export * from './HttpAttributes'
export * from './RouteFactory'
export * from './ViewResult'
export * from './UserInfo'

export * from './RouteHandler'

/**
 * 指示当前参数从request对象的query中解析
 * 
 * @export
 * @param {(target?: any) => Function} type 返回需要绑定的复杂对象的类型，复杂类型对象属性需要由&#64;from**进行标记
 * @returns {Function} 
 */
export declare function fromQuery(type: (target?: any) => Function): Function;
/**
 * 指示当前参数从request对象的query中解析
 * 
 * @export
 * @returns {Function} 
 */
export declare function fromQuery(): Function;


/**
 * 指示当前参数从request对象的body中解析
 * 
 * @export
 * @returns {Function} 
 */
export declare function fromBody(): Function;