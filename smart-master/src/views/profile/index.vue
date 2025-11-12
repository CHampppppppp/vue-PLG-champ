<template>
  <div class="profile-container">
    <!-- 顶部标题 -->
    <div class="profile-header">
      <h2>个人中心</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-content">
      <!-- 左侧用户信息卡片 -->
      <div class="profile-card">
        <div class="avatar-section">
          <el-avatar :size="120" :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
          <div class="avatar-actions">
            <el-button type="primary" text @click="showAvatarDialog = true">
              <el-icon><Upload /></el-icon>更换头像
            </el-button>
          </div>
        </div>
        
        <div class="user-info-section">
          <h3>{{ userInfo.username }}</h3>
          <p class="user-role">{{ userInfo.role || '教师' }}</p>
          
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ userInfo.realName || '未设置' }}</span>
          </div>
          
          <div class="info-item">
            <el-icon><Message /></el-icon>
            <span>{{ userInfo.email || '未设置' }}</span>
          </div>
          
          <div class="info-item">
            <el-icon><Iphone /></el-icon>
            <span>{{ userInfo.phone || '未设置' }}</span>
          </div>
          
          <div class="info-item">
            <el-icon><School /></el-icon>
            <span>{{ userInfo.school || '未设置' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧设置区域 -->
      <div class="settings-section">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form ref="basicForm" :model="userInfo" label-width="100px">
              <el-form-item label="真实姓名">
                <el-input v-model="userInfo.realName" placeholder="请输入真实姓名" />
              </el-form-item>
              
              <el-form-item label="性别">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="学校">
                <el-input v-model="userInfo.school" placeholder="请输入学校名称" />
              </el-form-item>
              
              <el-form-item label="个人简介">
                <el-input 
                  v-model="userInfo.bio" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="介绍一下自己..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveBasicInfo">保存修改</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <!-- 账号安全 -->
          <el-tab-pane label="账号安全" name="security">
            <div class="security-item">
              <div class="security-info">
                <h4>登录密码</h4>
                <p>定期修改密码可以提高账号安全性</p>
              </div>
              <el-button type="primary" text @click="showPasswordDialog = true">修改密码</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>绑定邮箱</h4>
                <p>{{ userInfo.email || '未绑定邮箱' }}</p>
              </div>
              <el-button type="primary" text @click="showEmailDialog = true">
                {{ userInfo.email ? '更换邮箱' : '绑定邮箱' }}
              </el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>绑定手机</h4>
                <p>{{ userInfo.phone || '未绑定手机' }}</p>
              </div>
              <el-button type="primary" text @click="showPhoneDialog = true">
                {{ userInfo.phone ? '更换手机' : '绑定手机' }}
              </el-button>
            </div>
          </el-tab-pane>
          
          <!-- 系统设置 -->
          <el-tab-pane label="系统设置" name="system">
            <div class="system-setting-item">
              <div class="setting-info">
                <h4>主题设置</h4>
                <p>切换系统主题颜色</p>
              </div>
              <el-color-picker v-model="themeColor" />
            </div>
            
            <div class="system-setting-item">
              <div class="setting-info">
                <h4>消息通知</h4>
                <p>设置系统消息接收方式</p>
              </div>
              <el-switch v-model="notificationEnabled" active-text="开启" inactive-text="关闭" />
            </div>
            
            <div class="system-setting-item">
              <div class="setting-info">
                <h4>隐私设置</h4>
                <p>管理您的隐私选项</p>
              </div>
              <el-button type="primary" text @click="showPrivacyDialog = true">设置</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 更换头像对话框 -->
    <el-dialog v-model="showAvatarDialog" title="更换头像" width="500px">
      <el-upload
        class="avatar-uploader"
        action="/api/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="avatarTempUrl" :src="avatarTempUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAvatar">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword('passwordForm.confirmPassword')">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog v-model="showEmailDialog" title="修改邮箱" width="500px">
      <el-form :model="emailForm" :rules="emailRules" ref="emailForm" label-width="100px">
        <el-form-item label="当前邮箱" prop="currentEmail">
          <el-input v-model="emailForm.currentEmail" type="text" />
        </el-form-item>
        <el-form-item label="新邮箱" prop="newEmail">
          <el-input v-model="emailForm.newEmail" type="text"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="ChangeEmail">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 用户信息
const userInfo = reactive({
  username: '张老师',
  realName: '张三',
  avatar: '',
  role: '高级教师',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  school: '第一中学',
  gender: 1,
  bio: '数学教师，专注于高中数学教学10年'
})

// 标签页控制
const activeTab = ref('basic')

// 头像上传相关
const showAvatarDialog = ref(false)
const avatarTempUrl = ref('')
const handleAvatarSuccess = (res, file) => {
  avatarTempUrl.value = URL.createObjectURL(file.raw)
}
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}
const confirmAvatar = () => {
  if (avatarTempUrl.value) {
    userInfo.avatar = avatarTempUrl.value
    ElMessage.success('头像更换成功')
    showAvatarDialog.value = false
  } else {
    ElMessage.warning('请选择要上传的头像')
  }
}

// 修改密码相关
const showPasswordDialog = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ]
}
const changePassword = (prop) => {
  // 这里添加修改密码的逻辑
  if(prop.value === "" || prop.value.trim() === "")
    ElMessage.error('密码修改失败')
  ElMessage.success('密码修改成功')
  showPasswordDialog.value = false
}

const showEmailDialog = ref(false)
const emailForm = reactive({
  currentEmail:'',
  newEmail:''
})
const emailRules = {
  currentEmail:[
    { required: true, message:'请输入当前邮箱', trigger:'blur'}
  ],
  newEmail:[
    {required:true, message:'请输入新邮箱', trigger:'blur'}
  ]
}
const changeEmail = () => {
  //这里添加修改邮箱的逻辑
  ElMessage.success('邮箱修改成功')
  showEmailDialog.value = false
}

// 保存基本信息
const saveBasicInfo = () => {
  ElMessage.success('基本信息已保存')
}

// 系统设置相关
const themeColor = ref('#409EFF')
const notificationEnabled = ref(true)
</script>

<style scoped>
.profile-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.profile-header {
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.profile-content {
  flex: 1;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.profile-card {
  width: 300px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-actions {
  margin-top: 15px;
}

.user-info-section {
  width: 100%;
}

.user-info-section h3 {
  margin: 0 0 5px 0;
  text-align: center;
  font-size: 18px;
  color: #303133;
}

.user-role {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-item .el-icon {
  margin-right: 10px;
  color: #909399;
}

.settings-section {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.profile-tabs {
  height: 100%;
}

.security-item, .system-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.security-info h4, .setting-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.security-info p, .setting-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .avatar {
  width: 200px;
  height: 200px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader-icon:hover {
  border-color: #409EFF;
}
</style>