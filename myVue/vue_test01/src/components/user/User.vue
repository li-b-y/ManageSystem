<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <!--一行有24格-->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="open(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" circle size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

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

    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser(addForm)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="closeEditDialog">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改用户角色" :visible.sync="setRoleDialogVisible" width="50%"  @close="closeSetRoleDialog">
      <div>
        <p>用户名：{{setRoleUser.username}}</p>
        <p>用户角色：{{setRoleUser.role_name}}</p>
        <p>
          选择角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole(setRoleUser)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "User.vue",
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum:1,
        pagesize:5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
           {min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur'} //失去焦点就进行校验
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入您的邮箱', trigger: 'blur'},
          {pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,message: '邮箱格式不正确',trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {pattern:/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,message: '手机号格式不正确',trigger: 'blur'}
        ]
      },
      editForm: {},
      editDialogVisible: false,
      editFormRules: {
        email: [
          {required: true, message: '请输入您的邮箱', trigger: 'blur'},
          {pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,message: '邮箱格式不正确',trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {pattern:/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,message: '手机号格式不正确',trigger: 'blur'}
        ]
      },
      setRoleUser: {},
      setRoleDialogVisible: false,
      roleList: [],
      selectedRoleId:null
    }
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const {data:res} = await this.$http.get('users',{
        params: this.queryInfo
      });
      if(res.meta.status !== 200)
        return this.$message.error('请求失败');
      this.userList = res.data.users;
      console.log(this.userList);
      this.total = res.data.total;
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getUserList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getUserList();
    },
    async changeState(userinfo) {
      const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
      if(res.meta.status !== 200){
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更新失败');
      }
      this.$message.success('更新成功');
    },
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    addUser(userinfo) {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid)//如果校验失败
          return;
        const {data:res} = await this.$http.post('users',userinfo);
        if(res.meta.status !== 201) //创建新的资源成功用201
          return this.$message.error('添加失败');
        this.getUserList();
        this.addDialogVisible = false;
        this.$message.success('添加成功');
      });
    },
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    editUser(userinfo) {
       this.$refs.editFormRef.validate(async valid => {
         if(!valid)
           return
         const {data:res} = await this.$http.put(`users/${userinfo.id}`, {
           email: userinfo.email,
           mobile: userinfo.mobile
         });
         if(res.meta.status !== 200) //创建新的资源成功用201
           return this.$message.error('修改用户失败');
         this.getUserList();
         this.editDialogVisible = false;
         this.$message.success('修改用户成功');
       })

    },
    async showEditDialog(id) {
      const {data:res} = await this.$http.get(`users/${id}`);
      if(res.meta.status !== 200)
        return this.$message.error('查询用户失败');
      this.editForm = res.data;
      this.$message.success('查询用户成功');
      this.editDialogVisible = true;
    },
    open(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`users/${id}`);
        if(res.meta.status !== 200)
          return this.$message.error('删除用户失败');
        this.getUserList();
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
    async showSetRoleDialog(userinfo) {
      this.setRoleUser = userinfo;
      const {data:res} = await this.$http.get('roles');
      if(res.meta.status !== 200)
        return this.$message.error('获取角色列表失败');
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    async setUserRole() {
      if(!this.selectedRoleId)
        return this.$message.error('请选择角色');

      const {data:res} = await this.$http.put(`users/${this.setRoleUser.id}/role`, {
        rid: this.selectedRoleId,
      });
      if(res.meta.status !== 200) {
        console.log(this.selectedRoleId); //400?
        return this.$message.error('分配角色失败');
      }

      this.$message.success('分配角色成功');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    closeSetRoleDialog() {
      this.selectedRoleId = null;
      this.setRoleUser = {};
    }
  }
}


</script>

<style lang="less" scoped>
.box-card{
  margin-top: 50px;
  .clearfix {
    //display: flex;
  }
}
</style>