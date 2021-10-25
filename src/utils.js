export function isFunction (val) {
  return typeof val === 'function'
}

export function isObject (val) {
  return typeof val === 'object' && val !== null
}

let callbacks = []
let waiting = false

function flushCallback () {
  callbacks.forEach(cb => cb())
  waiting = false
}

export function nextTick (cb) {
  callbacks.push(cb)

  if (!waiting) {
    // 这里 Vue2 的做法是优雅降级：Promise -> MutationObserver -> setImmediate -> setTimeout
    Promise.resolve().then(flushCallback)
    waiting = true
  }
}

const lifecycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestory',
  'destoryed'
]

let strats = {}

function mergeHook (parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

lifecycleHooks.forEach(hook => {
  strats[hook] = mergeHook
})

// 组件是继承关系(继承父组件的原型)，自己没有找到，就往父级上找
strats.components = function (parentVal, childVal) {
  let options = Object.create(parentVal)
  if (childVal) {
    for (let key in childVal) {
      options[key] = childVal[key]
    }
  }
  return options
}

export function mergeOptions (parent, child) {
  const options = {}

  for (let key in parent) {
    mergeField(key)
  }

  for (let key in child) {
    // 当前 key 已经在父亲里处理过了
    if (parent.hasOwnProperty(key)) continue
    mergeField(key)
  }

  function mergeField (key) {
    let parentVal = parent[key]
    let childVal = child[key]
    
    // 策略模式
    if (strats[key]) {
      options[key] = strats[key](parentVal, childVal)
    } else {
      // 父子都有值
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = {
          ...parentVal,
          ...childVal
        }
      } else {
        options[key] = childVal || parentVal
      }
    }
  }

  return options
}

// 判断是否是原生的HTML标签
export function isReservedTag (tag) {
  let reservedTag = 'a,div,span,button,ul,li'
  // 源码是建立了一个映射表：{a:true,div:true}
  return reservedTag.includes(tag)
}