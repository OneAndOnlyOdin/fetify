declare module '*.css' {
  const mod: any
  namespace mod {}
  export = mod
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'v-click-outside' {
  const mod: any
  namespace mod {}
  export = mod
}
