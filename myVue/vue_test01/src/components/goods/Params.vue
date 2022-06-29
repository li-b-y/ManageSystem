<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card class="box-card">
    <el-row>
      <el-col>
        <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning">
        </el-alert>
      </el-col>
    </el-row>
    <el-row class="cascader">
      <el-col>
        <span>选择商品分类</span>
        <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" clearable @handleChange="handleChange"></el-cascader>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" @tab-click="showTable(activeName)" class="el-tabs">
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" :disabled="isDisabled" @click="showAddParamDialog()">添加参数</el-button>
        <el-table :data="pTable" style="width: 100%" border stripe>
          <el-table-column type="expand" label="明细">
            <template slot-scope="scope">
              <el-tag class="el-tag" :key="item" v-for="(item,i) in scope.row.attr_vals" closable @close="handleClose(scope.row,i)">
                {{item}}
              </el-tag>
              <el-input class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamDialog(scope.row)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" :disabled="isDisabled">添加属性</el-button>
        <el-table :data="pTable" style="width: 100%" border stripe>
          <el-table-column type="expand" label="明细">
            <template slot-scope="scope">
              <el-tag class="el-tag" :key="item" v-for="(item,i) in scope.row.attr_vals" closable @close="handleClose(scope.row,i)">
                {{item}}
              </el-tag>
              <el-input class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <el-dialog title="添加参数" :visible.sync="addParamDialogVisible" width="50%" @close="addParamDialogClose">
    <el-form :model="paramInfo" :rules="ParamRules" ref="addParamFormRef" label-width="100px">
      <el-form-item label="动态参数" prop="attr_name">
        <el-input v-model="paramInfo.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParam">确 定</el-button>
      </span>
  </el-dialog>
  <el-dialog title="修改参数" :visible.sync="editParamDialogVisible" width="50%" @close="editParamDialogClose">
    <el-form :model="editInfo" :rules="ParamRules" ref="editParamFormRef" label-width="100px">
      <el-form-item label="动态参数" prop="attr_name">
        <el-input v-model="editInfo.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  name: "Params.vue",
  data() {
    return {
      cateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      selectedKeys: [],
      activeName: '',
      pTable: [],
      isDisabled: false,
      addParamDialogVisible: false,
      paramInfo: {
        attr_name: '',
        attr_sel: 'many'
      },
      ParamRules: {
        attr_name: [
          { required: true, message: '请输入动态参数名称', trigger: 'blur'}
        ]
      },
      editParamDialogVisible: false,
      editInfo: {},
      valsList: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const {data:res} = await this.$http.get('categories',{
        params: {type:3}
      });
      if(res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.cateList = res.data
      this.$message.success('获取分类成功');
    },
    async showTable(sel) {
      if(this.selectedKeys.length == 3) {
        const {data:res} = await this.$http.get(`categories/${this.selectedKeys[2]}/attributes`,{
          params: {sel: sel}
        });
        if(res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          item.inputVisible = false;
          item.inputValue = '';
        })
        this.pTable = res.data;

        this.$message.success('获取参数列表成功');
      }
    },
    handleChange() {
      if(this.selectedKeys.length == 0)
      {
        this.isDisabled = true;
      }else {
        this.isDisabled = false;
      }
    },
    showAddParamDialog() {
      this.addParamDialogVisible = true;
    },
    addParam() {
      this.$refs.addParamFormRef.validate(async valid => {
        if(!valid)
          return;
        const {data:res} = await this.$http.post(`categories/${this.selectedKeys[2]}/attributes`,{
          attr_name: this.paramInfo.attr_name,
          attr_sel: this.paramInfo.attr_sel
        });
        if(res.meta.status !== 201) {
           return this.$message.error('添加失败')
        }
        this.showTable(this.paramInfo.attr_sel);
        this.addParamDialogVisible = false;
        this.$message.success('添加成功');
      })
    },
    addParamDialogClose() {
      this.$refs.addParamFormRef.resetFields();
      this.selectedKeys = [];
      this.paramInfo.attr_name = '';
    },
    deleteParam(attr) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`categories/${this.selectedKeys[2]}/attributes/${attr.attr_id}`);
        if(res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.showTable('many');
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
    },
    showEditParamDialog(attr) {
      this.editInfo = attr;
      console.log(this.editInfo)
      this.editParamDialogVisible = true;
    },
    editParam() {
      this.$refs.editParamFormRef.validate(async valid => {
        if(!valid)
          return;
        const {data:res} = await this.$http.put(`categories/${this.selectedKeys[2]}/attributes/${this.editInfo.attr_id}`,{
          attr_name: this.editInfo.attr_name,
          attr_sel: this.editInfo.attr_sel
        });
        if(res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.showTable(this.editInfo.attr_sel);
        this.editParamDialogVisible = false;
        this.$message.success('修改成功');
      })
    },
    editParamDialogClose() {

    },
    showInput(row) {
        row.inputVisible = true;
    },
    handleInputConfirm(row) {
      if(row.inputValue.trim()){
        row.attr_vals.push(row.inputValue.trim());
        this.updateParamDetail(row);
      }
      row.inputValue = '';
      row.inputVisible = false;
    },
    async updateParamDetail(row) {
      const {data:res} = await this.$http.put(`categories/${this.selectedKeys[2]}/attributes/${row.attr_id}`,{
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(" ")
      });
      if(res.meta.status !== 200) {
         return this.$message.error('更新明细失败')
      }
      this.$message.success('更新明细成功')

    },
    handleClose(row,i) {
      row.attr_vals.splice(i,1);
      this.updateParamDetail(row);
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-top: 30px;
}
.cascader {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.input-new-tag {
  width: 120px;
}
.el-tag {
  margin: 5px;
}
</style>