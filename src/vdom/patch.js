export function patch (oldVode, vnode) {
  if (!oldVode) {
    return createEl(vnode)
  }

  // oldVode 是真实元素，代表初次渲染
  if (oldVode.nodeType === 1) {
    // console.log('初次渲染')
    const parent = oldVode.parentNode
    const element = createEl(vnode)
    // console.log('element', element)
    parent.insertBefore(element, oldVode.nextSibling)
    parent.removeChild(oldVode)
    return element
  } else {
    // 更新
    // console.log(oldVode, vnode)
    // 如果新旧vnode的tag不一样，删掉旧节点，插入新节点
    if (oldVode.tag !== vnode.tag) {
      return oldVode.el.parentNode.replaceChild(createEl(vnode), oldVode.el)
    }

    // 相同的节点，更新属性
    let el = vnode.el = oldVode.el // 新的 vnode 的 el 直接复用 oldVnode 的 el
    patchProps(vnode, oldVode.data)

    // 新旧节点都是文本
    if (vnode.tag === undefined) {
      if (vnode.text !== oldVode.text) {
        el.textContent = vnode.text
      }
      return
    }

    const oldChildren = oldVode.children
    const children = vnode.children
    if (children.length > 0 && oldChildren.length > 0) {
      // oldVnode 和 vnode 都有子节点
      patchChildren(el, oldChildren, children)
    } else if (oldChildren.length > 0) {
      // oldVnode 有子节点，vnode 没有子节点，直接删除子节点
      el.innerHTML = ''
    } else if (children.length > 0) {
      // oldVnode 没有子节点，vnode 有子节点，插入子节点
      for (let i = 0; i < children.length; i++) {
        el.appendChild(createEl(children[i]))
      }
    }
    return el
  }
}

function createKeyToOldIdx (children, startIndex, endIndex) {
  let map = {}
  let i, key
  for (i = startIndex; i <= endIndex; i++) {
    key = children[i].key
    if (key) {
      map[key] = i
    }
  }
  return map
}

function patchChildren(el, oldChildren, newChildren) {
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]
  
  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 在乱序比对中，如果在映射表找到旧节点，会被移走，且该位置会被置为 null
    // 所以 oldStartVnode 为 null，旧指针 oldStartIndex 往后移；oldEndVnode 为 null，指针 oldEndIndex 就往前移
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    }
    if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    }

    if (isSameVnode(oldStartVnode, newStartVnode)) {
      console.log('a')
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      console.log('b')
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
      console.log('c')
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      console.log('d')
      patch(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // 乱序比对
      // 创建旧节点的映射表
      let oldKeyToIdx = createKeyToOldIdx(oldChildren, oldStartIndex, oldEndIndex)
      let moveIndex = oldKeyToIdx[newStartVnode.key]
      // 如果在映射表中没有找到，说明是新增的节点，直接插入到oldStartVnode前面
      if (!moveIndex) {
        el.insertBefore(createEl(newStartVnode), oldStartVnode.el)
      } else {
        // 将映射表中找到的节点插入到oldStartVnode前面，并且将改 moveIndex 的节点置为 null
        let moveVnode = oldChildren[moveIndex]
        oldChildren[moveIndex] = null
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        patch(moveVnode, newStartVnode)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  // 新节点还有剩余的，插入新节点
  if (oldStartIndex > oldEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // console.log('insert', newStartIndex, newEndIndex)
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null
      el.insertBefore(createEl(newStartVnode), anchor) // insertBefore 保证插入节点的位置顺序
    }
  } else if (newStartIndex > newEndIndex) {
    // 旧节点还有剩余的，删掉旧节点，但是在乱序比对的时候，有置为 null 的情况，所以遇到 null 的跳过
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // console.log('remove', oldStartIndex, oldEndIndex)
      if (oldChildren[i]) {
        el.removeChild(oldChildren[i].el)
      }
    }
  }
}

function isSameVnode (oldVnode, vnode) {
  return (oldVnode.tag === vnode.tag) && (oldVnode.key === vnode.key)
}

function createComponent (vnode) {
  let i = vnode.data
  if ((i = i?.hook) && (i = i.init)) {
    i(vnode) // 调用 vnode.data.hook.init 方法
  }
  if (vnode.componentInstance) {
    return true
  }
}

export function createEl (vnode) {
  const { vm, tag, data, children, text} = vnode
  if (typeof tag === 'string') {
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el
    }
    vnode.el = document.createElement(tag)
    patchProps(vnode)
    children && children.forEach(child => {
      vnode.el.appendChild(createEl(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps (vnode, oldProps) {
  let props = vnode.data || {}
  const el = vnode.el

  // 如果旧的属性有，新的属性没有，直接删除
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key)
    }
  }

  // 对比 style，style 原来有，现在没有的值删掉
  const oldStyle = oldProps?.style || {}
  const newStyle = props.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }

  // 添加新的属性
  Object.keys(props).forEach(attrName => {
    const attrValue = props[attrName]
    if (attrName === 'style') {
      for (let key in attrValue) {
        el.style[key] = attrValue[key]
      }
    } else {
      el.setAttribute(attrName, attrValue)
    }
  })
}