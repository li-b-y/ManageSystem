<template>
  <el-container>
    <el-header>
      <div class="left">
        <img src="../assets/imgs/shop.png" >
        <span>电商管理系统</span>
      </div>
      <div class="right">
        <span>欢迎您：{{userInfo.username}}</span>
        <el-button type="warning" @click="exit">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width= "isCollapse ? 200px : 50px">
        <div class="toggle-btn" @click="isCollapse=!isCollapse">|||</div>
        <el-menu :default-active="$route.path" unique-opened router :collapse="isCollapse" :collapse-transition="false">
            <el-submenu :index="item.id+''" v-for="item in menuData" :key="item.id">
              <template slot="title">
                <i :class="iconList[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item :index="'/'+child.path" v-for="child in item.children" :key="child.id">
                <template>
                  <i class="el-icon-menu"></i>
                  <span>{{child.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home.vue",
  data() {
    return {
      userInfo: null,
      menuData: [],
      iconList: {
        "201": "iconfont icon-shouye",
        "125": "iconfont icon-users",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju"
      },
      isCollapse: false
      }
  },
  created() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.getMenuList();
  },
  methods: {
    exit() {
      this.$confirm('此操作将退出登录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '已退出当前账号!',
        });
        sessionStorage.clear();
        this.$router.push('/login');
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        });
      });
    },
    async getMenuList() {
      const {data:res} = await this.$http.get('menus');
      if(res.meta.status != 200) {
        return this.$message.error('请求失败');
      }
      this.menuData = res.data;
      //console.log(this.menuData);
    },
  }
}
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
    min-width: 1000px;
  }
  .el-header {
    background: url("../assets/imgs/header_bg.gif") repeat-x center;
    height: 50px!important; //!important优先级最高
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;

    .left {
      img {
        width: 40px;
        height: 40px;
      }
      margin-right: 700px;
      display: flex;
      align-items: center;
    }
  }
  .el-aside {
    .toggle-btn {
      background: #607099;
      line-height: 24px;
      text-align: center;
      color: #ffffff;
      letter-spacing: 3px;
      cursor: pointer; //游标变成小白手
    }
  }
</style>