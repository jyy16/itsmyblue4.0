<template>
  <div class="test-container">
    <!-- 欢迎界面 -->
    <WelcomeScreen v-if="currentStage === 'welcome'" @start="startTest" />

    <!-- 测试组件 -->
    <component
      :is="currentTestComponent"
      @nextTest="nextTest"
      v-if="currentStage === 'testing'"
      :key="componentKey"
      :testPosition="currentIndex + 1"
      :totalTests="testSequence.length"
      :testGroup="testGroup"
      :testPercentage="currentTestPercentage"
    />

    <!-- 过渡界面 -->
    <TransitionScreen
      v-if="currentStage === 'transition'"
      :countdown="transitionCountdown"
      :messages="transitionMessages"
    />

    <!-- 反馈界面 -->
    <FeedbackScreen
      v-if="currentStage === 'complete' && !showCompletionScreen"
      @feedback-submitted="handleFeedback"
    />

    <!-- 完成界面 -->
    <CompletionScreen
      v-if="currentStage === 'complete' && showCompletionScreen"
      @request-action="handleCompletionAction"
    />

    <!-- 信息表单 -->
    <InformationSheet
      v-if="showInfoForm"
      @close="showInfoForm = false"
      @submit_info="handleInfoSubmit"
    />

    <!-- 色觉分析 -->
    <ShowPerspectionScale
      v-if="showPerceptionScale"
      @close="showPerceptionScale = false"
      :values="perceptionValues"
    />
  </div>
</template>

<script>
import { testSequence, TEST_TYPES } from '../utils/testConfig';
import BlueGreenTest from './BlueGreenTest.vue';
import YellowGreenTest from './YellowGreenTest.vue';
import BluePurpleTest from './BluePurpleTest.vue';
import WelcomeScreen from './WelcomeScreen.vue';
import TransitionScreen from './TransitionScreen.vue';
import CompletionScreen from './CompletionScreen.vue';
import InformationSheet from './InformationSheet.vue';
import ShowPerspectionScale from './ShowPerspectionScale.vue';
import FeedbackScreen from './FeedbackScreen.vue';

