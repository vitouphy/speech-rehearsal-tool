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
      <div style="text-align: right">
        <el-button style="margin-bottom: 5px;" @click="dialogVisible = true">
          <i class="el-icon-s-data"></i>
          Past Performances
        </el-button>
      </div>
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
        <div style="margin-bottom: 10px">
          <h2>Result</h2>
          <span>
            <span style="font-weight: bold;">{{totalScore}}</span> 
            <span>/ 1.00</span>
          </span>
        </div>
        <el-card class="box-card">
          <div class="text-result-container">
            <token v-for="(item, idx) in breakdowns" :key="idx" :item="item" />
          </div>
        </el-card>
      </div>
    </el-container>
    

    <el-dialog
      title="History"
      :visible.sync="dialogVisible"
      width="40%">
      <div>
        <el-table
        :data="scoreHistory"
        style="width: 100%"
        >
          <el-table-column
            prop="date"
            label="Date"
            width="180">
          </el-table-column>
          <el-table-column
            prop="score"
            label="Score"
            width="180">
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">Close</el-button>
      </span>
    </el-dialog>

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
const { v4: uuidv4 } = require('uuid');
import longestCommonSubsequence from "~/scripts/longest-common-subsequence";

export default Vue.extend({
  components: { AudioPlayer, Token,  },
  name: "IndexPage",
  computed: {
    userId: () => {
      if (process.client) {
        if (localStorage.getItem('userId') == null) {
          localStorage.setItem('userId', uuidv4());
        }
        return localStorage.getItem('userId');
      }
    }
  },
  mounted() {
    this.fetchUserScoresFromDB()
  },
  data() {
    return {
      dialogVisible: false,
      textarea: "",
      audioPath: null as any as string,
      audioBlob: null as any,
      // breakdowns: [
      //   { 
      //     source: 'hello', 
      //     phonemeFromText: 'hebbo', 
      //     phonemeFromAudio: 'helloz',
      //     score: 0.8,
      //   }
      // ],
      breakdowns: [] as any,
      processingSpeech: false,
      scoreHistory: [] as any,
      totalScore: null as any,
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
      let totalScore = 0;
      this.breakdowns = [];
      for (var i = 0; i < breakdowns.length; i++) {
        const bdPhoneFromText = breakdowns[i][1].replace(":", "").replace("ː", "")
        const bdPhoneFromAudio = alignments[i]
        const lcs = longestCommonSubsequence(bdPhoneFromText, bdPhoneFromAudio) 
        const score = (bdPhoneFromText.length == 0) ? 0 : lcs.length / bdPhoneFromText.length;
    
        this.breakdowns.push({
          source: breakdowns[i][0],
          phonemeFromText: bdPhoneFromText,
          phonemeFromAudio: bdPhoneFromAudio,
          score: score
        });

        totalScore += score;
      }
      if (this.breakdowns.length > 0) {
        totalScore /= this.breakdowns.length
        this.totalScore = totalScore.toFixed(4)
        this.scoreHistory.unshift({
          date: new Date().toLocaleString(),
          score: this.totalScore
        })
        this.recordScoreToDB(totalScore)
      }

      this.processingSpeech = false;
    },
    recordScoreToDB(score: Number) {
      const data = {
        userId: this.userId,
        score: score
      }
      this.$axios
        .post('/api/score', data)
        .then((response) => response.data)
        .catch(console.log);
    },
    fetchUserScoresFromDB() {
      this.$axios.get(`/api/score/${this.userId}`)
      .then((response) => {
        let items = []
        for (let item of response.data) {
          items.push({
            date: new Date(item.createdAt).toLocaleString(),
            score: item.score.toFixed(4)
          })
        }
        this.scoreHistory = items
      })
      .catch(console.log);
    },
    convertText2Phoneme(text: string) {
      return this.$axios
        .get(`/api/text2phoneme?text=${text}&breakdown=true`)
        .then((response) => response.data)
        .catch(console.log);
    },
    getPhoneme(): Promise<string> {
      return new Promise(async (resolve) => {
        let counter = 0;
        while (counter++ < 3) {
          try {
            let response = await this.$axios.post("/api/audio2phoneme", this.audioBlob);
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
