import { popTarget, pushTarget, stack } from "./dep"
import { queueWatcher } from "./scheduler"

let id = 0

class Watcher {
  constructor (vm, expOrFn, cb, options) {
    this.id = id++
    this.vm = vm
    if (typeof expOrFn === 'string') {
      // watch watcher，expOrFn => 'name' 'age.n'
      this.getter = function () {
        const path = expOrFn.split('.')
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj // 依赖收集，收集用户 watcher
      }
    } else {
      // 对于渲染 watcher ，expOrFn 就是渲染更新的方法
      // 对于 computed watcher ，expOrFn 函数里面就是取值
      this.getter = expOrFn
    }
    this.cb = cb
    this.options = options
    this.userWatcher = !!options.user
    this.lazy = !!options.lazy
    this.dirty = !!options.lazy
    this.deps = []
    this.depId = new Set()

    // 初始化的时候先执行一次，渲染页面；但是 computed watcher 初始化的时候默认是不执行的
    this.value = this.lazy ? undefined : this.get()
  }

  get () {
    pushTarget(this)
    console.log('this', this)
    const value = this.getter.call(this.vm)
    popTarget()
    return value
  }

  addDep (dep) {
    // 模板里多次取同一个属性，我们只需要存它一个 dep 就可以
    if (!this.depId.has(dep.id)) {
      this.depId.add(dep.id)
      this.deps.push(dep)
      // dep 里存 watcher
      dep.addSub(this)
    }
  }

  // 比如修改组件里多个属性的值，会对此调用 update 方法，但是我们组件是异步更新的，所以把所有的 watcher 用队列来收集
  update () {
    // console.log('xx')
    // this.get()
    if (this.lazy) { 
      // computed watcher
      // 调用 update 方法，表示计算属性依赖的值改变了
      this.dirty = true
    } else {
      queueWatcher(this) // 异步更新
    }
  }

  run () {
    let oldValue = this.value
    let newValue = this.get()

    this.value = newValue
    this.userWatcher && this.cb.call(this.vm, newValue, oldValue) // 用户 watcher 的 callback 里的 this 是指向 Vue 实例的
  }

  // computed watcher 使用
  evaluate () {
    this.dirty = false
    this.value = this.get()
  }

  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend() // 计算属性里面依赖的data里的属性也要收集渲染 watcher
    }
  }
}

export default Watcher