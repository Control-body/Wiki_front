<template>

  <a-layout>
    <a-layout-content :style="{background: '#fff' ,padding: '24px',margin: 0,minHeight : '600px'}">
      <p>
        <a-form
            layout="inline"
            :model="param"
        >
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="名称">
              <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="handleQuery({page : 1,size : pagination.pageSize})">
                查询
            </a-button>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="add">
              新增
            </a-button>
          </a-form-item>
        </a-form>

<!-- 数据展示区域 -->
      </p>
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="ebooks"
          :pagination="pagination"
          :loading="Loading"
          @change="handleTableChange">
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
<!--        渲染数据-->
        <template v-slot:category="{ text , record }">
          <span>{{getCategoryName(record.category1Id)}}/{{getCategoryName(record.category2Id)}}</span>
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
            <router-link to="/admin/doc">
              <a-button type="primary" >
                文档管理
              </a-button>
            </router-link>


            <a-button type="primary" @click="edit(record)">
              编辑
            </a-button>

            <a-popconfirm
                title="删除后不可赋值 确认删除?"
                ok-text="是"
                cancel-text="否"
                @confirm="handleDelete(record.id)"
            >
              <a-button type="danger">
                删除
              </a-button>
            </a-popconfirm>


          </a-space>
        </template>


      </a-table>
    </a-layout-content>
  </a-layout>
<!--  跳出的 编辑框 -->
  <a-modal
      v-model:visible="modalVisible"
      title="Title"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
    <a-form :model="ebook" :label-col="{span: 6}">
      <a-form-item label="封面">
        <a-input v-model:value="ebook.cover" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="ebook.name" />
      </a-form-item>
      <!--        定义响应式 变量categoryIds   -->
      <a-form-item label="分类">
        <a-input v-model:value="categoryIds" />
        <a-cascader
            v-model:value="categoryIds"
            :field-names="{label: 'name', value:'id', children: 'children'}"
            :options="level1"
            placeholder="Please select" />
      </a-form-item>


      <a-form-item label="描述">
        <a-input v-model:value="ebook.description" type="text" />
      </a-form-item>


    </a-form>

  </a-modal>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import {Tool} from "../../util/tool";


export default defineComponent({
  name: 'AdminEbook',
  setup() {
     const param = ref();
     param.value = {};
    const ebooks = ref();
    // 分页
    const pagination = ref({
      current: 1,
      pageSize: 2,
      total: 0
    });

    const loading = ref(false);

    const columns = [
      {
        title: '封面',
        dataIndex: 'cover',
        slots: { customRender: 'cover' }  // 会渲染页面上的 cover数据
      },
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '分类',
        slots: { customRender: 'category' }
      },

      {
        title: '描述',
        key: 'description',
        dataIndex: 'description',
      },
      {
        title: '文档数',
        dataIndex: 'docCount'
      },
      {
        title: '阅读数',
        dataIndex: 'viewCount'
      },
      {
        title: '点赞数',
        dataIndex: 'voteCount'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ];

    /**
     * 数据查询
     **/
    const handleQuery = (params: any) => {
      loading.value = true;
      // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
      // ebooks.value = [];
      axios.get("/ebook/list",{
        params : {
          page : params.page,
          size : params.size,
          name : param.value.name
        }
      }).then((response) => {
        loading.value = false;
        const data = response.data;
        if (data.success) {
          ebooks.value = data.content.list;
          // 重置分页按钮
          pagination.value.current = params.page;
          pagination.value.total = data.content.total;
        } else {
          message.error(data.message);
        }
        ebooks.value=data.content.list;
        pagination.value.current = params.page;
        pagination.value.total = data.content.total;
      });
    };

    /**
     * 表格点击页码时触发
     */
    const handleTableChange = (pagination: any) => {
      console.log("看看自带的分页参数都有啥：" + pagination);
      handleQuery({
        page: pagination.current,
        size: pagination.pageSize
      });
    };
    /**
     * 查询所有分类
     */
    let categorys : any;
    const level1=ref();
    const handleQueryCategory = () => {
      loading.value = true;
      // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
      // categorys.value = [];
      axios.get("/category/all").then((response) => {
        loading.value = false;
        const data = response.data;
        if (data.success) {
          categorys = data.content;
          console.log("原始数据",categorys);
          level1.value=[];
          level1.value=Tool.array2Tree(categorys,0); // 转换成树型结构
          console.log("树状数据",level1);
// 加载完成分类后 在加载电子书 否则如果分类树 加载很慢 电子书渲染就会出错
          handleQuery({
            page: 1,
            size: pagination.value.pageSize
          });
        } else {
          message.error(data.message);
        }
      });
    };
    // 用类型id 找出类型名称
    const getCategoryName=(cid : number) =>{
      let result="";
      categorys.forEach(( item: any)=>{
        if(item.id===cid){
          result=item.name;
        }
      });
      return result;
    };

    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     * categoryIds 定义响应形式变量
     */
    const categoryIds = ref();
    const ebook = ref();
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;
      //取到两个值
      ebook.value.category1Id = categoryIds.value[0];
      ebook.value.category2Id = categoryIds.value[1];
      //在保存到数据库
      axios.post("/ebook/save", ebook.value).then((response) => {
        modalLoading.value =true;
        modalLoading.value = false;
        const data = response.data; // data = commonResp
        if (data.success) {// 判断是否加载成功
          modalVisible.value = false; // 让编辑窗口关闭
          // 重新加载列表
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize,
          });
        } else {
          message.error(data.message);
        }
      });
    };
    /**
     * 编辑
     * 就是显示出来 赋值给响应式变量
     */
    const edit = (record : any) => {
      modalVisible.value = true;
      ebook.value = Tool.copy(record);
      categoryIds.value = [ebook.value.category1Id, ebook.value.category2Id]
    };
    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      ebook.value = {};

    };
    /**
     * 删除
     */
    const handleDelete = (id : number ) => {
      axios.delete("/ebook/delete/"+id).then((response) => {
        const data = response.data; // data = commonResp
        if (data.success) {// 判断是否加载成功
          // 重新加载列表
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize,
          });
        } else {
          message.error(data.message);
        }
      });
    };

    /**
     *  查询
     */
    const searchValue = ref();
    const onSearch = (searchValue: any) => {
      axios.post("/ebook/search", searchValue.value).then((response) => {
        const data = response.data; // data = commonResp
        if (data.success) {// 判断是否加载成功
          // 重新加载列表
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize,
          });
        } else {
          message.error(data.message);
        }
      });
    };

    onMounted(() => {
      handleQueryCategory();
    });

    return {
      ebooks,
      pagination,
      columns,
      loading,
      handleTableChange,
      handleQuery,
      modalVisible,
      modalLoading,
      handleModalOk,

      categoryIds,
      //表单分类去查询数据库
      level1,


      ebook,
      searchValue,
//  得到类型 对应的名称
      getCategoryName,
      handleDelete,
      param,
      edit,
      add,
      onSearch
    }
  }
});
</script>

<style scoped>
img {
  width: 50px;
  height: 50px;
}
</style>