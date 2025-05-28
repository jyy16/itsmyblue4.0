<template>
  <div class="test-container">
    <div class="welcome-screen">
      <div class="welcome-content">

        <div class="preface-section">
          <h3>前言</h3>
          <p>
            您好！我们是北京大学心理与认知科学学院的学生，本实验欲测量色彩语义空间的个体差异。本测试基于通用的色彩感知评估模型，您在完成本测试，为我们的认知实验提供数据支持的同时，也可以了解自身对色彩边界的个体定义：在每次测试结束后会获得我们对您的色彩边界评估结果。
          </p>
        </div>

        <div class="instruction-section">
          <h3>测试说明</h3>

          <div class="subsection">
            <h4>📝 内容</h4>
            <p>通过一系列色彩对（蓝-绿、黄-绿、蓝-紫）分类任务，评估您的色彩辨别阈值。</p>
          </div>

          <div class="subsection">
            <h4>⏳ 流程</h4>
            <p>测试共需约5-10分钟，共6次测试，每次测试结束后系统将实时生成数据。</p>
          </div>

          <div class="subsection">
            <h4>⚙️ 要求</h4>
            <p>请将设备调整至高亮度，并确保在同一光源下作答，确保色彩显示准确。</p>
          </div>
        </div>
        <button class="start-button" @click="handleStart">
          开始正式测试
          <span class="icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // 声明要触发的事件
  emits: ['start'],

  methods: {
    handleStart() {
      this.$emit('start') // 显式触发父组件监听的事件
    }
  }
}
</script>

<style scoped>
@import './TestManager.css';
</style>