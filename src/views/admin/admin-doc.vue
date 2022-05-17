<template>

  <a-layout>
    <a-layout-content :style="{background: '#fff' ,padding: '24px',margin: 0,minHeight : '600px'}">
      <p>
        <a-form
            layout="inline"
            :model="param"
        >
          <a-form-item>
            <a-button type="primary" @click="add">
              新增
            </a-button>
          </a-form-item>
        </a-form>
      </p>
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="level1"
          :pagination="false"
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
  <a-modal
      v-model:visible="modalVisible"
      title="Title"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
    <a-form :model="doc" :label-col="{span: 6}">
      <a-form-item label="名称">
        <a-input v-model:value="doc.name" />
      </a-form-item>

      <a-form-item label="父文档">
        <a-tree-select
            v-model:value="(doc.parent)"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择父标签"
            allow-clear
            tree-default-expand-all
            :tree-data="treeSelectData"
            :replaceFields="
              {children:'children', label:'name', key:'id', value: 'id' }
            "
        >
          <!-- 具有树型数据的 就是level1  level1 不能增加 无 否则表格里面也会 出现无 -->
        </a-tree-select>
      </a-form-item>

      <a-form-item label="父文档">
          <a-select
              ref="select"
              v-model:value="doc.parent"
          >
            <a-select-option value="0">无</a-select-option>
            <a-select-option v-for="c in level1" :key="c.id" :value="c.id" :disable="doc.id === c.id">
              {{c.name}}
            </a-select-option>
          </a-select>

    </a-form-item>
      <a-form-item label="排序">
        <a-input v-model:value="doc.sort" />
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
  name: 'AdminDoc',
  setup() {
     const param = ref();
     param.value = {};
    const docs = ref();
    const loading = ref(false);

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '父文档',
        key: 'parent',
        dataIndex: 'parent',
      },
      {
        title: '顺序',
        key: 'sort',
        dataIndex: 'sort',
      },
     {
       title: 'Action',
           key: 'action',
         slots: { customRender: 'action' }
     }

    ];
    const level1=ref(); // 一级文档树 children 就是二级文档
    const setDisable=(treeSelectData : any,id : any)=>{
      for (let i=0;i<treeSelectData.length;i++){
        const node = treeSelectData[i];
        if(node.id=id){
          console.log("disable",node);
          node.disabled=true; // 设置为不可见
          const children = node.children;
          if(Tool.isNotEmpty(children)){
            for (let j=0;j<children.length;j++){
              setDisable(children,children[j].id);  //递归调用
            }
          }
        }else{
          // 如果当前节点不是 目标节点 就到字节点 去找
          const children = node.children;
          if (Tool.isNotEmpty(children)){
            setDisable(children,id);
          }
        }
      }
    }
    /**
     * 数据查询
     **/
    const handleQuery = () => {
      loading.value = true;
      // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
      level1.value = [];
      axios.get("/doc/all").then((response) => {
        loading.value = false;
        const data = response.data;
        if (data.success) {
          docs.value = data.content;
          console.log("原始数据",docs.value);
          level1.value=[];
          level1.value=Tool.array2Tree(docs.value,0);
          console.log("树状数据",level1.value);
        } else {
          message.error(data.message);
        }
      });
    };
    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     */
    const treeSelectData=ref(); // 初始是一个空的json数组
    treeSelectData.value=[];
    const docIds = ref();
    const doc = ref();
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;
      // doc.value.doc1Id = docIds.value[0];
      // doc.value.doc2Id = docIds.value[1];
      axios.post("/doc/save", doc.value).then((response) => {
        modalLoading.value =true;
        const data = response.data; // data = commonResp
        modalLoading.value = false;
        if (data.success) {// 判断是否加载成功
          modalVisible.value = false;
          // 重新加载列表
          handleQuery();
        } else {
          message.error(data.message);
        }
      });
    };
    /**
     * 编辑
     */
    const edit = (record : any) => {
      modalVisible.value = true;
      doc.value = Tool.copy(record);
      // docIds.value = [doc.value.doc1Id, doc.value.doc2Id]
      treeSelectData.value=Tool.copy(level1.value);
      setDisable(treeSelectData.value,record.id); //设置他的子节点 和他的子孙节点都失效
      treeSelectData.value.unshift({id:0 ,name:'无'}); //unshift是在前方添加一个元素
    };
    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      doc.value = {};
      treeSelectData.value=Tool.copy(level1.value);
      treeSelectData.value.unshift({id:0 ,name:'无'}); //unshift是在前方添加一个元素
    };
    /**
     * 删除
     */
    const handleDelete = (id : number ) => {
      axios.delete("/doc/delete/" + id).then((response) => {
        const data = response.data; // data = commonResp
        if (data.success) {// 判断是否加载成功
          // 重新加载列表
          handleQuery();
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
      axios.post("/doc/search", searchValue.value).then((response) => {
        const data = response.data; // data = commonResp
        if (data.success) {// 判断是否加载成功
          // 重新加载列表
          handleQuery();
        } else {
          message.error(data.message);
        }
      });
    };

    onMounted(() => {
      handleQuery();
    });

    return {
      //docs,
      columns,
      loading,
      handleQuery,
      modalVisible,
      modalLoading,
      handleModalOk,

      level1,
      doc,
      searchValue,

      handleDelete,
      param,
      edit,
      add,
      onSearch,
      //返回出去 数值
      treeSelectData
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