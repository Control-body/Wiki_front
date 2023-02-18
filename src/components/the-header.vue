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
      <a-menu-item key="/admin/user" >
        <router-link to="/admin/user" >用户管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/ebook" >
        <router-link to="/admin/ebook">电子书管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/category"  >
        <router-link to="/admin/category">分类管理</router-link>
      </a-menu-item>
      <a-menu-item key="/about">
        <router-link to="/about">关于我们</router-link>
      </a-menu-item>
      <a-menu-item >
        <a>
          <span>您好: {{user.name}}</span>
        </a>
      </a-menu-item>
      <a-menu-item >
        <a class="login-menu" @click="showLoginModal">
          <span>登录</span>
        </a>
      </a-menu-item>
      <a-menu-item >
        <a-popconfirm
            title="确定推出登录?"
            ok-text="是"
            cancel-text="否"
            @confirm="logout()"
        >
          <a class="login-menu">
            <spam>退出登录</spam>
          </a>
        </a-popconfirm>

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
import {computed, defineComponent, ref} from 'vue';
import axios from "axios";
import {message} from "ant-design-vue";
import store from "@/store";
declare let hexMd5: any;
declare let KEY: any;
  export default defineComponent({
    name: 'the-header',
    setup(){
      const user=computed(()=>store.state.user);
      // const user=ref();
      // //先定义默认的值, 避免空指针异常
      // user.value={};
      const loginUser=ref({
        loginName:"test",
        password:"test"
      });
      const LoginVisible=ref(false);
      const LoginLoading=ref(false);
      const   showLoginModal=()=>{
        LoginVisible.value=true;
      };
      const login=()=>{
        console.log("开始登录");
        LoginLoading.value=true;
        //修改用户填入的密码进行加密处理
        loginUser.value.password=hexMd5(loginUser.value.password+KEY);
        axios.post('/user/login',loginUser.value).then((response)=>{
          LoginLoading.value=false;
          const data=response.data;
          if(data.success){
            LoginVisible.value=false;
            message.success("登录成功!")
            store.commit("setUser",data.content)
          }else {
            message.error(data.message);
          }
        })
      }

      const logout=()=>{
        console.log("开始退出登录");
        axios.get('/user/logout/'+user.value.token).then((response)=>{
          const data=response.data;
          if(data.success){
            message.success("退出登录成功!")
            // user.value=data.content;
            store.commit("setUser",{})
          }else {
            message.error(data.message);
          }
        })
      }
      return {
        user,
        loginUser,
        login,
        LoginLoading,
        LoginVisible,
        showLoginModal,
        logout

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
