<template>
    <div class="test-container">
           <!-- 完成界面 -->
      <div class="complete-screen">
        <div class="complete-content"> 
          <div class="preface-section">
            <h3></h3>
            <h3></h3>

        </div>
        <div class="preface-section">
            <h3></h3>
            <h3></h3>

        </div>
      <!-- The codes above are confusing but necessary. -->
      
        <div class="preface-section">
            <h3>测试已结束</h3>
            <p>亲爱的被试：</p>
            <p>您好！</p>
            <p> 我们是北京大学心理与认知科学学院的一个学生小组，本实验是社会心理学课程作业的一部分内容，为获得有效的实验数据，在符合相关规定的前提下，隐瞒了本实验的真实目的，并提供了虚假的测试数据。测试结束之后，为保障您的相关权益，我们将向您解释实验的相关内容。</p>
        </div>
        <div class="subsection">
              <h4>实验目的</h4>
              <p>通过探究权威结论是否会使个体对感知觉进行矫正，即研究从众心理和社会比较对感知觉的影响</p>
        </div>
       <div class="subsection">
              <h4>我们的假设</h4>
              <p>获得权威结论后，人们可能会有矫正感知觉的倾向，方向可能是更靠近大众，或是更加独特与极端。</p>
              <p>若该现象确实发生，则造成这一现象的原因可能是虚假自我独特性或社会比较。</p>
        </div>
        <div class="subsection">
              <h4>其他事项</h4>
              <p>为了进行协变量分析，我们需要您的年龄、性别等信息，如果您不希望提供这些信息，您的任何实验数据都将不会被记录</p>
              <p>如果您对本实验仍有相关的疑问，您可以在6月1日前发送相关信件到邮箱</p>
              <p>2400013773@stu.pku.edu.cn</p>
        </div>
        <button class="start-button" @click="triggershowInfoForm">
          填写个人信息
          <span class="icon">→</span>
        </button>

        <button class="start-button" @click="triggershowPerceptionScale">
         查看色觉分析
        <span class="icon">🎨</span>
        </button>



        <div class="preface-section">
            <h3>无论如何，感谢您的配合！</h3>
            <p>北京大学心理与认知科学学系学生小组</p>
        </div>
      

        </div>
    </div>
  </div>


</template>

<script>


export default {
  emits: ['action-required'],
  components: {

  },

  data() {
    return {

    }
  },

  methods: {
      triggershowInfoForm() {
      // 触发通用事件，不携带数据
      this.$emit('request-action', 'show-info-form')
    },
    triggershowPerceptionScale() {
      // 触发通用事件，不携带数据
      this.$emit('request-action', 'show-perception-scale')
    }
  }
  }

</script>


<style scoped>
@import './TestManager.css';
</style>