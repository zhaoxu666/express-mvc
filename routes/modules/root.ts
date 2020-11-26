import { Router, Request, Response } from  'express'
import NodeManage from '../../utils/nodeManage'
import NodeManager from '../../utils/nodeManager'
const router: Router = Router()
// let nodeManage:any

router.get('/', async (req: Request, res: Response) => {
    // if(nodeManage) {
    //     nodeManage.cancelRedis('Redis.TempData')
    // }
    // nodeManage = new NodeManage('Redis.TempData')
   let info = await NodeManager.GetNode('Redis.TempData')
    res.send(JSON.stringify(info))
})



router.get('/info', (req: Request, res: Response) => {
    res.send('info Page')
})

module.exports = router;
