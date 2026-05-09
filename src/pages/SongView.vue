<script setup lang="ts">
import { useRoute } from 'vue-router';
import { fetchSongData, useFetch } from '@chordpro/shared';
import { parseChordPro } from '@/lib/parseChordPro';
import ChordSheetJS, { Song } from 'chordsheetjs';
import LoadingSpinner from '@chordpro/shared/src/components/LoadingSpinner.vue';

const route = useRoute();
const slug = route.params.slug as string;
// const formatter = new ChordSheetJS.HtmlTableFormatter();
const formatter = new ChordSheetJS.HtmlDivFormatter();
console.log(formatter.cssString());

const { data, isLoading, execute } = useFetch<Song>();

execute(async () => {
  const result = await fetchSongData(`/songs/${slug}.chordpro`);
  return parseChordPro(result);
});
</script>

<template>
  <LoadingSpinner :is-loading="isLoading" />

  <div v-if="data" v-html="formatter.format(data)"></div>
</template>

<style>
.chord:not(:last-child) {
  padding-right: 10px;
}

.paragraph {
  margin-bottom: 1em;
}

.row {
  display: flex;
}

.chord:after {
  content: '\200b';
}

.lyrics:after {
  content: '\200b';
}
</style>
