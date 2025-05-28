<template>
  <div class="test-container">
    <div class="transition-screen">
      <div class="transition-content">
        <div class="loader">
          <div class="circle-border">
            <div class="circle-core"></div>
          </div>

        </div>

        <div class="status-message">
          <span class="highlight">{{ messages[messageIndex] }}</span>
        </div>

        <div class="countdown-display">
          <div class="countdown-number">
            {{ countdown }}
          </div>
          <div class="countdown-label">秒后继续</div>
        </div>


      </div>
    </div>


  </div>
</template>

<script>
export default {
  props: {
    countdown: Number,
    messages: Array,
  },

  data() {
    return {
      messageIndex: 0,       // 内部维护的消息索引
      circumference: 2 * Math.PI * 54,  // 固定计算值
      rotateTimer: null,     // 定时器引用
    }
  },

  computed: {
    currentMessage() {
      return this.messages[this.messageIndex]
    },


  },


  mounted() {
    this.rotateTimer = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
    }, 2000);
  },


  beforeUnmount() {
    clearInterval(this.rotateTimer);
  },


}
</script>


<style scoped>
@import './TestManager.css';
</style>