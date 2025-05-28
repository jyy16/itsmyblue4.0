<template>
  <div class="yellow-green-test-wrapper">
    <div :style="containerStyle" class="yellow-green-test-container">
      <div v-if="!showResults" class="yellow-green-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="yellow-green-test-title">
            <span class="background-white">测试<i>你的</i>色彩分类</span>
          </h1>
          <h1 v-else key="main" class="yellow-green-test-title">
            <span class="background-white"><i>我的</i>黄色是<i>你的</i>黄色吗？</span>
          </h1>
        </transition>
      </div>
      <div v-else class="yellow-green-test-content yellow-green-test-result-screen">
        <ResultsForYGTest
          :binPosition="BIN_POSITION"
          :count="BIN_COUNT"
          :xCdf="X_CDF"
          :yCdf="Y_CDF"
          :userThreshold="finalHue"
          :testPosition="$props.testPosition"
          :testGroup="$props.testGroup"
          :testPercentage="$props.testPercentage"
        />
      </div>
      <div v-if="rounds < MAX_ROUNDS" class="yellow-green-test-button-container three-buttons">
        <button @click="selectColor(leftButton)" class="yellow-green-test-button grow-button">
          这是{{ leftButton === 'yellow' ? '黄色' : '绿色' }}
        </button>
        <button @click="handleResetClick" class="yellow-green-test-button mid-reset-button grow-button">
          {{ resetButtonText }}
        </button>
        <button @click="selectColor(rightButton)" class="yellow-green-test-button grow-button">
          这是{{ rightButton === 'yellow' ? '黄色' : '绿色' }}
        </button>
      </div>
      <div v-else class="yellow-green-test-button-container two-buttons">
        <button
          @click="showAbout = true"
          class="yellow-green-test-button final-reset-button grow-button"
        >
        关于
        </button>
        <button @click="emitNextTest" class="yellow-green-test-button final-reset-button grow-button">
          下一个测试
        </button>
      </div>
    </div>
    <div v-if="firstColorMislabeled" class="about-popup">
      <div class="about-content">
        <h2>哎呀！</h2>
        <p>
          第一个色彩总是非常黄或非常绿。如果你错误标记了第一个色彩，
          你将无法获得准确的阈值。这可能表明你的屏幕校准不寻常，
          使用了夜间滤镜，或者你犯了一个错误。要再试一次吗？
        </p>
        <button @click="reset()" class="reset-button reset-button">重置</button>
      </div>
    </div>
    <div
      v-if="rounds == MAX_ROUNDS && (allSame == 'yellow' || allSame == 'green')"
      class="about-popup"
    >
      <div class="about-content">
        <h2>哎呀！</h2>
        <p>
          你将所有色彩都标记为{{ allSame === 'yellow' ? '黄色' : '绿色' }}。我们无法根据你的
          回答推断出边界。这可能表明你的屏幕校准不寻常或使用了夜间滤镜。
        </p>
        <button @click="reset()" class="reset-button reset-button">重置</button>
      </div>
    </div>
    <div v-if="showAbout" class="about-popup">
      <div class="about-content">
        <button @click="showAbout = false" class="close-button">&times;</button>
        <h2>About This Website</h2>
        <p>
          People have different names for the colors they see.
          Language can affect how we memorize and name colors. This is a color naming test designed to measure your personal yellow-green boundary.
        </p>
        <h2>Test validity</h2>
        <p>
          <b><i>This website is for entertainment purposes only.</i></b>
        </p>
        <p>
          Color perception is tricky to measure--vision scientists use specialized calibrated
          equipment to measure color perception. Graphic designers use physical color cards, such as
          those made by Pantone, so that they can communicate colors unambiguously. Here we use your monitor or phone to
          test how you categorize colors, which is far from perfect, since your calibration may
          differ from mine.
        </p>
        <p>
          The validity of the inference is limited by the calibration of your monitor, ambient
          lighting, and filters such as night mode. Despite these limitations, the results should
          have good test-retest reliability <i>on the same device, in the same ambient light</i>,
          which you can verify by taking the test multiple times. If you want to compare your
          results with friends, use the same device in the same ambient light.
        </p>
        <p>
          Getting outlier results doesn't mean there's anything wrong with your vision. It might
          mean you have an idiosyncratic way of naming colors, or that your monitor and lighting is
          unusual.
        </p>
        <h2>Technical Details</h2>
        <p>
          The test asks you to categorize colors sequentially. Colors are often represented in HSL
          (hue, saturation, lightness) color space. Hue 60 is yellow, and hue 120 is green. The test
          focuses on yellow-green hues between 60 and 120. On the web, HSL coordinates are translated
          to sRGB color space, the standard color
          space of the web, which is not perceptually uniform. These sRGB values are translated
          nonlinearly to your monitor through a gamma curve.
        </p>
        <p>
          The test assumes that your responses between yellow and green are represented by a sigmoid
          curve. It sequentially fits that sigmoid curve to your responses:
        </p>

        <img src="@/assets/formula.svg" alt="Formula" />
        <br />
        <p>
          This is equivalent to a logistic regression model. The test uses a maximum-a-posteriori
          (MAP) estimation algorithm (specifically, a second order Newton method implemented in pure
          JS, no calls to a backend) to fit the sigmoid curve to your responses, with a vague prior
          on the scale and offset parameters. It uses the fitted curve to determine which color will
          be presented next. It tries to be smart about where it samples new points, focusing on
          regions where you're predicted to be intermediately confident in your responses. To
          improve the validity of the results, it randomizes which points it samples, and uses a
          noise mask to mitigate visual adaptation.
        </p>
        <p>
          It's a curve fit, not a binary search. In theory, if you feel like you're guessing in the
          middle shades, or even guessing incorrectly, that should be fine. If you're inconsistent
          in the middle, the curve fit should be able to recover, although your estimated threshold
          will have larger error bars.
        </p>

        <h2>Results</h2>
        <p>
          In early experiments with yellow-green boundaries, people's responses clustered around 90.
          For yellow-green boundaries, the nominal boundary is around 90, which is the hue value for
          pure green <span class="color-chip-green mr-1"></span>, while pure yellow
          <span class="color-chip-yellow mr-1"></span> is at 60.
        </p>
        <h2>What information does this website collect?</h2>
        <p>
          This website collects aggregate usage metrics to understand how many people use the site
          and when. Since we received plenty of responses to the test, we have closed data
          submission.
        </p>
        <h2>Who made this?</h2>
        <p>
          I'm Patrick Mineault, a neuroscience and AI researcher. I made this as a side project
          using Claude 3.5 Sonnet. I obtained a PhD in visual neuroscience from McGill in 2014. You
          can read my blog https://neuroai.science.
        </p>
        <h2>Can I make a version of this for my favorite color pair?</h2>
        <p>
          Right this way to Github https://github.com/patrickmineault/ismyblue.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MAX_ROUNDS, BIN_POSITION, BIN_COUNT, X_CDF, Y_CDF } from '@/config_for_YG' // 修改为引用 config_for_YG.js
