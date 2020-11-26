
const request = require('../utils/request')
const redis = require('redis')
const RedisConfig = require('../config/config')

interface NodeCacheValue {
    host: string,
    port: number,
    password: string
}

const NodeCache:Map<string, NodeCacheValue> = new Map()

class NodeManage {
     nodeCache: Map<string, NodeCacheValue>
     nodeName: string
     cacheKey: string
     systemType: number
     index: number = 0
     client: any
     publisher: any
    nodeCacheData: NodeCacheValue
     constructor(theNodeName: string) {
        this.nodeName = theNodeName
        this.systemType = RedisConfig.SystemType
        this.cacheKey = ""
        this.nodeCacheData = { port: 0, password: '', host: ''}
        this.nodeCache = NodeCache
        this.init()
     }

     public async init () {
        this.handleNodeName()
        let nodeCacheData:NodeCacheValue
        // 判断本地缓存是否存在
        if(this.nodeCache.has(this.cacheKey)) {
            console.log('第二次应该走这里..')
            nodeCacheData = this.nodeCache.get(this.cacheKey) || this.nodeCacheData
        } else {
            console.log('第一次应该走这里..')
            // 请求配置中心
            let nodeData:any = await this.getNode()
            // 处理 返回数据 获取 port host password
            nodeCacheData = this.handleRedisAddress(nodeData.Address)
            // 添加到本地缓存
            this.nodeCache.set(this.cacheKey, nodeCacheData)
        }
        // 创建 redis
        this.initRedis(nodeCacheData)
        this.subscribleRedis(this.cacheKey)
        setTimeout(() => {
            // 发布 redis 监听
            let newMessage:NodeCacheValue = {port: 63798, host: '10.255.98.1555', password: 'Cbc2020redis' }
            this.publishRedis(this.cacheKey, this.ObjectToBuffer(newMessage))
          },5000)
     }

     public getNode() {
        return new Promise(( resolve, reject ) => {
            request({
                url: RedisConfig.ConfigCenterServiceAddress,
                method: 'GET',
                params: {
                  password: RedisConfig.ConfigCenterPassword,
                  nodeName: this.nodeName,
                  systemType: this.systemType
                }
              })
              .then((data:any) => {
                if (!data.Address) { reject() }
                // 处理地址字段 获取到 redis 端口，地址， 密码
                this.nodeCache.set(this.cacheKey, this.handleRedisAddress(data.Address))
                resolve(data)
              })
              .catch((err:any) => {
                reject(err)
              })
        })
     }
     // 处理 cacheKey 和 nodeName
     private handleNodeName () {
        if ((this.index = this.nodeName.indexOf(':')) > -1) {
            this.cacheKey = this.nodeName
            this.nodeName = this.nodeName.substring(0, this.index)
        } else {
            if (this.systemType) {
                this.cacheKey = `${ this.nodeName }:${ this.systemType }`
            } else {
                this.cacheKey = this.nodeName
            }
        }
     }
     // 处理 redis Address 将 port,password,host 分离
     private handleRedisAddress (address:string):NodeCacheValue {
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
     // 初始化 redis 创建 双端
     public initRedis (nodeCache: NodeCacheValue) {
        let {port, host, password } = nodeCache
        this.client = redis.createClient(port, host)
        this.publisher = redis.createClient(port, host)
        this.publisher.auth(password, function () {
            console.log("redis publisher connected!");
        })
        this.client.auth(password, function () {
            console.log("redis client connected!");
        });
     }

     public subscribleRedis (channel: string) {
        //客户端连接redis成功后执行回调
        this.client.on("ready",  () => {
            //订阅消息
            this.client.subscribe(channel);
            console.log("订阅成功。。。");
        });
        
        this.client.on("error", (error: any) => {
            console.log("Redis Error " + error);
        });

        //监听订阅成功事件
        this.client.on("subscribe", (channel:string, count:any) => {
            console.log("this.client subscribed to " + channel + "," + count + "total subscriptions");
        });
    
        //收到消息后执行回调，message是redis发布的消息
        this.client.on("message",  (channel:string, message:string) => {
            console.log("我接收到信息了");
            console.log(this.nodeCache.get(this.cacheKey))
            // 添加到本地缓存
            this.nodeCache.set(this.cacheKey, JSON.parse(message))
            console.log(this.nodeCache.get(this.cacheKey))
        });
    
        //监听取消订阅事件
        this.client.on("unsubscribe",  (channel:string, count:any) => {
            console.log("this.client unsubscribed from" + channel + ", " + count + " total subscriptions")
        });
     }

     public publishRedis (channel: string, message: any) {
    this.publisher.publish(channel, message)
     }
    
     public cancelRedis (channel: string) {
      this.client.unsubscribe(channel)
     }

     public ObjectToBuffer (obj: NodeCacheValue) {
        let JsonStr = JSON.stringify(obj)
        let targetBuffer = Buffer.from(JsonStr)
        return targetBuffer
     }
     
}


export default NodeManage