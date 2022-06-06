<template>
  <div>
    <el-button v-if="!isRecording" @click="clickButton">
      <i class="el-icon-microphone"></i>
      <span>Record</span>
    </el-button>
    <div v-else style="display: flex; align-items: center; gap: 10px">
      <el-button type="danger" @click="clickButton">
        <i class="el-icon-close"></i>
        <span>Stop</span>
      </el-button>
      <el-progress
        type="circle"
        status="exception"
        :percentage="(this.recordingDuration / TOTAL_DURATION) * 100"
        :show-text="false"
        :width="30"
        :stroke-width="5"
      ></el-progress>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

const CONSTRAINTS = {
  video: false,
  audio: {
    channelCount: 1,
    echoCancellation: true,
    sampleRate: { min: 16000, ideal: 16000 },
  },
}

export default Vue.extend({
  props: ['onFinishRecording'],
  watch: {},
  data() {
    return {
      // Constants
      TOTAL_DURATION: 30, 
      // Recording data properties
      recorder: null as any as MediaRecorder,
      isRecording: false,
      recordingDuration: 0,
      // Timer and Stopwatch
      timer: null as any as NodeJS.Timer,
      recordingTimeout: null as any as NodeJS.Timeout,
    };
  },
  methods: {

    async clickButton() {
      if (this.recorder != null && this.recorder.state == "recording") {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },

    startRecording() {
      navigator.mediaDevices
        .getUserMedia(CONSTRAINTS)
        .then(this.onGettingMediaStream)
        .catch(console.log);
    },

    stopRecording() {
      this.isRecording = false;
      this.recorder.stop();
      this.recordingDuration = 0;
      clearInterval(this.timer);
      clearTimeout(this.recordingTimeout);
    },

    onGettingMediaStream(stream: MediaStream) {
      this.recorder = new MediaRecorder(stream);
      this.recorder.start();
      this.timer = setInterval(() => this.recordingDuration++, 1000);
      this.isRecording = true;

      this.recorder.ondataavailable = (event: BlobEvent) => {
        // Stop all audio tracks
        for (let audioTrack of stream.getAudioTracks()) {
          audioTrack.stop();
        }
        const audioPath = window.URL.createObjectURL(event.data);
        const recordingBlob = event.data;
        this.onFinishRecording(audioPath, recordingBlob);
      };

      // Record only TOTAL_DURATION seconds
      this.recordingTimeout = setTimeout(() => this.stopRecording(), this.TOTAL_DURATION * 1000);
    },

  },
});
</script>
