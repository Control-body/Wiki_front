<template>
  <a-layout-header class="header">
    <div class="logo" />
    <a-menu
        theme="dark"
        mode="horizontal"

    >
      <a-menu-item key="/">
        <router-link to="/">首页</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/user">
        <router-link to="/admin/user">用户管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/ebook">
        <router-link to="/admin/ebook">电子书管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/category">
        <router-link to="/admin/category">分类管理</router-link>
      </a-menu-item>
      <a-menu-item key="/about">
        <router-link to="/about">关于我们</router-link>
      </a-menu-item>
      <a-menu-item >
        <a class="login-menu" @click="showLoginModal">
          <span>登录</span>
        </a>
      </a-menu-item>


    </a-menu>

  </a-layout-header>


  <!--  跳出的 编辑框 -->
  <a-modal
      v-model:visible="LoginVisible"
      title="登录"
      :confirm-loading="LoginLoading"
      @ok="login"
  >
    <a-form :model="loginUser" :label-col="{span: 6}">
      <a-form-item label="登录名" >
        <a-input v-model:value="loginUser.loginName"/>
      </a-form-item>
      <a-form-item label="密码" >
        <a-input v-model:value="loginUser.password" type="text" />
      </a-form-item>
    </a-form>
  </a-modal>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

  export default defineComponent({
    name: 'the-header',
    setup(){
      const loginUser=ref({
        loginName:"test",
        password:"test"
      });
      const LoginVisible=ref(false);
      const LoginLoading=ref(false);
      const showLoginModal=()=>{
        LoginVisible.value=true;
      };
      const login=()=>{
        console.log("开始登录");
      }
      return {
        loginUser,
        login,
        LoginLoading,
        LoginVisible,
        showLoginModal
      }
    }
  });
</script>
<style>
.login-menu{
  float: right;
  color: white;
}
</style>
