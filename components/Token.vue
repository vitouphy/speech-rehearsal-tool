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
          :style="{ color: item['score'] >= 0.5 ? 'green' : (item['score'] > 0.25 ? 'orange' : '#e40000')}">
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
import phonemeNormalizer from "~/scripts/phoneme-normalizer";

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
        .get(`/text2speech?text=${text}`)
        .then((response) => {
          const buf = Buffer.from(response.data.audio, 'base64')
          const blob = new Blob([buf], { type: 'audio/wav' });
          this.audioUrl = window.URL.createObjectURL(blob);
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
      // Calculate the score using normalized text, but display using the real one
      const normalizedText1 = phonemeNormalizer.normalize(text1)
      const normalizedText2 = phonemeNormalizer.normalize(text2)
      const lcs = longestCommonSubsequence(normalizedText1, normalizedText2) 

      let arr = [];
      let lcsIndex = 0;
      for (let [idx, c] of normalizedText1.split('').entries()) {

        // Explicitly ignore the stress
        if (c == "ː") {
          arr.push(["ː", true]);
          continue;
        }

        arr.push([text1[idx], c == lcs[lcsIndex]]);
        if (c == lcs[lcsIndex]) {
          lcsIndex += 1;
        }
      }
      return arr;
    }
  },
});
</script>