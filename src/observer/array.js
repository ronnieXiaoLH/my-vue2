let arrayPrototype = Array.prototype

export let arrayMethods = Object.create(arrayPrototype)

const methods = [
  'push',
  'pop',
  'unshift',
  'shift',
  'sort',
  'reverse',
  'splice'
]

methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    arrayPrototype[method].apply(this, args)
    // 如果新增的内容是对象，也要对对象做响应式处理
    let inserted // 新增的内容
    let ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }
    if (inserted) {
      ob.observeArray(inserted)
    }
    ob.dep.notify()
  }
})