<template>
  <div class="login-container">
    <transition name="fade">
      <div class="login-card">
        <div class="card-left">
          <div class="login-logo animate__animated animate__fadeIn">
            <img src="/logo.svg" alt="SMART" class="logo" />
          </div>
        </div>
        
        <div class="card-right">
          <div class="form-container">
            <div class="input-field animate__animated animate__fadeIn animate__delay-1">
              <label>
                <el-icon><User /></el-icon>
                <input 
                  type="text" 
                  placeholder="用户名 / 邮箱" 
                  v-model="username"
                  @keyup.enter="handleLogin"
                />
              </label>
              <span class="error-msg" v-if="usernameError">{{ usernameError }}</span>
            </div>
            
            <div class="input-field animate__animated animate__fadeIn animate__delay-2">
              <label>
                <el-icon><Lock /></el-icon>
                <input 
                  type="password" 
                  placeholder="密码" 
                  v-model="password"
                  @keyup.enter="handleLogin"
                />
              </label>
              <span class="error-msg" v-if="passwordError">{{ passwordError }}</span>
            </div>
            
            <div class="login-button-container animate__animated animate__fadeIn animate__delay-3">
              <button 
                class="login-now-btn" 
                @click="handleLogin"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">登录</span>
                <span v-else class="loading-icon"></span>
                <el-icon class="arrow-icon" v-if="!isLoading"><arrow-right /></el-icon>
              </button>
            </div>
            
            <div class="login-options animate__animated animate__fadeIn animate__delay-4">
              <div class="remember-me">
                <input type="checkbox" id="remember" v-model="rememberMe" />
                <label for="remember">记住我</label>
              </div>
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>
            
            <div class="social-login animate__animated animate__fadeIn animate__delay-5">
              <p>其他登录方式</p>
              <div class="social-icons">
                <a href="#" class="social-icon">
                  <el-icon><ChatDotRound /></el-icon>
                </a>
                <a href="#" class="social-icon">
                  <el-icon><User /></el-icon>
                </a>
                <a href="#" class="social-icon">
                  <el-icon><Message /></el-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="login-footer animate__animated animate__fadeIn animate__delay-6">
      <p>© {{ currentYear }} SMART智慧教育平台 版权所有</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, ArrowRight, ChatDotRound, Message } from '@element-plus/icons-vue'
import 'animate.css'

// 路由实例
const router = useRouter()

// 表单数据
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const usernameError = ref('')
const passwordError = ref('')

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear())

// 验证表单
const validateForm = () => {
  let isValid = true
  
  // 重置错误信息
  usernameError.value = ''
  passwordError.value = ''
  
  // 验证用户名
  if (!username.value.trim()) {
    usernameError.value = '请输入用户名'
    isValid = false
  }
  
  // 验证密码
  if (!password.value) {
    passwordError.value = '请输入密码'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = '密码长度不能少于6位'
    isValid = false
  }
  
  return isValid
}

// 处理登录
const handleLogin = () => {
  // 表单验证
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  // 模拟登录请求
  setTimeout(() => {
    isLoading.value = false
    
    // 保存用户信息到本地存储
    if (rememberMe.value) {
      localStorage.setItem('username', username.value)
    } else {
      localStorage.removeItem('username')
    }
    
    // 保存登录状态
    localStorage.setItem('isAuthenticated', 'true')
    
    // 使用Vue Router进行跳转
    router.push('/home')
  }, 1500)
}

// 初始化表单
const initForm = () => {
  // 如果之前选择了记住我，则自动填充用户名
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    username.value = savedUsername
    rememberMe.value = true
  }
}

// 初始化表单
onMounted(() => {
  initForm()
})
</script>

<style scoped>
/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate__delay-1 {
  animation-delay: 0.2s;
}

.animate__delay-2 {
  animation-delay: 0.4s;
}

.animate__delay-3 {
  animation-delay: 0.6s;
}

.animate__delay-4 {
  animation-delay: 0.8s;
}

.animate__delay-5 {
  animation-delay: 1s;
}

.animate__delay-6 {
  animation-delay: 1.2s;
}

.login-container {
  width: 100%;
  height: 100vh;
  background-color: #b4a7d6;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.login-card {
  width: 600px;
  height: 450px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  position: relative;
}

.card-left {
  width: 240px;
  height: 100%;
  background: linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-left::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  border-style: solid;
  border-width: 450px 120px 0 0;
  border-color: transparent #fff transparent transparent;
  z-index: 1;
}

.login-logo {
  width: 100px;
  height: 100px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 100px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
  transition: all 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.login-logo .logo {
  width: 60px;
  height: 60px;
}

.card-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-field {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.input-field label {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  transition: all 0.3s ease;
}

.input-field label:focus-within {
  border-bottom-color: #7e57c2;
}

.input-field label .el-icon {
  color: #7e57c2;
  margin-right: 10px;
}

.input-field input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  padding: 10px 0;
  width: 100%;
  color: #333;
}

.input-field input::placeholder {
  color: #aaa;
  transition: all 0.3s ease;
}

.input-field input:focus::placeholder {
  color: #7e57c2;
  transform: translateY(-15px);
  font-size: 10px;
}

.error-msg {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 5px;
  display: block;
  height: 16px;
}

.login-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.login-now-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #7e57c2 0%, #5e35b1 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  font-size: 16px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(126, 87, 194, 0.3);
  position: relative;
  min-width: 180px;
}

.login-now-btn:hover {
  box-shadow: 0 5px 15px rgba(126, 87, 194, 0.5);
  transform: translateY(-2px);
}

.login-now-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(126, 87, 194, 0.4);
}

.login-now-btn:disabled {
  background: #bbb;
  cursor: not-allowed;
  box-shadow: none;
}

.arrow-icon {
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.login-now-btn:hover .arrow-icon {
  transform: translateX(3px);
}

.loading-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
  cursor: pointer;
}

.remember-me label {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.forgot-password {
  font-size: 14px;
  color: #7e57c2;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #5e35b1;
  text-decoration: underline;
}

.social-login {
  margin-top: 30px;
  text-align: center;
}

.social-login p {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #7e57c2;
  font-size: 18px;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: #7e57c2;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(126, 87, 194, 0.3);
}

.login-footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 400px;
    height: auto;
    flex-direction: column;
  }
  
  .card-left {
    width: 100%;
    height: 120px;
  }
  
  .card-left::before {
    border-width: 100px 400px 0 0;
  }
  
  .login-logo {
    margin-right: 0;
    margin-bottom: 60px;
    width: 80px;
    height: 80px;
    transform: translateY(30px);
  }
  
  .login-logo .logo {
    width: 50px;
    height: 50px;
  }
  
  .card-right {
    padding: 30px 20px;
  }
  
  .login-now-btn {
    width: 100%;
  }
  
  .social-icons {
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 95%;
  }
  
  .card-left::before {
    border-width: 80px 300px 0 0;
  }
  
  .login-logo {
    width: 70px;
    height: 70px;
    transform: translateY(25px);
  }
  
  .login-logo .logo {
    width: 40px;
    height: 40px;
  }
  
  .input-field label {
    padding-bottom: 3px;
  }
  
  .input-field input {
    padding: 8px 0;
    font-size: 15px;
  }
  
  .login-button-container {
    margin-top: 20px;
  }
  
  .login-now-btn {
    padding: 10px 30px;
    font-size: 15px;
  }
  
  .login-footer {
    font-size: 12px;
  }
}
</style>
