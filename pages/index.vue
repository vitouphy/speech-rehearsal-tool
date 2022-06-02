<template>
  <div>
    <el-menu
      mode="horizontal"
      style="text-align: center"
      background-color="#545c64"
    >
      <el-menu-item index="1" class="menu-item">PREPPER</el-menu-item>
    </el-menu>
    <el-container
      direction="vertical"
      class="main-container"
      v-loading="processingSpeech"
    >
      <div style="height: 50px"></div>
      <div>
        <el-input
          type="textarea"
          style="font-size: 15px"
          :autosize="{ minRows: 6, maxRows: 10 }"
          placeholder="Please input your speech here"
          v-model="textarea"
        />
      </div>
      <div class="record-button-container">
        <voice-recorder :onFinishRecording="this.onFinishRecording" />
        <audio-player :audioPath="this.audioPath"></audio-player>
      </div>
      <div>
        <el-button
          type="primary"
          v-if="audioPath != null && audioBlob != null"
          @click="this.processing"
          >Analyze</el-button
        >
      </div>

      <div v-if="breakdowns.length > 0">
        <hr style="margin: 50px 0" />
        <h2>Result</h2>
        <el-card class="box-card">
          <div class="text-result-container">
            <token v-for="(item, idx) in breakdowns" :key="idx" :item="item" />
          </div>
        </el-card>
      </div>
    </el-container>
  </div>
</template>


<style scoped>
.main-container {
  width: 80%;
  margin: 0 auto;
}

.menu-item {
  float: initial;
  color: white;
  font-size: 16px;
  font-family: "Pacifico", cursive;
}

.record-button-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.text-result-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  column-gap: 7px;
}
</style>

<script lang="ts">
import Vue from "vue";
import AudioPlayer from "~/components/AudioPlayer.vue";
import Token from "~/components/Token.vue";
import TextAlign from "~/scripts/text-aligner";

export default Vue.extend({
  components: { AudioPlayer, Token },
  name: "IndexPage",
  data() {
    return {
      textarea: "",
      audioPath: null as any as string,
      audioBlob: null as any,
      breakdowns: [] as any,
      processingSpeech: false,
    };
  },
  methods: {
    onFinishRecording(audioPath: any, audioBlob: any) {
      this.audioPath = audioPath;
      this.audioBlob = audioBlob;
    },
    async processing() {
      this.processingSpeech = true;
      const phonemeFromAudio = await this.getPhoneme();
      const phonemeFromTextRs = await this.convertText2Phoneme(this.textarea);
      const phonemeFromText = phonemeFromTextRs["phoneme"];
      const breakdowns = phonemeFromTextRs["breakdown"];
      const alignments = TextAlign.align(
        phonemeFromText.replace(":", ""),
        phonemeFromAudio
      );

      // Build breakdown
      this.breakdowns = [];
      for (var i = 0; i < breakdowns.length; i++) {
        this.breakdowns.push({
          source: breakdowns[i][0],
          phonemeFromText: breakdowns[i][1],
          phonemeFromAudio: alignments[i],
        });
      }

      this.processingSpeech = false;
      console.log("Breakdown: ", this.breakdowns);
    },
    convertText2Phoneme(text: string) {
      return this.$axios
        .get(`http://localhost:8000/convert?text=${text}&breakdown=true`)
        .then((response) => response.data)
        .catch(console.log);
    },
    getPhoneme(): Promise<string> {
      return new Promise(async (resolve) => {
        let counter = 0;
        while (counter++ < 3) {
          try {
            let response = await this.$axios.post(
              "/api-phoneme",
              this.audioBlob
            );
            return resolve(response.data["text"]);
          } catch (error) {
            await new Promise((resolve2) => setTimeout(resolve2, 1000 * 60));
          }
        }
      });
    },
  },
});
</script>
