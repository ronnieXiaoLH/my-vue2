import { observe } from "./observer"
import Dep from "./observer/dep"
import Watcher from "./observer/watcher"
import { isFunction, isObject } from "./utils"

export function stateMixin (Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true // 用户自定义的 watcher , 和渲染 watcher 区分开
    new Watcher(this, key, handler, options)
  }
}

export function initState (vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm, opts.computed)
  }
  if (opts.watch) {
    initWatch(vm, opts.watch)
  }
}

function proxy (vm, source, key) {
  Object.defineProperty(vm, key, {
    get () {
      return source[key]
    },
    set (newVal) {
      if (newVal === source[key]) return
      source[key] = newVal
    }
  })
}

function initData (vm) {
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm) : data

  // 把 data 的数据代理到 vm 上
  for (let key in data) {
    proxy(vm, data, key)
  }

  // 响应式数据
  observe(data)
}

function initWatch (vm, watch) {
  Object.keys(watch).forEach(key => {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  })
}

function createWatcher (vm, key, handler) {
  return vm.$watch(key, handler)
}

function initComputed (vm, computed) {
  let watchers = vm._computedWatchers = {}
  Object.keys(computed).forEach(key => {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? computed[key] : computed[key].get

    // 每个计算属性本质也是 watcher
    // 一个计算属性就是一个 watcher
    watchers[key] = new Watcher(vm, getter, () => {}, {lazy: true})

    // 把 computed 里的 key 挂载到 vm 上
    defineComputed(vm, key, userDef)
  })
}

function createComputedGetter (key) {
  return function computedGetter () {
    console.log('computed', key)
    // debugger
    const watcher = this._computedWatchers[key]
    // watcher.dirty 标记一下是否需要重新取值
    if (watcher.dirty) {
      console.log('computed get', key)
      // 重新取值，且将 dirty 的值置为 false
      watcher.evaluate()
    }
    console.log('Dep.target', Dep.target)
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

function defineComputed(vm, key, userDef) {
  let sharedProperty = {}
  if (typeof userDef === 'function') {
    sharedProperty.get = createComputedGetter(key)
  } else {
    sharedProperty.get = createComputedGetter(key)
    sharedProperty.set = userDef.set
  }
  Object.defineProperty(vm, key, sharedProperty)
}