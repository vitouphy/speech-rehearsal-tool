<template>
  <div>
    <el-menu class="el-menu-demo" mode="horizontal">
      <el-menu-item index="1" style="float: none">Prepper</el-menu-item>
    </el-menu>
    <div style="width: 80%; left: 10%" v-loading="processingSpeech">
      <div style="height: 50px"></div>
      <div>
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="Please input" v-model="textarea">
        </el-input>
        <div>Phoneme From Audio: {{ phonemeFromAudio }}</div>
        <div>Phoneme From Text: {{ phonemeFromText }}</div>
      </div>
      <div style="height: 50px"></div>
      <div style="display: flex; gap: 10px">
        <voice-recorder :onFinishRecording="this.onFinishRecording" />
        <audio-player :audioPath="this.audioPath"></audio-player>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AudioPlayer from "~/components/AudioPlayer.vue";
import TextAlign from "~/scripts/text-aligner";

export default Vue.extend({
  components: { AudioPlayer },
  name: "IndexPage",
  data() {
    return {
      textarea: "",
      audioPath: null as any as string,
      audioBlob: null as any,
      phonemeFromText: "",
      phonemeFromAudio: "",
      breakdown: [],
      processingSpeech: false,
    };
  },
  methods: {
    onFinishRecording(audioPath: any, audioBlob: any) {
      this.audioPath = audioPath;
      this.audioBlob = audioBlob;
      this.startProcessing();
    },
    startProcessing() {
      this.processingSpeech = true;
      this.getPhoneme()
      .then(phonemeFromAudio => {
        this.phonemeFromAudio = phonemeFromAudio;
      })
      .then(() => this.convertText2Phoneme(this.textarea))
      .then(phonemeFromTextRs => {
        this.phonemeFromText = phonemeFromTextRs['phoneme'];
        this.breakdown = phonemeFromTextRs['breakdown'];
        return phonemeFromTextRs['breakdown']
      })
      .then(breakdown => {
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
            let response = await this.$axios.post('/api-phoneme', this.audioBlob);
            return resolve(response.data['text'])
          } catch(error) {
            await new Promise(resolve2 => setTimeout(resolve2, 1000*60))
          }
        }
      });
    }
  },
});
</script>
