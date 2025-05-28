<!-- ColorPerceptionScale.vue -->
<template>
    <div class="color-perception-modal">
      <div class="scale-container">
        <h3>您的色觉倾向分析（注：分析不具有严谨的科学性，请勿作为医疗建议）</h3>
        
        <!-- 蓝-绿标尺 -->
        <div class="scale-group">
          <h4>蓝-绿感知倾向</h4>
          <div class="color-scale bg-blue-green">
            <div class="indicator" :style="{ left: new_values.GB + '%' }"></div>
          </div>
        </div>
  
        <!-- 蓝-紫标尺 -->
        <div class="scale-group">
          <h4>蓝-紫感知倾向</h4>
          <div class="color-scale bg-blue-purple">
            <div class="indicator" :style="{ left: new_values.BP + '%' }"></div>
          </div>
        </div>
  
        <!-- 绿-黄标尺 -->
        <div class="scale-group">
          <h4>绿-黄感知倾向</h4>
          <div class="color-scale bg-green-yellow">
            <div class="indicator" :style="{ left: new_values.YG + '%' }"></div>
          </div>
        </div>
  
        <button @click="$emit('close')" class="close-btn">关闭</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      values: {
        type: Object,
        required: true,
        default: () => ({
          GB: 175,
          BP: 230,
          YG: 90
        })
      }
    },

    data() {
    return {
      SCALE_RANGES : {
  GB: { min: 120, max: 240 },  // 蓝绿标尺
  BP: { min: 240, max: 280 },  // 蓝紫标尺
  YG: { min: 60,  max: 90 }   // 绿黄标尺
  }
    }
  },

  computed: {
  new_values() {
    return {
      GB: this.calcPosition('GB', this.values.GB),
      BP: this.calcPosition('BP', this.values.BP),
      YG: this.calcPosition('YG', this.values.YG)
    }
  }
},
methods: {
  calcPosition(type, value) {
    const range = this.SCALE_RANGES[type]
    // 约束数值在有效范围内
    const clamped = Math.max(range.min, Math.min(range.max, value))
    // 计算百分比
    return ((clamped - range.min) / (range.max - range.min)) * 100
  }
}

    }

  </script>
  
  <style scoped>
  .color-perception-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .scale-container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif; /* 中文字体优化 */
    color: #2c3e50; /* 主文字色彩 */
    line-height: 1.6; /* 行高优化 */
  }
  
  .scale-group {
    margin: 2rem 0;
  }
  
  .color-scale {
    height: 30px;
    border-radius: 15px;
    margin: 1rem 0;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .indicator {
    position: absolute;
    width: 3px;
    height: 40px;
    background: #333;
    top: -5px;
    transform: translateX(-50%);
    transition: left 0.3s ease;
  }
  
  .bg-blue-green {
    background: linear-gradient(to right, hsl(120, 100%, 50%) 0%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%)100%);
  }
  
  .bg-blue-purple {
    background: linear-gradient(to right,hsl(240, 100%, 50%) 0%,hsl(260, 100%, 50%) 50%,hsl(280, 100%, 50%) 100% );
  }
  
  .bg-green-yellow {
    background: linear-gradient(
    to right,
    hsl(60, 100%, 50%) 0%,        /* 黄绿色 */
    hsl(75, 100%, 50%) 50%,      /* 嫩绿色 */
    hsl(90, 100%, 50%) 100%      /* 纯绿色 */
  );
  }
  
  .close-btn {
    display: block;
    margin: 1rem auto 0;
    padding: 0.8rem 2rem;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .close-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
  </style>