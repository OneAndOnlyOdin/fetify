type Toast = {
  type?: 'default' | 'info' | 'warn' | 'success' | 'error'
  message: string
  title?: string
}

export type ToastState = {
  toasts: Array<Toast & { id: number; ttl: Date }>
}

export const state: ToastState = {
  toasts: [],
}

let id = 0
export function raise(toast: Toast) {
  state.toasts.push({
    ...toast,
    title: getTitle(toast),
    id: ++id,
    type: toast.type || 'default',
    ttl: removeAt(),
  })
}

function removeAt() {
  return new Date(Date.now() + 3500)
}

setInterval(() => {
  let index = 0
  const now = new Date()
  while (index < state.toasts.length) {
    if (now > state.toasts[index].ttl) {
      state.toasts.splice(index, 1)
      continue
    }

    index++
  }
}, 500)

function getTitle(toast: Toast) {
  if (toast.title) return toast.title
  switch (toast.type) {
    case 'default':
    case 'info':
      return 'Info'

    case 'warn':
      return 'Warning'

    case 'success':
      return 'Success'

    case 'error':
      return 'Error'
  }
}
