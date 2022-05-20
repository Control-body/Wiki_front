<template>

  <a-layout>
    <a-layout-content :style="{background: '#fff' ,padding: '24px',margin: 0,minHeight : '600px'}">
      <p>
<!--        新增按钮 -->
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
<!--      表格数据 和 编辑和删除按钮-->
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="level1"
          :pagination="false"
          :loading="Loading"
        >
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
<!--            <a-modal v-model:visible="visible" title="确认删除?" @ok="handleOk(record)">-->
<!--              <p>你确定要删除吗?</p>-->
<!--            </a-modal>-->
          </a-space>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>
<!--  编辑框组件 -->
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
      <a-form-item label="内容">
        <div id="toolbar-container"></div>
        <div id="editor-container"></div>
      </a-form-item>
    </a-form>

  </a-modal>
</template>
<script lang="ts">
import {createVNode, defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {message, Modal} from 'ant-design-vue';
import {Tool} from "../../util/tool";
import {useRoute} from "vue-router";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar,IToolbarConfig, IEditorConfig, IDomEditor } from '@wangeditor/editor'


export default defineComponent({
  name: 'AdminDoc',
  setup() {
    const  route=useRoute();  // 得到路由的各种信息
    console.log(route)
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
    // const ids: Array<string>=[]; //保存要删除的变量
    /**
     * 保存要删除那些node 那些id
     */
    const deleteIds: Array<string> = [];
    const deleteNames: Array<string> = [];
    //要删除那些ID 递归查询出所有的ID 放入ids
    const getDeleteIds=(treeSelectData : any,id : any)=>{
      console.log("得到要删除的ID"+id);
      for (let i=0;i<treeSelectData.length;i++){
        const node = treeSelectData[i];
        if(node.id==id){
          console.log("这个要删除"+node.id);
          // 将目标 ID 放入结果集
          deleteIds.push(id);
          deleteNames.push(node.name)
          const children = node.children;
          if(Tool.isNotEmpty(children)){
            for (let j=0;j<children.length;j++){
              getDeleteIds(children,children[j].id);  //递归调用
            }
          }
        }else{
          // 如果当前节点不是 目标节点 就到字节点 去找
          const children = node.children;
          if (Tool.isNotEmpty(children)){
            getDeleteIds(children,id);
          }
        }
      }
    }
    /**
     * 让本标签和 本标签的下面的 都失效
     * @param treeSelectData
     * @param id
     */
    const setDisable=(treeSelectData : any,id : any)=>{
      for (let i=0;i<treeSelectData.length;i++){
        const node = treeSelectData[i];
        if(node.id==id){
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
    const doc = ref();
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    /**
     * 添加完成的 方法调用
     */
    const handleModalOk = () => {
      modalLoading.value = false;
      axios.post("/doc/save", doc.value).then((response) => {
        //modalLoading.value =true;
        const data = response.data; // data = commonResp
        //modalLoading.value = false;
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
      console.log("将要编辑那个值"+record.id)
      modalVisible.value = true;
      doc.value = Tool.copy(record);
      // docIds.value = [doc.value.doc1Id, doc.value.doc2Id]
      treeSelectData.value=Tool.copy(level1.value);
      setDisable(treeSelectData.value,record.id); //设置他的子节点 和他的子孙节点都失效
      treeSelectData.value.unshift({id:0 ,name:'无'}); //unshift是在前方添加一个元素
      setTimeout(function (){
        // 创建编辑器
        const editor = createEditor({
          selector: '#editor-container',
          config: editorConfig,
          mode: 'default' // 或 'simple' 参考下文
        });
// 创建工具栏
      createToolbar({
          editor,
          selector: '#toolbar-container',
          config: toolbarConfig,
          mode: 'default' // 或 'simple' 参考下文
        })
      },100);
    };
    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;  // 显示出添加组件
      doc.value = {
        ebookId: route.query.ebookId  // 传入电子书的值
      };
      treeSelectData.value=Tool.copy(level1.value);// 跟新编辑框中的组件顺序
      treeSelectData.value.unshift({id:0 ,name:'无'}); //unshift是在前方添加一个元素
      // 延迟添加 组件渲染
      setTimeout(function (){
        // 创建编辑器
        const editor = createEditor({
          selector: '#editor-container',
          config: editorConfig,
          mode: 'default' // 或 'simple' 参考下文
        });
// 创建工具栏
        createToolbar({
          editor,
          selector: '#toolbar-container',
          config: toolbarConfig,
          mode: 'default' // 或 'simple' 参考下文
        })
      },100);

    };
    /**
     * 删除 方法
     */
    const handleDelete = (id : number) => {
      // console.log("第一次确认删除");
      // console.log("要删除"+record.id);
      // visible.value = true;// 开启第三次确认组件
      // 清空数组长度
      deleteIds.length = 0;
      deleteNames.length = 0;
      // 查询到那些id需要去删除
      getDeleteIds(level1.value, id);
      Modal.confirm({
        title: '重要提醒',
        icon: createVNode(ExclamationCircleOutlined),
        content: '将删除：【' + deleteNames.join("，") + "】删除后不可恢复，确认删除？",
        onOk() {
          // console.log(ids)
          axios.delete("/doc/delete/" + deleteIds.join(",")).then((response) => {
            const data = response.data; // data = commonResp
            if (data.success) {
              // 重新加载列表
              handleQuery();
            } else {
              message.error(data.message);
            }
          });
        },
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
// 三次确认
    const visible = ref<boolean>(false);
    // /**
    //  * 再次确认删除调用的方法
    //  * @param id
    //  */
    // const handleOk = (record : any ) => {
    //   console.log("第二次确认删除");
    //   visible.value = false;//关闭组件
    //   console.log("--------------"+record.id);
    //   // console.log("--------------"+level1);
    //   console.log("--------------"+level1.value);
    //   getDeleteIds(level1.value,record.id);
    //   axios.delete("/doc/delete/" + ids.join(",")).then((response) => {
    //     const data = response.data; // data = commonResp
    //     if (data.success) {// 判断是否加载成功
    //       // 重新加载列表
    //       handleQuery();
    //     } else {
    //       message.error(data.message);
    //     }
    //   });
    // };
// 编辑器配置
    const editorConfig: Partial<IEditorConfig> = {}
    editorConfig.placeholder = '请输入内容'
    editorConfig.onChange = (editor: IDomEditor) => {
      // 当编辑器选区、内容变化时，即触发
      console.log('content', editor.children)
      console.log('html', editor.getHtml())
    }

// 工具栏配置
    const toolbarConfig: Partial<IToolbarConfig> = {}

// 创建编辑器
//     const editor = createEditor({
//       selector: '#editor-container',
//       config: editorConfig,
//       mode: 'default' // 或 'simple' 参考下文
//     })

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
      treeSelectData,

      visible,
      // showModal,
      // handleOk,
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