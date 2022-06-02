<template>
  <el-popover placement="bottom" trigger="click" v-model="isVisible">
    <div>
      <div>Actual</div>
      <div style="font-size: 24px">{{ item["phonemeFromText"] }}</div>
      <div>User</div>
      <div style="font-size: 24px">
        {{ item["phonemeFromAudio"] }}
      </div>
    </div>
    <span slot="reference" 
          :class="{ highlight: isVisible }"
          :style="{ color: score > 0.7 ? 'green' : (score > 0.3 ? 'orange' : '#e40000')}">
      {{ item["source"] }}
    </span>
  </el-popover>
</template>

<style scoped>
.highlight {
  background: lightblue;
}
</style>

<script lang="ts">
import Vue from "vue";
import longestCommonSubsequence from "~/scripts/longest-common-subsequence";

export default Vue.extend({
  props: ["item"],
  mounted() {
    this.getScore()
  },
  data() {
    return {
      isVisible: false,
      score: 1,
    };
  },
  methods: {
    getScore() {
      const lcs = longestCommonSubsequence(this.item['phonemeFromText'], this.item['phonemeFromAudio'])
      this.score = (this.item['phonemeFromText'].length == 0) ? 0 : lcs.length / this.item['phonemeFromText'].length;
    }
  },
});
</script>