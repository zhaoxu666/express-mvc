import { Router, Request, Response } from  'express'
const router: Router = Router()
router.get('/', (req: Request, res: Response) => {
    let someStr:string = "this is a string"
    let strLen: number = (<string>someStr).length
    console.log(strLen)

    let [, second, , fourth] = [1, 2, 3, 4]
    console.log(second,fourth)  // outputs  2 4

    let a, b
    ({ a, b } =  { a: 'baz', b: 101})
    console.log(a, b)
    
    let o = {
        a: 'baz', b: 101
    } 
    let {a:newNameA, b:newNameB} = o
    console.log(newNameA, newNameB)

    // 接口

    interface SquareConfig {
        color?: string,
        width?: number
    }

    function createSquare(config: SquareConfig): { color: string; area: number } {
        let newSquare = {color: "white", area: 100};
        if (config.color) {
          newSquare.color = config.color;
        }
        if (config.width) {
          newSquare.area = config.width * config.width;
        }
        return newSquare;
    }

    // let mySquare = createSquare({ colour: "red", width: 100})  报错， 我们在接口定义上，color是个可选值， 但是仍然报错了
    
    // 解决方法1
    let mySquare = createSquare({ colour: "red", width: 100} as SquareConfig)

    // 最佳解决方案

    interface SquareConfigProp {
        color?: string,
        width?: number,
        [propName: string]:any
    }

    function createSquareProp(config: SquareConfigProp): { color: string; area: number } {
        let newSquare = {color: "white", area: 100};
        if (config.color) {
          newSquare.color = config.color;
        }
        if (config.width) {
          newSquare.area = config.width * config.width;
        }
        return newSquare;
    }

    let mySquareProp = createSquareProp({ colour: "red", width: 100})  // 就不会报错了

    // 接口函数类型

    interface SearchFunc {
        (source: string, substring: string) : boolean
    }

    let mySearch: SearchFunc
     mySearch = function (source: string, substring: string): boolean {
         let result = source.search(substring)
         return result > -1
     }

     // 类

     class Animal {
         private name: string
         constructor (theName: string) {
             this.name = theName
         }
         
     }

     class Rhino extends Animal {
         constructor () {
             super("Rhino")
         }
     }

     class Employee {
         private name: string
         constructor (theName: string) {
             this.name = theName
         }
     }

     let animal = new Animal('Goat')
     // console.log(animal.name)  私有属性 不可访问

     let rhino = new Rhino()

     let employee = new Employee('Bob')

     animal = rhino

     // animal = employee  报错

     // 静态属性

     class Grid {
         static origin = { x: 0, y: 0 }
         calculateDistanceFromOrigin (point: {x: number; y: number}) {
             let xDist = (point.x - Grid.origin.x)
             let yDist = (point.y - Grid.origin.y)
             return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale

         }
         constructor (public scale: number) {

         }
     }

     let grid1 = new Grid(1.0)
     let grid2 = new Grid(5.0)

     console.log(grid1.calculateDistanceFromOrigin({x: 10, y: 10}))
     console.log(grid2.calculateDistanceFromOrigin({x: 10, y: 10}))


     // 泛型

     function loggingIdentity<T>(arg: Array<T>): Array<T> {
         console.log(arg.length)
         return arg
     }

    // res.send('Hello typescript test')
})

module.exports = router;
