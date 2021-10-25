import { isObject } from "../utils";
import { arrayMethods } from "./array";
import Dep from "./dep";

class Observer {
  constructor (data) {
    this.dep = new Dep() // 这里不论 data 是数组还是对象都没有关系
    // __ob__ 必须是不可枚举的，不然会死循环，因为 walk 方法里也会对 __ob__ 做响应式
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      value: this
    })
    if (Array.isArray(data)) {
      // 数组直接改写原型
      data.__proto__ = arrayMethods
      // 如果是对象数组，我们需要观测数组的每一项
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }

  observeArray(data) {
    data.forEach(item => {
      observe(item)
    })
  }

  walk(data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

function dependArray (value) {
  if (!Array.isArray(value)) return
  for (let i = 0; i < value.length; i++) {
    const current = value[i]
    current && current.__ob__ && current.__ob__.dep.depend()
    dependArray(current)
  }
}

function defineReactive (data, key, value) {
  const childOb = observe(value)
  const dep = new Dep()
  Object.defineProperty(data, key, {
    get () {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend() // 给数组收集依赖
          // 多维数组收集依赖
          dependArray(value)
        }
      }
      console.log('get', key, dep)
      return value
    },
    set (newVal) {
      console.log('set', key, value, newVal, dep)
      if (newVal === value) return
      value = newVal
      observe(newVal)
      dep.notify()
    }
  })
}

export function observe (data) {
  if (!isObject(data)) return
  // __ob__ 属性代表已经被观测了
  if (data.__ob__) return data.__ob__
  return new Observer(data)
}