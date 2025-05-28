<!-- InfoSheet.vue -->
<template>
  <div class="info-modal">
    <div class="modal-content">
      <div v-if="showSuccess" class="success-message">
        <svg class="success-icon" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <h2>已成功提交！</h2>
        <p>{{ countdown }}秒后自动关闭</p>
      </div>

      <template v-else>
        <h3>个人信息登记</h3>
        <form @submit.prevent="handleSubmit">
          <!-- 性别 -->
          <div class="form-group">
            <label class="required">性别：</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="formData.gender" value="male"> 男
              </label>
              <label>
                <input type="radio" v-model="formData.gender" value="female"> 女
              </label>
            </div>
            <div v-if="errors.gender" class="error-message">
              <span class="error-icon">!</span>{{ errors.gender }}
            </div>
          </div>

          <!-- 年龄 -->
          <div class="form-group">
            <label class="required">年龄：</label>
            <input type="number" 
            v-model="formData.age"
            class="form-input"
            placeholder="请输入年龄"
            >
            <div v-if="errors.age" class="error-message">
              <span class="error-icon">!</span>{{ errors.age }}
            </div>
          </div>

          <!-- 学生身份 -->
          <div class="form-group">
            <label class="required">是否是北大学生？</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="formData.isPkuStudent" :value="true"> 是
              </label>
              <label>
                <input type="radio" v-model="formData.isPkuStudent" :value="false"> 否
              </label>
            </div>
            <div v-if="errors.isPkuStudent" class="error-message">
              <span class="error-icon">!</span>{{ errors.isPkuStudent }}
            </div>
          </div>

          <!-- 手机号 -->
          

          <!-- 操作按钮 -->
          <div class="button-group">
            <button type="button" @click="handleCancel">取消</button>
            <button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSuccess: false,
      isSubmitting: false,
      countdown: 3,
      formData: {
        gender: '',
        age: null,
        isPkuStudent: null,
        phone: ''
      },
      errors: {
        gender: '',
        age: '',
        isPkuStudent: '',
        phone: ''
      }
    }
  },
  methods: {
    

    validateForm() {
      let isValid = true
      // 重置错误信息
      this.errors = {
        gender: '',
        age: '',
        isPkuStudent: '',
        phone: ''
      }

      // 验证性别
      if (!this.formData.gender) {
        this.errors.gender = '请选择性别'
        isValid = false
      }

      // 验证年龄
      if (!this.formData.age) {
        this.errors.age = '请输入年龄'
        isValid = false
      } else if (this.formData.age < 12 || this.formData.age > 100) {
        this.errors.age = '年龄必须在12-100岁之间'
        isValid = false
      }

      // 验证学生身份
      if (this.formData.isPkuStudent === null) {
        this.errors.isPkuStudent = '请选择学生身份'
        isValid = false
      }

      

      return isValid
    },
    

    async handleSubmit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        // 提交成功后处理
        this.$emit('submit_info', { ...this.formData });
        this.showSuccess = true;
        this.startCountdown();
      } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败，请重试');
      } finally {
        this.isSubmitting = false;
      }
    },
  
    startCountdown() {
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown === 0) {
          clearInterval(timer)
          this.$emit('close')
        }
      }, 1000)
    },

    handleCancel() {
      if (!this.isSubmitting) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
@import './TestManager.css';

.info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999!important;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif; /* 中文字体优化 */
  color: #2c3e50; /* 主文字色彩 */
  line-height: 1.6; /* 行高优化 */
  z-index: 10000; 
}

.required::after {
  content: "*";
  color: #ff4444;
  margin-left: 4px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff4444;
  color: white;
  text-align: center;
  line-height: 16px;
  font-size: 12px;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.button-group button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}


.button-group button[type="submit"]:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.75rem; /* 28px */
  color: #28a745;
  margin: 1rem 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.success-icon {
  width: 64px;
  height: 64px;
  fill: #28a745;
  animation: checkmark 0.6s ease;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.error-message {
  color: #ff4757;
  /* 鲜艳红色 */
  font-weight: 500;
  margin-top: 8px;
  font-size: 14px;
  padding-left: 8px;
  border-left: 3px solid #ff4757;
  /* 红色强调线 */
}



/* 调整输入框 */
input[type="tel"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  color: #2c3e50;
  border-radius: 4px;
}

input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  color: #2c3e50;
  border-radius: 4px;
}


button[type="submit"] {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: 2px solid #357abd;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
}

button[type="button"] {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  color: white;
  border: 2px solid #ff4757;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

button[type="button"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}


</style>