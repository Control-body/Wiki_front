import { createStore } from 'vuex'

declare let SessionStorage : any
const USER="USER"
const  store=createStore({
  state: {
    user:SessionStorage.get(USER)||{}
  },
  // 只能同步
  mutations: {
    setUser (state,user){
      state.user=user
      SessionStorage.set(USER,user)
    }
  },
  //可以异步的
  actions: {
  },
  modules: {
  }
})
export default store ;
