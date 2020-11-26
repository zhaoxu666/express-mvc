const axios = require('axios')

// 创建axios 实例
const service = axios.create({
    // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url 配置baseURL
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout 超时时间
})

// 请求拦截
service.interceptors.request.use(
    <T>(config: T): T => {
      return config
    },
    (error: any) => {
      console.log(error) // for debug
      return Promise.reject(error)
    }
)

// 响应拦截
service.interceptors.response.use(
    (response: any) => {
      const res = response.data
      return res
    },
    (error: any) => {
      console.log('err' + error) // for debug
      return Promise.reject(error)
    }
  )
  
  module.exports =  service