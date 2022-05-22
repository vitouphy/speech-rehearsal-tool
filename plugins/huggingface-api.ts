// Read from: 
// https://zenn.dev/neouniverse/articles/d9627d8cdaa95b
// https://typescript.nuxtjs.org/cookbook/plugins/
// https://axios.nuxtjs.org/extend

import { Plugin } from '@nuxt/types'
import { NuxtAxiosInstance } from '@nuxtjs/axios';

declare module 'vue/types/vue' {
  interface Vue {
      readonly $huggingFaceApi: NuxtAxiosInstance
  }
}
declare module '@nuxt/types' {
  interface NuxtAppOptions {
      readonly $huggingFaceApi: NuxtAxiosInstance
  }

  interface Context {
      readonly $huggingFaceApi: NuxtAxiosInstance
  }
}

export const huggingFacePlugin: Plugin = (context, inject): void => {
    const api = context.$axios.create({
      baseURL: 'https://api-inference.huggingface.co/models/vitouphy/wav2vec2-xls-r-300m-timit-phoneme',
      headers: {
        post: {
          Authorization: `Bearer ${context.$config.hfApiSecret}`
        }
      },
      withCredentials: true
    });

    inject('huggingFaceApi', api);
};

export default huggingFacePlugin
