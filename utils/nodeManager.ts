const request = require('../utils/request')
const redis = require('redis')
const RedisConfig = require('../config/config')

interface NodeCacheValue {
    host: string,
    port: number,
    password: string
}

interface NodeDto {
    NodeTypeId: number,
    TypeName: string,
    Id: number,
    Name: string,
    Others: string,
    Address: string,
    Emails: string,
    RemoteAddress: string
}

const NodeCache: Map<string, NodeDto> = new Map()

async function getNode(theNodeName:string) {
    var nodeName = theNodeName.trim()
    let cacheKey = ''
    let index = 0;
    //避免传入了ApplicationGlobal.CurrentNodeName
    //已经有冒号就不用再添加systemType
    if ((index=nodeName.indexOf(":")) > -1) {
        cacheKey = nodeName;
        nodeName = nodeName.substring(0, index);
    } else {
        if ((RedisConfig.SystemType!=='') && RedisConfig.SystemType !== "0") {
            cacheKey = nodeName + ":" + RedisConfig.SystemType;
        } else {
            cacheKey = nodeName;
        }
    }
    if (NodeCache.has(cacheKey)){
        return NodeCache.get(cacheKey)!
    } else {
        let data  = await requestConfigCenter(nodeName,cacheKey)
        return data
    }
}

function requestConfigCenter (nodeName:string, cacheKey:string): Promise<any> {
    return new Promise(( resolve, reject ) => {
        request({
            url: RedisConfig.ConfigCenterServiceAddress,
            method: 'GET',
            params: {
              password: RedisConfig.ConfigCenterPassword,
              nodeName: nodeName,
              systemType: RedisConfig.SystemType
            }
          })
          .then((data:any) => {
            if (!data.Address) { reject() }
            // 处理地址字段 获取到 redis 端口，地址， 密码
            NodeCache.set(cacheKey, data)
            resolve(data)
          })
          .catch((err:any) => {
            reject(err)
          })
    })
}

function handleRedisAddress (address:string):NodeCacheValue {
    if (!address) throw new Error('address is required')
    let array = address.split(',');
    let passwordItem;
    let hostportItem;

    for (const item of array) {
        if (item.indexOf("password") > -1) {
            passwordItem = item;
        } else if (item.indexOf(':') > -1) {
            hostportItem = item;
        }
    }

    let hostportItemArray: Array<string> = [];
    if (hostportItem != null) {
        hostportItemArray = hostportItem.split(':');
    }

    let password:string = '';
    if (passwordItem != null) {
        password = passwordItem.split('=')[1];
    }

    let host = hostportItemArray[0].trim();
    let port:number = Number(hostportItemArray[1].trim());
    return { host, port, password }
 }

class NodeManager {
    constructor(){
        getRedis()
    }
    public GetNode(theNodeName:string) {
        return getNode(theNodeName)
    }
}

 
async function getRedis(){
    let redisNode = await getNode(RedisConfig.RedisEventBus)
    let {port, host, password } = handleRedisAddress(redisNode.Address)
    let client = redis.createClient(port, host)
    let publisher = redis.createClient(port, host)
    publisher.auth(password, function () {
        console.log("redis publisher connected!");
    })
    client.auth(password, function () {
        console.log("redis client connected!");
    });

     //客户端连接redis成功后执行回调
     client.on("ready",  () => {
        //订阅消息
        client.subscribe(RedisConfig.NodeConfigChanged);
        console.log("订阅成功。。。");
    });
    
    client.on("error", (error: any) => {
        console.log("Redis Error " + error);
    });

    //监听订阅成功事件
    client.on("subscribe", (channel:string, count:any) => {
        console.log("this.client subscribed to " + channel + "," + count + "total subscriptions");
    });

    //收到消息后执行回调，message是redis发布的消息
    client.on("message",  (channel:string, nodeName:string) => {
        console.log("我接收到信息了");
        console.log(NodeCache.get(nodeName))
        // 添加到本地缓存
        NodeCache.delete(nodeName)
        console.log(NodeCache.get(nodeName))
    });

    //监听取消订阅事件
    client.on("unsubscribe",  (channel:string, count:any) => {
        console.log("this.client unsubscribed from" + channel + ", " + count + " total subscriptions")
    });

}


let nodeManager = new NodeManager()

export default nodeManager