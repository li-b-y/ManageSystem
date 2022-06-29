<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert title="修改商品信息" type="info" show-icon center :closable=false></el-alert>
      <el-steps class="el-steps" :active="activeIndex-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px" label-position="top" @handleChange="handleChange">
        <el-tabs class="el-tabs" v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave"  @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="editForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader v-model="editForm.goods_cat" :options="cateList" :props="showCateProps" clearable @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label= "item.attr_name">
              <el-checkbox-group  v-model="item.attr_vals">
                <el-checkbox v-for="(value,i) in item.attr_vals" :key="i" :label="value" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload class="upload-demo" :action="uploadURL" :headers="headerObj" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :file-list="fileList">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
            <el-button class="add-btn" type="primary" @click="editGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" class="preview-img">
    </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: "Add.vue",
  data() {
    return {
      activeIndex: '0',
      editForm: {},
      editRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
      },
      cateList: [],
      showCateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        children: 'children',
        value: 'cat_id'
      },
      manyData: [],
      onlyData: [],
      uploadURL: 'http://www.tangxiaoyang.vip:8888/api/v2/upload',
      headerObj: {
        Authorization: JSON.parse(sessionStorage.getItem('userInfo')).token
      },
      previewDialogVisible: false,
      previewPath: '',
      fileList: []
    }
  },
  computed: {
    cateId() {
      return this.editForm.goods_cat.length == 3 ? this.editForm.goods_cat[2] : null
    }
  },
  created() {
    this.getGoodsById();
    this.getCateList()
  },
  methods: {
    async getGoodsById() {
      const {data:res} = await this.$http.get(`goods/${this.$route.query.id}`);
      if(res.meta.status !== 200) {
         return this.$message.error('获取失败')
      }
      res.data.goods_cat = res.data.goods_cat.split(',').map(item => {return item * 1})
      res.data.pics.forEach(item => {
        this.fileList.push({
          name: item.pics_id,
          url: item.pics_big_url,
          tmp_path: item.pics_big
        })
        item.pic = item.pics_big;
      })
      this.editForm = res.data;
    },
    async getCateList() {
      const {data:res} = await this.$http.get('categories',{
        params: {type:3}
      });
      if(res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.cateList = res.data;
    },
    handleChange(){
      if(this.editForm.goods_cat.length !== 3) {
        this.editForm.goods_cat = [];
      }
    },
    beforeTabLeave() {
      if(this.editForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！');
        return false;
      }
    },
    async tabClick() {
      console.log(this.activeIndex);
      if(this.activeIndex === '1') {
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/`,{
          params: {sel: 'many'}
        });
        if(res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyData = res.data;
        console.log(this.manyData);
      }
      else if (this.activeIndex === '2') {
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/`,{
          params: {sel: 'only'}
        });
        if(res.meta.status !== 200) {
          return this.$message.error('获取属性失败')
        }
        this.onlyData = res.data;
      }
    },
    handlePreview(file) {
      this.previewPath = file.url;
      this.previewDialogVisible =  true;
    },
    handleRemove(file) {
      const filePath = file.tmp_path || file.response.data.tmp_path;
      const i = this.editForm.pics.findIndex(item => {
        item.pic === filePath
      })
      this.editForm.pics.splice(i,1);
      console.log(this.editForm.pics);
    },
    handleSuccess(response) {
      this.editForm.pics.push({
        pic: response.data.tmp_path
      })
      console.log(this.editForm.pics)
    },
    editGoods() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid)
          return;
        //准备请求前的数据
        //使用lodash工具进行深拷贝
        const form = _.cloneDeep(this.editForm);
        form.goods_cat = form.goods_cat.join(',');

        this.manyData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        this.onlyData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        console.log(form);

        const {data:res} = await this.$http.put(`goods/${this.editForm.goods_id}`, form);
        if(res.meta.status !== 200) {
          return this.$message.error('修改商品失败')
        }
        this.$message.success('修改商品成功')
        this.$router.push('/goods');
      })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-top: 30px;
}
.el-steps {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.preview-img {
  width: 100%;
}
.add-btn {
  margin-top: 15px;
}
</style>