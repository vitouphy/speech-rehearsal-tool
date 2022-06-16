<template>
  <el-popover placement="bottom" trigger="click" v-model="isVisible">
    <div>
      <div>Pronunciation</div>
      <div style="font-size: 24px">
        <span 
          v-for="(char, index) in compareTextAndAudioPhoneme(item['phonemeFromText'], item['phonemeFromAudio'])"
          :key="index"
          :style="{ color: char[1] ? 'green' : 'red' }"
          >{{char[0]}}</span>
        <el-button type="text" @click="playAudio">
          <i class="el-icon-chat-line-round" style="font-size: 20px"></i>
        </el-button>
      </div>
    </div>
    <span slot="reference" 
          :class="{ highlight: isVisible }"
          :style="{ color: item['score'] > 0.7 ? 'green' : (item['score'] > 0.3 ? 'orange' : '#e40000')}">
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
  data() {
    return {
      isVisible: false,
      audioUrl: '',
      audio: (null as any) as HTMLAudioElement,
    };
  },
  methods: {
    convertText2Speech(text: string) {
      return this.$axios
        .get(`/api/text2speech?text=${text}`)
        .then((response) => {
          const audioData = Uint8Array.from(atob(response.data.audio), (c) => c.charCodeAt(0));
          this.audioUrl = window.URL.createObjectURL(new Blob([audioData]));
        })
        .catch(console.log);
    },
    async playAudio() {
      if (!this.audio) {
        await this.convertText2Speech(this.item['source'])
        this.audio = new Audio(this.audioUrl);
      }
      if (this.audio) {
        this.audio.play()
      }
    },
    compareTextAndAudioPhoneme(text1: string, text2: string) {
      const lcs = longestCommonSubsequence(text1, text2) 
      let arr = [];
      let lcsIndex = 0;
      for (let c of text1) {
        arr.push([c, c == lcs[lcsIndex]]);
        if (c == lcs[lcsIndex]) {
          lcsIndex += 1;
        }
      }
      return arr;
    }
  },
});
</script>