<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true;">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand" label="明细">
          <template slot-scope="scope">
              <el-row v-for="(item,i1) in scope.row.children" :class="{bdbottom:true,bdtop: i1==0,middle: true}">
                <el-col :span="5">
                    <el-tag :key="item.name" closable :type="item.type" @close="removeRight(scope.row,item.id)">
                      {{item.authName}}
                    </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row v-for="(childItem,i2) in item.children" :class="{bdtop: i2!=0,middle: true}">
                    <el-col :span="6">
                      <el-tag :key="childItem.name" closable type="success" @close="removeRight(scope.row,childItem.id)">
                        {{childItem.authName}}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>

                    <el-col :span="18">
                      <el-tag v-for="ccItem in childItem.children" :key="ccItem.id" closable type="warning" @close="removeRight(scope.row,ccItem.id)">
                          {{ccItem.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="open(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightTree(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog">
      <el-form :model="roleInfo" :rules="addRules" ref="addRoleRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="roleInfo.rolename"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roledesc">
          <el-input v-model="roleInfo.roledesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole(roleInfo)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="closeEditDialog">
      <el-form :model="currentRole" :rules="editRules" ref="editRoleRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="currentRole.rolename"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roledesc">
          <el-input v-model="currentRole.roledesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="showDialogVisible" width="50%" @close="closeRightsDialog">
      <el-tree ref="treeRef" :data="rightList" :props="rightProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="checkedArr"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Role.vue",
  data() {
    return {
      roleList: [],

      roleInfo: {},
      addDialogVisible: false,
      addRules: {
        rolename: [
            {required: true, message: '请输入角色名称', trigger: 'blur'}
        ],
        roledesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },

      currentRole: {},
      editDialogVisible: false,
      editRules: {
        rolename: [
          {required: true, message: '请输入角色名称', trigger: 'blur'}
        ],
        roledesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },

      showDialogVisible: false,
      rightList: [],
      rightProps: {
        label: 'authName',
        children: 'children'
      },
      checkedArr: [],
      roleId: ''
    }
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const {data: res} = await this.$http.get(`roles`);
      if (res.meta.status !== 200) {
        console.log(res.meta.status);
        return this.$message.error('获取角色列表失败');
      }
      this.roleList = res.data;
      //console.log(this.roleList);
    },
    addRole(roleinfo) {
      this.$refs.addRoleRef.validate (async valid => {
        if(!valid)
          return this.$message.error('不符合格式要求')
        const {data:res} = await this.$http.post('roles',{
          roleName: roleinfo.rolename,
          roleDesc: roleinfo.roledesc
        });
        if(res.meta.status !== 201) {
            this.$message.error('创建失败')
        }
        this.getRoleList();
        this.$message.success('创建成功')
        this.addDialogVisible = false;
      });
    },
    closeAddDialog() {
      this.$refs.addRoleRef.resetFields();
    },
    closeEditDialog() {
      this.$refs.editRoleRef.resetFields();
    },
    async showEditRoleDialog(id) {
      this.editDialogVisible = true;
      const {data:res} = await this.$http.get(`roles/${id}`);
      if(res.meta.status !== 200) {
         return this.$message.error('获取角色失败')
      }
      this.currentRole = res.data;
      console.log(this.currentRole);
    },
    editRole() {
      this.$refs.editRoleRef.validate (async valid => {
        if(!valid)
          return;
        const {data:res} = await this.$http.put(`roles/${this.currentRole.roleId}`,{
          roleName: this.currentRole.rolename,
          roleDesc: this.currentRole.roledesc
        });
        if(res.meta.status !== 201) {
         return this.$message.error('更新失败')
        }
        console.log(this.currentRole.roleId);
        this.editDialogVisible = false;
        this.getRoleList();
        this.$message.success('更新成功');
      });
    },
    open(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`roles/${id}`);
        if(res.meta.status !== 200) {
            return this.$message.error('删除失败')
        }
        this.getRoleList();
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
    removeRight(role,right_id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${right_id}`);
        if(res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        role.children = res.data;
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

    async showRightTree(roleinfo) {
      const {data:res1} = await this.$http.get(`rights/tree`);
      if(res1.meta.status !== 200) {
         return this.$message.error('获取列表失败')
      }
      this.rightList = res1.data;
      this.getCheckedArr(roleinfo);
      console.log(this.checkedArr);
      this.showDialogVisible = true;
      this.roleId = roleinfo.id;
    },
    getCheckedArr(node) {
      if(!node.children)
        return this.checkedArr.push(node.id);
      else {
        node.children.forEach(item => {
          this.getCheckedArr(item);
        });
      }
    },
    closeRightsDialog() {
      this.checkedArr = [];
    },
    async allotRights() {
      const checkedKeys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys());
      const idStr = checkedKeys.join(',');
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      });
      if(res.meta.status !== 200) {
        console.log(res.meta.status);
        return this.$message.error('分配权限失败')
      }
      this.showDialogVisible = false;
      this.getRoleList();
      //this.$message.success('分配权限成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .box-card {
    margin-top: 30px;
  }
  .el-tag {
    margin: 6px;
  }
  .bdbottom {
    border-bottom: solid 1px #eeeeee;
  }
  .bdtop {
    border: solid 1px #eeeeee;
  }
  .middle {
    display: flex;
    align-items: center;
  }
</style>