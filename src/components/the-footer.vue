<template>
  <a-layout-footer style="text-align: center">
    Control 图书馆！欢迎 {{user.name}}
  </a-layout-footer>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import store from "@/store";

export default defineComponent({
  name: 'the-footer',
  setup(){
    //VUE 中的 监听组件
    const user=computed(()=>store.state.user);
    return {
      user
    }
  }
});
</script>

<style scoped>

</style>
