<script setup lang="ts">
import { useRoute } from 'vue-router';
import { fetchSongData, useFetch } from '@chordpro/shared';
import { parseChordPro } from '@/lib/parseChordPro';
import ChordSheetJS from 'chordsheetjs';
import type { Song } from 'chordsheetjs';
import LoadingSpinner from '@chordpro/shared/src/components/LoadingSpinner.vue';
import TheHeader from '@chordpro/shared/src/components/TheHeader.vue';
import RoundIconButton from '@chordpro/shared/src/components/RoundIconButton.vue';
import { ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const slug = route.params.slug as string;
const formatter = new ChordSheetJS.HtmlDivFormatter();

const { data, isLoading, execute } = useFetch<{
  song: Song;
  metadata: Record<string, string | string[]>;
}>();

execute(async () => {
  const result = await fetchSongData(`/songs/${slug}.chordpro`);
  const song = parseChordPro(result);
  const metadata = song.metadata.metadata;

  return { song, metadata };
});
</script>

<template>
  <LoadingSpinner :is-loading="isLoading" />

  <template v-if="!isLoading && data">
    <TheHeader :title="String(data.metadata.title)">
      <template #action>
        <RouterLink to="/songs" class="inline-block">
          <RoundIconButton :icon="ChevronLeft" />
        </RouterLink>
      </template>
    </TheHeader>

    <div class="content">
      <h2>{{ data.metadata.subtitle }}</h2>

      <dl class="ml-auto grid w-fit grid-cols-[auto_auto] gap-x-3">
        <template v-if="data.metadata.key">
          <dt class="font-bold">Key:</dt>
          <dd>{{ data.metadata.key }}</dd>
        </template>

        <template v-if="data.metadata.tempo">
          <dt class="font-bold">Tempo:</dt>
          <dd>{{ data.metadata.tempo }}</dd>
        </template>

        <template v-if="data.metadata.time">
          <dt class="font-bold">Time:</dt>
          <dd>{{ data.metadata.time }}</dd>
        </template>
      </dl>

      <div class="song" v-html="formatter.format(data.song)"></div>
    </div>
  </template>
</template>

<style lang="scss">
$comment-color: #0087ff;

.content {
  padding-inline: 1rem;
}

.title,
.subtitle {
  display: none;
}

.chord-sheet {
  margin-top: 3rem;
  line-height: 1;
}

.paragraph {
  margin-bottom: 2rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.label,
.comment {
  color: $comment-color;
}

.chord {
  font-weight: 700;

  &:not(:last-child) {
    padding-right: 1em;
  }
}

.lyrics {
  opacity: 0.7;
}

.chord,
.lyrics {
  &::after {
    content: '\200b';
  }
}
</style>
