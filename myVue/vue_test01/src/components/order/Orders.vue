<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入订单编号" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" border stripe @expand-change="getOrderDetails">
        <el-table-column type="expand" label="明细">
          <template slot-scope="scope">
            <el-table :data="scope.row.detail" border stripe>
              <el-table-column prop="goods_pic" label="封面" width="100px" header-align="center" align="center">
                <template slot-scope="sc">
                  <el-popover placement="top-start" trigger="hover">
                    <img :src="sc.row.goods_pic" style="width: 150px; height: 150px">
                    <img slot="reference" :src="sc.row.goods_pic" style="width: 50px; height: 50px">
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="goods_name" label="商品名称"></el-table-column>
              <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
              <el-table-column prop="goods_number" label="商品数量" width="100px"></el-table-column>
              <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
              <el-table-column prop="goods_total_price" label="总价" width="100px"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" effect="dark" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" effect="dark" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改收货地址" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="查看物流信息" placement="top-start">
              <el-button type="warning" icon="el-icon-location-outline" size="mini" @click="getKuaidiProgress"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <el-dialog title="修改收货地址" :visible.sync="editDialogVisible" width="50%" @close="handleClose">
      <el-form :model="addrForm" :rules="editRules" ref="addrFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address01">
          <el-cascader class="el-cascader" v-model="addrForm.address01" :options="cityData" :props="{expandTrigger: 'hover',children: 'children'}"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address02">
          <el-input v-model="addrForm.address02"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddr">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in kuaidi" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: "Orders.vue",
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      editDialogVisible: false,
      cityData,
      addrForm: {
        address01: [],
        address02: ''
      },
      editRules: {
        address01: [{required:true, message:'请输入省市区/县',trigger: 'blur'}],
        address02: [{required:true, message:'请输入详细地址',trigger: 'blur'}],
      },
      editOrderInfo: {},
      progressVisible: false,
      kuaidi:[]
    }
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    async getOrdersList() {
      console.log(this.queryInfo.query);
      const {data:res} = await this.$http.get('orders',{
        params: this.queryInfo
      })
      if(res.meta.status !== 200) {
         return this.$message.error('获取失败')
      }
      res.data.goods.forEach(item => {
        item.create_time = this.$utils.formatToTime(item.create_time);
        item.detail = [];
      })
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getOrdersList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrdersList();
    },
    async getOrderDetails(row) {
      const {data:res} = await this.$http.get(`orders/${row.order_id}`);
      if(res.meta.status !== 200) {
         return this.$message.error('获取失败')
      }
      row.detail = res.data.goods;
      row.detail.forEach(async item => {
        const {data:res} = await this.$http.get(`goods/${item.goods_id}`);
        if(res.meta.status !== 200)
          return this.$message.error('获取失败');
        this.$set(item,'goods_name',res.data.goods_name);
        this.$set(item,'goods_weight',res.data.goods_weight);
        this.$set(item,'goods_pic',res.data.pics[0].pics_big_url);
      });
    },
    showEditDialog(row) {
      this.editDialogVisible = true;
      this.editOrderInfo = row;
    },
    editAddr() {
      this.$refs.addrFormRef.validate(async valid => {
        if(!valid)
          return;
        const {data:res} = await this.$http.put(`orders/${this.editOrderInfo.order_id}/address`,{
          consignee_addr: this.addrForm.address01.join(',') + this.addrForm.address02
        })
        if(res.meta.status !== 200) {
           return this.$message.error('修改失败')
        }
        this.editDialogVisible = false;
        this.getOrdersList();
        this.$message.success('修改成功');
      })
    },
    handleClose() {
      this.$refs.addrFormRef.resetFields();
    },
    async getKuaidiProgress() {
      const {data:res} = await this.$http.get('/kuaidi/88888888888888')
      if(res.meta.status !== 200) {
         return this.$message.error('查看失败')
      }
      this.kuaidi = res.data;
      this.progressVisible = true;
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%
}
</style>