<template>
  <div class="test-container">
    <div class="complete-screen">
      <div class="complete-content">
        <div class="preface-section">
          <h3>实验反馈</h3>
          <p>亲爱的被试：</p>
          <p>您好！</p>
          <p>感谢您完成本次实验。在进入实验说明之前，我们想了解您的想法。</p>
        </div>
        
        <!-- 添加询问是否第一次做测试的部分 -->
        <div class="subsection first-time-question">
          <h4>这是您第一次参与本测试吗？</h4>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="isFirstTime" value="yes"> 是
            </label>
            <label>
              <input type="radio" v-model="isFirstTime" value="no"> 否
            </label>
          </div>
          <p v-if="isFirstTime === 'no'" class="note-text">
            请在下方反馈中注明这不是您第一次做本测试，并简述您之前参与的情况。
          </p>
        </div>
        
        <div class="subsection">
          <h4>您对本实验有什么疑问吗？</h4>
          <textarea 
            v-model="feedback" 
            class="feedback-textarea" 
            :placeholder="feedbackPlaceholder"
            rows="5"
          ></textarea>
        </div>
        
        <div class="button-group">
          <button class="start-button" @click="submitFeedback">
            提交反馈
            <span class="icon">→</span>
          </button>
          
          <button class="start-button skip-button" @click="skipFeedback">
            跳过
            <span class="icon">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['feedback-submitted'],
  data() {
    return {
      feedback: '',
      isFirstTime: 'yes' // 默认为第一次参与
    }
  },
  computed: {
    feedbackPlaceholder() {
      return this.isFirstTime === 'no' 
        ? '请在此输入您的疑问或反馈，并注明这不是您第一次做本测试...' 
        : '请在此输入您的疑问或反馈...';
    }
  },
  methods: {
    submitFeedback() {
      let finalFeedback = this.feedback;
      
      // 如果不是第一次做测试且用户没有在反馈中提及，自动添加说明
      if (this.isFirstTime === 'no' && !this.feedback.includes('不是第一次')) {
        finalFeedback = `[不是第一次做本测试] ${this.feedback}`;
      }
      
      // 触发事件并传递反馈内容
      this.$emit('feedback-submitted', finalFeedback);
    },
    skipFeedback() {
      // 触发事件但不传递内容
      this.$emit('feedback-submitted', '');
    }
  }
}
</script>

<style scoped>
@import './TestManager.css';

.feedback-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 10px;
  resize: vertical;
  font-family: inherit;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.skip-button {
  background-color: #6c757d;
}

.skip-button:hover {
  background-color: #5a6268;
}

.first-time-question {
  margin-bottom: 20px;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.note-text {
  margin-top: 10px;
  color: #dc3545;
  font-size: 14px;
  font-style: italic;
}
</style>