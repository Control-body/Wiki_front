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
          :data-source="users"
          :pagination="pagination"
          :loading="Loading"
          @change="handleTableChange">
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
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
    <a-form :model="user" :label-col="{span: 6}">
      <a-form-item label="登录名">
        <a-input v-model:value="user.loginName" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="user.name" />
      </a-form-item>
      <a-form-item label="密码">
        <a-input v-model:value="user.password" type="text" />
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
  name: 'Doc',
  setup() {
    const param = ref();
    param.value = {};
    //接受返回过来的对象
    const users = ref();
    // 分页
    const pagination = ref({
      current: 1,
      pageSize: 5,
      total: 0
    });
    const loading = ref(false);
    const columns = [
      {
        title: '登录名',
        dataIndex: 'loginName',
        slots: { customRender: 'loginName' }  // 会渲染页面上的 cover数据
      },
      {
        title: '名称',
        dataIndex: 'name',
        slots: { customRender: 'name' }
      },
      {
        title: '密码',
        dataIndex: 'password',
        slots: { customRender: 'password' }
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
      // users.value = [];
      axios.get("/user/list",{
        params : {
          page : params.page,
          size : params.size,
          name : param.value.name
        }
      }).then((response) => {
        loading.value = false;
        const data = response.data;
        if (data.success) {
          users.value = data.content.list;
          // 重置分页按钮
          pagination.value.current = params.page;
          pagination.value.total = data.content.total;
        } else {
          message.error(data.message);
        }
        // users.value=data.content.list;
        // pagination.value.current = params.page;
        // pagination.value.total = data.content.total;
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
    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     * categoryIds 定义响应形式变量
     */
    const categoryIds = ref();
    const user = ref();
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;
      //在保存到数据库
      axios.post("/user/save", user.value).then((response) => {
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
      user.value = Tool.copy(record);
      categoryIds.value = [user.value.category1Id, user.value.category2Id]
    };
    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      user.value = {};
    };
    /**
     * 删除
     */
    const handleDelete = (id : number ) => {
      axios.delete("/user/delete/"+id).then((response) => {
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
      axios.post("/user/search", searchValue.value).then((response) => {
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
    // onMounted(() => {
    //
    // });
    return {
      users,
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
      user,
      searchValue,
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