import { defineEmits, defineProps } from 'vue'
const props = defineProps({
  testPosition: Number,
  totalTests: Number,
  testGroup: String,
  testPercentage: Number
})
// 定义事件
const emit = defineEmits(['nextTest'])

</script>

<script>
import { MAX_ROUNDS, VERSION, BIN_POSITION, BIN_COUNT, X_CDF, Y_CDF } from '@/config_for_YG' // 修改为引用 config_for_YG.js
import confetti from 'https://cdn.skypack.dev/canvas-confetti'
import ResultsForYGTest from './Results_for_YGTest.vue'
import { fitSigmoid } from '@/utils/glmUtils'

import maskImage from '@/assets/mask.png'

export default {
  components: {
    ResultsForYGTest
  },
  props: ['testPosition', 'totalTests', 'testGroup','testPercentage'],
  data() {
    return {
      currentHue: Math.random() > 0.5 ? 60 : 120, // 修改随机初始值范围
      showInitialMessage: true,
      polarity: 0,
      rounds: 0,
      finalHue: 0,
      responses: [],
      showMask: false,
      maskImageUrl: maskImage,
      showAbout: false,
      showDemo: false,
      greenButtonRight: Math.random() > 0.5,
      firstColorMislabeled: false,
      allSame: false,
      showResults: false,
      errorMessage: '',
      startTime: 0,
      loadTime: 0,
      testPosition: 0,
      totalTests: 0,
      resetClicked: false,
      resetTimeout: null
    }
  },
  computed: {
    rightButton() {
      return this.greenButtonRight ? 'green' : 'yellow'
    },
    leftButton() {
      return this.greenButtonRight ? 'yellow' : 'green'
    },
    currentColor() {
      return `hsl(${this.currentHue}, 100%, 50%)`
    },
    yellowerColor() {
      return `hsl(${this.finalHue - 5}, 100%, 50%)` // 保持相对偏移
    },
    greenerColor() {
      return `hsl(${this.finalHue + 5}, 100%, 50%)` // 保持相对偏移
    },
    containerStyle() {
      if (this.rounds === MAX_ROUNDS) {
        return {
          backgroundColor: 'white'
        }
      } else if (this.showMask) {
        return {
          backgroundColor: this.showMask ? 'transparent' : this.currentColor,
          backgroundImage: this.showMask ? `url(${this.maskImageUrl})` : 'none',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }
      } else {
        return {
          backgroundColor: this.currentColor
        }
      }
    },
    resetButtonText() {
      return this.resetClicked ? '这儿什么也没有' : ''
    }
  },
  methods: {
    emitNextTest() {
      const testData = {
        threshold: this.finalHue,
        loadtime: this.loadTime,
        testPosition: this.testPosition,
        totalTests: this.totalTests,
        testGroup: this.testGroup
      };
      this.$emit('nextTest', testData);
    },
    selectColor(color) {
      this.responses.push({ hue: this.currentHue, response: color })

      if (this.rounds === 0) {
        if (color === 'yellow' && this.currentHue > 90) {
          this.firstColorMislabeled = true
        } else if (color === 'green' && this.currentHue < 90) {
          this.firstColorMislabeled = true
        }
        if (this.firstColorMislabeled) {
          return
        }
      }

      const { a, b, polarity, newProbe } = fitSigmoid(
        this.responses.map(r => r.hue),
        this.responses.map(r => r.response === 'green'),
        this.polarity,
        0.4,
        90,
        60, // 修改最小值
        120  // 保持最大值
      );

      this.polarity = polarity == 1 ? 1 : -1;
      this.currentHue = newProbe;

      this.currentHue = Math.max(60, Math.min(this.currentHue, 120)); // 修改边界值

      this.rounds++;
      if (this.rounds === MAX_ROUNDS) {
        if (
          this.responses.every((r) => r.response === 'yellow') ||
          this.responses.every((r) => r.response === 'green')
        ) {
          this.allSame = this.responses[0].response
          return
        }
        this.finalHue = 90 - b
        this.currentHue = this.finalHue
        this.loadTime = performance.now() - this.startTime
        this.showResults = true
        confetti()
      }
      this.showMask = true
      setTimeout(() => {
        this.showMask = false
      }, 200)
    },
    reset() {
      let currentHue = Math.random() > 0.5 ? 60 : 120 // 修改随机初始值范围
      if (this.firstColorMislabeled) {
        currentHue = this.currentHue == 120 ? 60 : 120 // 修改边界值
      }

      this.currentHue = currentHue
      this.rounds = 0
      this.finalHue = 0
      this.polarity = 0
      this.showInitialMessage = true
      this.responses = []
      this.showMask = false
      this.firstColorMislabeled = false
      this.allSame = false
      this.showResults = false
      this.startTime = performance.now()

      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
    },
    handleResetClick() {
      if (this.resetClicked) {
        // 第二次点击，在新标签页打开B站链接
        window.open('https://space.bilibili.com/1459104794', '_blank');
        this.resetClicked = false;
        clearTimeout(this.resetTimeout);
      } else {
        // 第一次点击，设置状态
        this.resetClicked = true;
        
        // 3秒后自动恢复按钮状态
        this.resetTimeout = setTimeout(() => {
          this.resetClicked = false;
        }, 3000);
      }
    },
  },
  finishTest() {
      this.showResults = true;
      // 不要在这里自动刷新页面或重定向
  },
  mounted() {
    this.startTime = performance.now()
    setTimeout(() => {
      this.showInitialMessage = false
    }, 2000)
  }
}
</script>

