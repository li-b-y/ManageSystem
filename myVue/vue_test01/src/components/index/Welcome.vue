<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>欢迎页</el-breadcrumb-item>
  </el-breadcrumb>

  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="statistics" style="background: #409eff">
          <div class="title">
            <p>用户统计</p>
            <el-tag type="success">实时</el-tag>
          </div>
          <div class="num">{{ totalUsers }}</div>
          <div class="remark">当前总用户数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background: #ee9900">
          <div class="title">
            <p>商品统计</p>
            <el-tag type="danger">实时</el-tag>
          </div>
          <div class="num">{{ totalGoods }}</div>
          <div class="remark">当前总商品数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background: #55a532">
          <div class="title">
            <p>订单统计</p>
            <el-tag type="warning">实时</el-tag>
          </div>
          <div class="num">{{ totalOrders }}</div>
          <div class="remark">当前总订单数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background: #909399">
          <div class="title">
            <p>销售统计</p>
            <el-tag type="primary">实时</el-tag>
          </div>
          <div class="num">{{ totalSales }}</div>
          <div class="remark">当前总销售额(元)</div>
        </div>
      </el-col>
    </el-row>
  </div>

  <div class="echarts-container">
    <el-card id="chart01"></el-card>
    <el-card id="chart02"></el-card>
  </div>

  <el-progress :text-inside="true" :stroke-width="26" :percentage="70" :format="format"></el-progress>
  <el-progress :text-inside="true" :stroke-width="24" :percentage="50" status="success" :format="format01"></el-progress>
  <el-progress :text-inside="true" :stroke-width="22" :percentage="30" status="warning" :format="format02"></el-progress>
  <el-progress :text-inside="true" :stroke-width="20" :percentage="45" status="exception" :format="format03"></el-progress>
</div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: "Welcome.vue",
  data() {
    return {
      totalUsers: 0,
      totalGoods: 0,
      totalOrders: 0,
      totalSales: 0,
      orderlist: {}
    }
  },
  created() {
    this.getTotalUsers();
    this.getTotalGoods();
    this.getTotalOrders();
  },
  methods: {
    format(percentage) {
      return  `前端基础: ${percentage}%`
    },
    format01(percentage) {
      return  `JS: ${percentage}%`
    },
    format02(percentage) {
      return  `Vue: ${percentage}%`
    },
    format03(percentage) {
      return  `计算机基础: ${percentage}%`
    },

    async getTotalUsers() {
      const {data:res} = await this.$http.get('users',{
        params: {
          pagenum: 1,
          pagesize: 5
        }
      });
      if(res.meta.status !== 200)
        return this.$message.error('请求失败');
      this.totalUsers = res.data.total;
    },
    async getTotalGoods() {
      const {data:res} = await this.$http.get('goods',{
        params: {
          pagenum: 1,
          pagesize: 5
        }
      });
      if(res.meta.status !== 200)
        return this.$message.error('获取失败');
      this.totalGoods = res.data.total;
    },
    async getTotalOrders() {
      const {data:res} = await this.$http.get('orders')
      if(res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.totalOrders = res.data.total;
      this.orderlist = res.data.goods;
      this.orderlist.forEach(item => {
        if(item.order_pay == 1) {
          this.totalSales += item.order_price;
        }
      })
      this.initChart01();
      this.initChart02();
    },
    initChart01() {
      var chart01 = echarts.init(document.getElementById('chart01'));
      var option = {
        title: {
          text: '订单趋势',
        },
        tooltip: { //配置提示信息
          trigger: 'axis',
          axisPointer: {
            type: 'line',
          },
        },
        xAxis: { //配置x轴要显示的项
          type: 'category',
          data: [],
        },
        yAxis: { //配置y轴要显示的项
          type: 'value',
        },
        series: [ //系列列表，type决定图表类型
          {
            type: 'line',
            smooth: true,
            data: []
          },
        ],
      }
      this.orderlist.sort(function (a,b) {
        return a.create_time - b.create_time
      })
      let data=[]
      this.orderlist.forEach(item => {
        if(item.pay_status === '1') {
          let key = this.$utils.formatToDate(item.create_time);
          if(!data[key])
            data[key] = item.order_price;
          else {
            data[key] += item.order_price
          }
        }
      })

      for(var key in data) {
        option.xAxis.data.push(key);
        option.series[0].data.push(data[key]);
      }

      chart01.setOption(option);
    },
    initChart02() {
      var chart02 = echarts.init(document.getElementById('chart02'));
      var option = {
        title: {
          text: '订单状态',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
        },
        legend: { //图例组件
          orient: 'vertical',
          left: 'right',
          data: [],
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      var data = [
        {
          name: '未付款',
          value: 0
        },
        {
          name: '已付款',
          value: 0
        }
      ]
      this.orderlist.forEach(item => {
        if(item.pay_status === '1') {
          data[1].value++;
        } else {
          data[0].value++;
        }
      })
      console.log(data)
      for(var item of data) {
        option.legend.data.push(item.name);
        option.series[0].data.push(item);
      }
      chart02.setOption(option)
    }
  }
}
</script>

<style lang="less" scoped>
.el-row{
  margin-top: 15px;
  padding: 0 9px;
  .statistics {
    border-radius: 5px;
    color: white;
    height: 100px;
    padding: 0 8px;

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      p {
        font-size: 15px;
        font-weight: bold;
      }
    }
    .num{
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
    .remark {
      font-size: 10px
    }
  }
}
.echarts-container {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  .el-card{
    height: 400px;
    width: 50%;
    margin: 0 8px;
    padding: 20px;
  }
}

</style>