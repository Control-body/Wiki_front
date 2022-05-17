<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #fff">
       <a-menu
           @click="handleClick"
        mode="inline"
        :style="{ height: '100%', borderRight: 0 }"
        >
      <a-menu-item key="welcome">
<!--        <router-link to="/"> 页面全部在 本页 就不需跳转 了 -->
          <MailOutlined/>
          <span>欢迎</span>
<!--        </router-link>-->
      </a-menu-item>

<!--      循环读取 菜单中的值 -->
      <a-sub-menu v-for="item in level1" :key="item.id">
<!--        一级菜单-->
        <template v-slot:title>
              <span>
              <user-outlined/>{{item.name}}
              </span>
        </template>
<!--        二级菜单-->
        <a-menu-item v-for="child in item.children" :key="child.id">
          <MailOutlined/>
          <span>{{child.name}}</span>
        </a-menu-item>

      </a-sub-menu>
    </a-menu
       >
    </a-layout-sider>




    <a-layout-content :style="{background: '#fff' ,padding: '24px',margin: 0,minHeight : '600px'}">
      <div class="welcome" v-show="isShowWelcome">
        <h1>欢迎使用Control电子书网站</h1>
      </div>
<!--       显示图书部分 -->
      <a-list v-show="!isShowWelcome" item-layout="vertical" size="large" :grid="{ gutter: 10, column: 3 }"
              :data-source="ebooks">
        <template #renderItem="{ item }">
          <a-list-item key="item.name">
            <template #actions>
          <span v-for="{ type, text } in actions" :key="type">
            <component :is="type" style="margin-right: 8px" />
            {{ text }}
          </span>
            </template>
            <a-list-item-meta :description="item.description">
              <template #title>
                <a :href="item.href">{{ item.name }}</a>
              </template>
              <template #avatar><a-avatar :src="item.cover" /></template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>


    </a-layout-content>
  </a-layout>
</template>




<script lang="ts">
import { defineComponent ,onMounted,ref,reactive,toRef} from 'vue';
import axios from 'axios';
import { message } from "ant-design-vue";
import {Tool} from "@/util/tool"

const listData: any = [];
export default defineComponent({
  name: 'app',
  setup(){


    console.log("Vue3新加的setup方法页面一但被初始化就执行这个方法");
    const ebooks=ref();
    const ebooks1=reactive({books:[]});
    //多利用 声明周期这样子的钩子函数
    onMounted(()=>{
      console.log("onMounted");
      axios.get("/ebook/all").then(
          (response)=>{
            const data=response.data;
            ebooks.value=data.content.list
            console.log(response);
          });
    });

    /**
     * 查询所有分类
     */
    let categorys : any;
    const level1=ref();
    const handleQueryCategory = () => {
      // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
      // categorys.value = [];
      axios.get("/category/all").then((response) => {
        const data = response.data;
        if (data.success) {
          categorys = data.content;
          console.log("原始数据",categorys);
          level1.value=[];
          level1.value=Tool.array2Tree(categorys,0);
          console.log("树状数据",level1);


        } else {
          message.error(data.message);
        }
      });
    };
    const isShowWelcome=ref(true);  // js 中必须先定义在 使用

    const handleClick=(value : any) =>{
      console.log("menu click" ,value);
      //isShowWelcome.value = value.key === 'welcome';    下面可以重构成这样子
      if(value.key==='welcome'){
        isShowWelcome.value=true; // 当值是welcome 的时候就显示欢迎页
      }else{
        isShowWelcome.value=false;// 当值不是welcome的时候 就显示电子书
      }
    }

    // 钩子函数
    onMounted(() => {
      handleQueryCategory();// 在页面的一开始就取加载所有的分类
    });
    // 返回值 可以给外面使用的
    return{
      // 是否显示欢迎页
      isShowWelcome,
      ebooks,
      ebooks2: toRef(ebooks1,"books"),
      listData,
      pagination : {
        onChange: (page: any) => {
          console.log(page);
        },
        pageSize: 3,
      },
      actions: [
      { type: 'StarOutlined', text: '156' },
      { type: 'LikeOutlined', text: '156' },
      { type: 'MessageOutlined', text: '2' },
    ],
      handleClick,
      level1
    }

  }
});
</script>

<style scoped>
.ant-avatar {
  width: 50px;
  height: 50px;
  line-height: 50px;
  border-radius: 8%;
  margin: 5px 0;
}
</style>