<style src="./YellowGreenTest.css" scoped /> <!-- 修改为引用 YellowGreenTest.css -->
<style scoped>
.color-chip-green {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: green;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}

.color-chip-yellow {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: yellow;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}

.about-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.about-content {
  background-color: white;
  color: black;
  padding: 2rem;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
  font-family: 'Cabin', sans-serif;
  font-size: 0.9rem;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.about-content h2 {
  margin-top: 0;
  font-size: 1.2rem;
}

.about-content h3 {
  font-size: 1.2rem;
  margin-top: 1rem;
}

.about-content p {
  margin-bottom: 1rem;
}

.reset-button {
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #2a70c2;
}

/* 按钮样式 */
.next-test-button {
  position: absolute;
  bottom: 160px;
  right: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #0d0d0e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  box-sizing: border-box; /* 确保边框不会改变按钮大小 */
}

.next-test-button:hover {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 1); /* 动态生成白色边框 */
  animation: border-pulse 0.3s ease-out; /* 添加动画 */
}

/* 动画效果：从外到内的白色边框 */
@keyframes border-pulse {
  0% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 1);
  }
}
</style>

const showResults = ref(false)

// 修改显示结果的函数
const finishTest = () => {
  showResults.value = true
  // 记录加载到显示结果的时间（毫秒）
  loadTime.value = performance.now() - startTime.value
}
