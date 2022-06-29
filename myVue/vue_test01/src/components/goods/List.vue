<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <!--一行有24格-->
        <el-col :span="8">
          <el-input placeholder="请输入商品名称" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditpage(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row)"></el-button>
          </template>

        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[20, 30, 40, 50]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "List.vue",
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const {data:res} = await this.$http.get('goods',{
        params: this.queryInfo
      });
      if(res.meta.status !== 200)
        return this.$message.error('获取失败');

      for(let item of res.data.goods) {
        item.add_time= this.$utils.formatToTime(item.add_time)
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      this.$message.success('获取商品成功');
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getGoodsList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getGoodsList();
    },
    deleteGoods(row) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`goods/${row.goods_id}`);
        if(res.meta.status !== 200)
          return this.$message.error('删除用户失败');
        this.getGoodsList();
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
    goAddpage() {
      this.$router.push('/goods/add');
    },
    goEditpage(id) {
      this.$router.push('/goods/edit?id='+id)
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-top: 30px;
}
</style>