let id = 0

class Dep {
  constructor () {
    this.id = id++
    this.subs = []
  }

  depend () {
    // dep 上要存放 watcher ，watcher 也要存放 dep
    // dep 和 watcher 之间是多对多的关系
    if (Dep.target) {
      // Dep.target -> watcher
      Dep.target.addDep(this)
    }
  }

  addSub (watcher) {
    // 这里是 data 中属性对应的 watcher
    this.subs.push(watcher)
  }

  notify () {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}

Dep.target = null

export default Dep

let stack = []

export function pushTarget (watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget () {
  // Dep.target 使用 stack 维护是因为 computed 属性里依赖的 data 里的属性也要收集 渲染 watcher ，不然 data 里的属性的值改变之后，computed 属性的值不会重新渲染
  // computed 不仅要收集自己的 computed watcher，也有收集依赖的 data 里的数据的 watcher
  Dep.target = stack.pop()
  // Dep.target = null
}