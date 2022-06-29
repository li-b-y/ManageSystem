<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-table :data="rightList" border stripe>
        <el-table-column type="index" label="序列"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限参数">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level == 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

</template>

<script>
export default {
  name: "Right.vue",
  data() {
    return {
      rightList: []
    }
  },
  created() {
    this.getRightList();
  },
  methods: {
    async getRightList() {
      const {data:res} = await this.$http.get(`rights/list`);
      if(res.meta.status !== 200) {
          this.$message.error('获取权限列表失败');
      }
      this.rightList = res.data;
      console.log(this.rightList);
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-top: 30px;
}
</style>