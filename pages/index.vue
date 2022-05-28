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
        <audio-player :audioPath="this.audioPath"></audio-player>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { resolve } from "path";
import Vue from "vue";
import AudioPlayer from "~/components/AudioPlayer.vue";
// import BioMSA from 'biomsa'
const { NWaligner, SWaligner } = require('seqalign');
import TextAlign from "~/scripts/text-aligner"

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
      breakdown: [],
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
  mounted() {
    const text1 = "həloʊ wɜːld wɛlkʌm tuː maɪ vɛɹi nuː juːtuːb tʃænəl θɹiː".replace('ː', '')
    const text2 = "hɛə ɛv riwənwoʊn kəm tumaɪrɛvɪnu ju tɪ ʧɪn"
    const result = TextAlign.align(text1, text2)
    console.log(result)
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
    startProcessing() {
      this.processingSpeech = true;
      this.getPhoneme()
      .then(phonemeFromAudio => {
        // console.log('Getting phoneme from Audio: ', phonemeFromAudio)
        this.phonemeFromAudio = phonemeFromAudio;
      })
      .then(() => this.convertText2Phoneme(this.textarea))
      .then(phonemeFromTextRs => {
        this.phonemeFromText = phonemeFromTextRs['phoneme'];
        this.breakdown = phonemeFromTextRs['breakdown'];
        // console.log('Getting phoneme from Text: ', phonemeFromTextRs['phoneme'])
        // console.log('Breakdown: ', phonemeFromTextRs['breakdown'])
        return phonemeFromTextRs['breakdown']
      })
      .then(breakdown => {
        console.log('Getting phoneme from Audio: ', this.phonemeFromAudio)
        console.log('Getting phoneme from Text: ', this.phonemeFromText.replace(':', ''))
        const alignments = TextAlign.align(this.phonemeFromText.replace(':', ''), this.phonemeFromAudio)
        for (var i=0; i<breakdown.length; i++) {
          breakdown[i].push(alignments[i])
        }
        console.log("Breakdown: ", breakdown);
        return breakdown;
      })
      .catch(console.log)
      .finally(() => {
        this.processingSpeech = false;
      })
    },
    convertText2Phoneme(text: string) {
      return this.$axios.get(`http://localhost:8000/convert?text=${this.textarea}&breakdown=true`)
        .then(response => response.data)
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
