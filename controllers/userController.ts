import { BaseController, get, post, auth, actionName, JsonResult, fromQuery } from "../plugin";

export class UserController extends BaseController {
    @get()
    public getInfo (@fromQuery() username:string, @fromQuery() password: string) {
        console.log(username, password)
        let data = {
            name: '谢大脚',
            age: 41,
            sex: '女'
        }
        return new JsonResult({data})
    }
}