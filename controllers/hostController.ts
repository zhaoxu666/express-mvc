import { fromQuery, BaseController, get, post, auth, actionName, JsonResult, fromBody, fromForm } from "../plugin";
import {request, response} from 'express'
export class HostController extends BaseController {
    public request:any = request
    public response: any = response
    @get()
    public async index (@fromQuery() id:string) {
        let data = await this.getListAPI()
        console.log(this.request)
        return  new JsonResult({
            data: data
        })
    }

    private getListAPI () {
        return new Promise((resolve, reject) => {
            var dataList = [
                {
                    id:0,
                    name:'VUE'
                },
                {
                    id:1,
                    name:'Angular'
                },
                {
                    id:2,
                    name:'React'
                }
            ]
            setTimeout(() => {
                resolve(dataList)
            }, 3000)
        })
    }

    @post()
    public postDemo ( @fromBody() data:any) {
       console.log(data)
       let result = data
       return new JsonResult(result)
    }

    @auth()
    @post()
    @actionName("saveHost")
    public hostAdd(@fromBody() data:any) {
        console.log(data)
        let result = data
        return new JsonResult(result)
    }

}