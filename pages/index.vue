<template>
  <div>
    <el-menu class="el-menu-demo" mode="horizontal">
      <el-menu-item index="1" style="float: none">Prepper</el-menu-item>
    </el-menu>

    <div style="width: 80%; left: 10%" v-loading="processingSpeech">
      <div style="height: 50px"></div>

      <!-- Form -->
      <div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="Please input"
          v-model="textarea"
        >
        </el-input>
        <div>Phoneme From Audio: {{phonemeFromAudio}}</div>
        <div>Phoneme From Text:  {{phonemeFromText}}</div>
      </div>

      <div style="height: 50px"></div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px">
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
            :percentage="(this.recordingDuration / this.totalDuration) * 100"
            :show-text="false"
            :width="30"
            :stroke-width="5"
          ></el-progress>
        </div>
        <!-- <el-button @click="convertText2Phoneme">Text2Phoneme</el-button> -->
        <audio-player :audioPath="this.audioPath"></audio-player>
        <!-- <el-button
          v-if="recordingBlob != null"
          @click="downloadRecording(recordingBlob)"
        >
          <i class="el-icon-download"></i>
          <span>Download</span>
        </el-button> -->
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { resolve } from "path";
import Vue from "vue";
import AudioPlayer from "~/components/AudioPlayer.vue";

export default Vue.extend({
  components: { AudioPlayer },
  name: "IndexPage",
  data() {
    return {
      timer: null as any as NodeJS.Timer,
      recordingTimeout: null as any as NodeJS.Timeout,
      recordingDuration: 0,
      totalDuration: 30,
      textarea: "",
      recorder: null as any as MediaRecorder,
      isRecording: false,
      audioPath: null as any as string,
      recordingBlob: null as any,
      recordingPhoneme: '',
      phonemeFromText: '',
      phonemeFromAudio: '',
      processingSpeech: false,
      constraints: {
        video: false,
        audio: {
          channelCount: 1,
          echoCancellation: false,
        },
      },
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
    stopRecording() {
      this.isRecording = false;
      this.recorder.stop();
      this.recordingDuration = 0;
      clearInterval(this.timer);
      clearTimeout(this.recordingTimeout);
    },
    startRecording() {
      navigator.mediaDevices
        .getUserMedia(this.constraints)
        .then(this.onGettingMediaStream)
        .catch(console.log);
    },
    onGettingMediaStream(stream: MediaStream) {
      this.isRecording = true;
      this.recorder = new MediaRecorder(stream);
      this.recorder.start();
      this.timer = setInterval(() => this.recordingDuration++, 1000);
      this.recorder.ondataavailable = (event: BlobEvent) => {
        // stop all audio tracks
        for (let audioTrack of stream.getAudioTracks()) {
          audioTrack.stop();
        }
        this.audioPath = window.URL.createObjectURL(event.data);
        this.recordingBlob = event.data;
        this.startProcessing();
      };

      // Set recording in 30 seconds
      this.recordingTimeout = setTimeout(() => {
        this.stopRecording();
      }, this.totalDuration * 1000);
    },
    // downloadRecording(blob: Blob) {
    //   let link = document.createElement("a");
    //   link.href = window.URL.createObjectURL(blob);
    //   link.download = "filename";

    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // },
    startProcessing() {
      this.processingSpeech = true;
      this.getPhoneme()
      .then(phonemeFromAudio => {
        console.log('Getting phoneme from Audio: ', phonemeFromAudio)
        this.phonemeFromAudio = phonemeFromAudio;
      })
      .then(() => this.convertText2Phoneme(this.textarea))
      .then(phonemeFromText => {
        console.log('Getting phoneme from Text: ', phonemeFromText)
        this.phonemeFromText = phonemeFromText;
      })
      .catch(console.log)
      .finally(() => {
        this.processingSpeech = false;
      })
    },
    convertText2Phoneme(text: string) {
      return this.$axios.get(`http://localhost:8000/convert?text=${this.textarea}`)
        .then(response => response.data['phoneme'])
        .catch(console.log);
    },
    getPhoneme(): Promise<string> {
      return new Promise(async (resolve) => {
        let counter = 0;
        while (counter++ < 3) {
          try {
            let response = await this.$axios.post('/api-phoneme', this.recordingBlob);
            return resolve(response.data['text'])
          } catch(error) {
            await new Promise(resolve2 => setTimeout(resolve2, 1000*60))
          }
        }
      });
    }
  }
});

</script>
