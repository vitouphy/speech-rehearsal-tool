<template>
  <div>
    <el-menu class="el-menu-demo" mode="horizontal">
      <el-menu-item index="1" style="float: none">Prepper</el-menu-item>
    </el-menu>
    <div style="width: 80%; left: 10%" v-loading="processingSpeech">
      <div style="height: 50px"></div>
      <div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="Please input"
          v-model="textarea"
        />
        <div>
          <div style="width: 100%; display: flex; flex-wrap: wrap; column-gap: 7px">
              <token v-for="(item, idx) in breakdowns" :key="idx" :item="item"/>
          </div>
        </div>
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
      this.processing();
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
