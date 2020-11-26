
/**
 *视图结果对象
 *
 * @export
 * @class ViewResult
 */
export class ViewResult {
    name: string
    data: any
    constructor(name: string, data: any) {
        this.name = name
        this.data = data
    }
}

/**
 *json数据结果对象
 *
 * @export
 * @class JsonResult
 */
export class JsonResult {
    data: any
    constructor(data: any) {
        this.data = data
    }
}