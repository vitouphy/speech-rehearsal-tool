<template>
  <!-- <span>{{text}}</span> -->
  <el-popover placement="bottom" trigger="click">
    <div>
      <div>Actual</div>
      <div style="font-size: 24px">{{ item["phonemeFromText"] }}</div>
      <div>User</div>
      <div style="font-size: 24px">
        {{ item["phonemeFromAudio"] }}
      </div>
    </div>
    <span slot="reference">{{ item["source"] }}</span>
  </el-popover>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["item"],
});
</script>