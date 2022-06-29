<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary"  @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="goodsCate" :columns="columns" border :selection-type="false" :expand-type="false" :show-index="true" class="tree-table">
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level==2">三级</el-tag>
        </template>
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditDialog(scope.row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="deleteCate(scope.row)"></el-button>
        </template>
      </tree-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentList" :props="cascaderProps" clearable @change="handleChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editCateInfo" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateInfo.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Cate.vue",
  data() {
    return {
      goodsCate: [],
      total: 0,
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        },
      ],
      addDialogVisible: false,
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      parentList: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectedKeys:[],

      editCateInfo: {},
      editDialogVisible: false,
      editRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    async getGoodsCate() {
      const {data:res} = await this.$http.get('categories',{
        params: this.queryInfo
      });
      if(res.meta.status !== 200) {
         return this.$message.error('获取分类失败')
      }
      this.goodsCate = res.data.result;
      this.total = res.data.total;
      this.$message.success('获取分类成功');
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getGoodsCate();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum= pagenum;
      this.getGoodsCate();
    },
    async showAddDialog() {
      const {data:res} = await this.$http.get('categories',{
        params:{type: 2}
      });
      if(res.meta.status !== 200) {
         return this.$message.error('获取父级列表失败')
      };
      this.parentList = res.data;
      this.addDialogVisible = true;
    },
    handleChange() {
      if(this.selectedKeys.length>0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1];
        this.addForm.cat_level = this.selectedKeys.length;
      }
      console.log(this.addForm);
    },
    addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid)
          return;
        const{data:res} = await this.$http.post('categories',this.addForm);
        if(res.meta.status !== 201) {
           return this.$message.error('添加分类失败')
        }
        this.addDialogVisible = false;
        this.getGoodsCate();
        this.$message.success('添加分类成功');
      })
    },
    addDialogClose() {
      this.selectedKeys = [];
      this.addForm.cat_pid = 0;
      this.addForm.cat_level = 0;
      this.$refs.addFormRef.resetFields();
    },
    async showEditDialog(cateinfo) {
      const {data:res} = await this.$http.get(`categories/${cateinfo.cat_id}`);
      if(res.meta.status !== 200) {
         return this.$message.error('失败')
      }
      this.editCateInfo = res.data;
      console.log(this.editCateInfo);
      this.editDialogVisible = true;
    },
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid)
          return;
        console.log(this.editCateInfo.cat_id);
        const {data:res} = await this.$http.put(`categories/${this.editCateInfo.cat_id}`,{
          cat_name: this.editCateInfo.cat_name
        });
        if(res.meta.status !== 200) {
           return this.$message.error('修改分类失败')
        }
        this.getGoodsCate();
        this.editDialogVisible = false;
        this.$message.success('修改分类成功');
      })
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    deleteCate(cateinfo) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`categories/${cateinfo.cat_id}`);
        if(res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.getGoodsCate();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }
  }
}
</script>

<style lang="less" scoped>
  .box-card {
    margin-top: 30px;
  }
  .tree-table {
    margin-top: 15px;
  }
</style>