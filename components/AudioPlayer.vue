<template>
  <div v-if="audioPath != null">
    <el-button v-if="!isPlaying" @click="play">
      <i class="el-icon-caret-right"></i>
      <span>Play</span>
    </el-button>
    <el-button v-else @click="stop">
      <i class="el-icon-video-pause"></i>
      <span>Stop</span>
    </el-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["audioPath"],
  watch: {
    audioPath() {
      this.audio = new Audio(this.audioPath);
      this.audio.onended = () => this.stop();
    },
  },
  data() {
    return {
      isPlaying: false,
      audio: null as any as HTMLAudioElement,
    };
  },
  methods: {
    play() {
      this.audio.play();
      this.isPlaying = true;
    },
    stop() {
      this.audio.pause();
      this.isPlaying = false;
    },
  },
});
</script>