export default {
  name: 'TestManager',
  components: {
    BlueGreenTest,
    YellowGreenTest,
    BluePurpleTest,
    WelcomeScreen,
    TransitionScreen,
    CompletionScreen,
    InformationSheet,
    ShowPerspectionScale,
    FeedbackScreen
  },
  data() {
    return {
      currentStage: 'welcome', // 'welcome', 'testing', 'transition', 'complete'
      currentIndex: 0,
      componentKey: 0,
      testResults: [],
      testSequence: testSequence,
      saveStatus: '',
      saveError: '',
      testGroup: '',
      userId: '', // 用户ID字段
      testPercentages: [], // 存储随机分配的测试比例

      // 过渡界面相关
      transitionCountdown: 3,
      transitionMessages: [
        '正在准备下一个测试...',
        '请稍等片刻...',
        '马上就好...',
        '正在加载测试数据...'
      ],

      showCompletionScreen: false,
      // 完成界面相关
      showInfoForm: false,
      showPerceptionScale: false,
      userFeedback: '',
      perceptionValues: {
        GB: 175,
        BP: 230,
        YG: 90
      }
    }
  },
  computed: {
    currentTestComponent() {
      const type = testSequence[this.currentIndex];
      switch(type) {
        case TEST_TYPES.BLUE_PURPLE:
          return 'BluePurpleTest';
        case TEST_TYPES.BLUE_GREEN:
          return 'BlueGreenTest';
        case TEST_TYPES.GREEN_YELLOW:
          return 'YellowGreenTest';
        default:
          return null;
      }
    },
    // 获取当前测试的比例
    currentTestPercentage() {
      return this.testPercentages[Math.floor(this.currentIndex / 2)] || 0;
    }
  },
  methods: {
    startTest() {
      this.currentIndex = 0;
      this.testGroup = Math.random() > 0.5 ? 'control' : 'social';
      
      // 生成随机不重复的测试比例
      this.generateRandomPercentages();

      // 生成唯一用户ID或从localStorage获取已有ID
      if (!localStorage.getItem('colorTestUserId')) {
        this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('colorTestUserId', this.userId);
      } else {
        this.userId = localStorage.getItem('colorTestUserId');
      }
      this.componentKey++;
      this.currentStage = 'testing';
    },

    // 生成随机不重复的测试比例
    generateRandomPercentages() {
      const percentages = [50, 70, 90];
      this.testPercentages = [];
      
      // 创建百分比数组的副本
      const availablePercentages = [...percentages];
      
      // 为每个测试随机分配一个比例
      for (let i = 0; i < 3; i++) {
        if (availablePercentages.length > 0) {
          // 随机选择一个索引
          const randomIndex = Math.floor(Math.random() * availablePercentages.length);
          // 获取该索引对应的百分比
          const percentage = availablePercentages[randomIndex];
          // 将该百分比添加到测试百分比数组
          this.testPercentages.push(percentage);
          // 从可用百分比数组中移除该百分比
          availablePercentages.splice(randomIndex, 1);
        } else {
          // 如果测试数量超过了可用百分比数量，则重新使用这些百分比
          const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];
          this.testPercentages.push(randomPercentage);
        }
      }
      
    },

    nextTest(result) {
      let testResult;
      if (result && (this.currentIndex == 0 || this.currentIndex == 2 || this.currentIndex == 4)) {
        testResult = {
          testType: testSequence[this.currentIndex],
          threshold: result.threshold,
          loadTime: result.loadtime,
          testPosition: this.currentIndex + 1,
          totalTests: testSequence.length,
          testGroup: this.testGroup,
          testPercentage: this.testPercentages[this.currentIndex / 2] // 记录当前测试的比例
        };
      } else {
        testResult = {
          testType: testSequence[this.currentIndex],
          threshold: result.threshold,
          loadTime: result.loadtime,
          testPosition: this.currentIndex + 1,
          totalTests: testSequence.length,
          testGroup: this.testGroup, 
        };
      }
      this.testResults.push(testResult);

      // 更新色觉分析数据
      this.updatePerceptionValues(testResult);

      // 显示过渡界面
      this.currentStage = 'transition';

      // 设置倒计时
      this.transitionCountdown = 3;
      const countdownTimer = setInterval(() => {
        this.transitionCountdown--;
        if (this.transitionCountdown <= 0) {
          clearInterval(countdownTimer);
          this.proceedToNextTest();
        }
      }, 1000);
    },

    proceedToNextTest() {
      if (this.currentIndex < testSequence.length - 1) {
        this.currentIndex++;
        this.componentKey++; // 强制组件重新创建
        this.currentStage = 'testing';
      } else {
        this.currentStage = 'complete';
      }
    },

    saveResults() {
      localStorage.setItem(`testResults_${this.userId}`, JSON.stringify(this.testResults));
      console.log('Results saved at home!');

      const dataToSend = {
        results: this.testResults,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        testGroup: this.testGroup,
        userId: this.userId,
        feedback: this.userFeedback,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        }
      };

      // 使用相对路径，避免硬编码
      fetch('/api/saveResults',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.saveStatus = 'Results saved successfully!';
          console.log('Results saved successfully!');
        } else {
          this.saveError = 'Failed to save results. Please try again later.';
          console.error('Failed to save results:', data.message);
        }
      })
      .catch(error => {
        this.saveError = 'An error occurred while saving results.' + error.message;
        console.error('Error saving results:', error);
      })
    },

    // 新增：处理用户反馈
    handleFeedback(feedback) {
      this.userFeedback = feedback;
      this.showCompletionScreen = true;
      // 更新保存的结果，包含用户反馈
      this.saveResults();
    },

    // 处理完成界面的操作请求
    handleCompletionAction(action) {
      if (action === 'show-info-form') {
        this.showInfoForm = true;
      } else if (action === 'show-perception-scale') {
        this.showPerceptionScale = true;
      }
    },

    // 处理信息提交
    handleInfoSubmit(info) {
      localStorage.setItem(`testResults_${this.userId}`, JSON.stringify(this.testResults));
      console.log('Results saved at home!');

      const dataToSend = {
        results: this.testResults,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        testGroup: this.testGroup,
        userId: this.userId,
        feedback: this.userFeedback,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        },
        userInfo: info
      };

      // 使用相对路径，避免硬编码
      fetch('/api/saveResults',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.saveStatus = 'Results saved successfully!';
          console.log('Results saved successfully!');
        } else {
          this.saveError = 'Failed to save results. Please try again later.';
          console.error('Failed to save results:', data.message);
        }
      })
      .catch(error => {
        this.saveError = 'An error occurred while saving results.' + error.message;
        console.error('Error saving results:', error);
      })
      this.showInfoForm = false;
    },
    

    // 更新色觉分析数据
    updatePerceptionValues(testResult) {
      if (testResult.testType === TEST_TYPES.BLUE_GREEN) {
        this.perceptionValues.GB = testResult.threshold;
      } else if (testResult.testType === TEST_TYPES.BLUE_PURPLE) {
        this.perceptionValues.BP = testResult.threshold;
      } else if (testResult.testType === TEST_TYPES.GREEN_YELLOW) {
        this.perceptionValues.YG = testResult.threshold;
      }
      console.log(this.perceptionValues)
    }
  }
}
</script>

<style scoped>
@import './TestManager.css';
</style>
