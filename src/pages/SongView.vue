<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {
  fetchSongData,
  useFetch,
  useSetsStore,
  type Song as SetSong,
  type SetResponse,
} from '@chordpro/shared';
import { parseChordPro } from '@/lib/parseChordPro';
import ChordSheetJS, { Key } from 'chordsheetjs';
import type { Song } from 'chordsheetjs';
import LoadingSpinner from '@chordpro/shared/src/components/LoadingSpinner.vue';
import TheHeader from '@chordpro/shared/src/components/TheHeader.vue';
import RoundIconButton from '@chordpro/shared/src/components/RoundIconButton.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);
const formatter = new ChordSheetJS.HtmlDivFormatter();

const { activeSlug } = storeToRefs(useSetsStore());
const { data: setData, execute: executeSet } = useFetch<SetResponse>();

watch(
  activeSlug,
  (s) => {
    if (s) executeSet(() => fetchSongData(`/sets/${s}.json`));
  },
  { immediate: true },
);

const songs = computed<SetSong[]>(() => setData.value?.songs ?? []);
const currentIndex = computed(() => songs.value.findIndex((s) => s.slug === slug.value));
const currentSong = computed<SetSong | null>(
  () => (currentIndex.value >= 0 ? songs.value[currentIndex.value] : null) ?? null,
);
const songKey = computed(() => currentSong.value?.key ?? null);
const prevSong = computed<SetSong | null>(
  () => (currentIndex.value > 0 ? songs.value[currentIndex.value - 1] : null) ?? null,
);
const nextSong = computed<SetSong | null>(
  () =>
    (currentIndex.value >= 0 && currentIndex.value < songs.value.length - 1
      ? songs.value[currentIndex.value + 1]
      : null) ?? null,
);

const { data, isLoading, execute } = useFetch<{
  song: Song;
  metadata: Record<string, string | string[]>;
}>();

watch(
  currentSong,
  (song) => {
    if (!song) return;
    execute(async () => {
      const result = await fetchSongData(`/songs/${song.slug}.chordpro`);
      const parsed = parseChordPro(result);
      const metadata = parsed.metadata.metadata;
      return { song: parsed, metadata };
    });
  },
  { immediate: true },
);

const displayedSong = computed<Song | null>(() => {
  if (!data.value) return null;
  const originalKey = data.value.metadata.key;
  if (!originalKey || !songKey.value) return data.value.song;
  const keyString = Array.isArray(originalKey) ? originalKey[0] : originalKey;
  if (!keyString) return data.value.song;
  try {
    const delta = Key.distance(keyString, songKey.value);
    return delta === 0 ? data.value.song : data.value.song.transpose(delta);
  } catch {
    return data.value.song;
  }
});

const SWIPE_THRESHOLD = 60;
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e: TouchEvent) {
  const t = e.changedTouches[0];
  if (!t) return;
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}

function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) < SWIPE_THRESHOLD) return;
  if (Math.abs(dy) > Math.abs(dx)) return;
  if (dx < 0 && nextSong.value) {
    router.push({ name: 'song', params: { slug: nextSong.value.slug } });
  } else if (dx > 0 && prevSong.value) {
    router.push({ name: 'song', params: { slug: prevSong.value.slug } });
  }
}
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

    <div class="px-4">
      <div class="flex justify-between flex-wrap gap-x-8 gap-y-4">
        <h2>{{ data.metadata.subtitle }}</h2>

        <p class="flex flex-col items-end grow shrink-0">
          <span v-if="songKey">
            {{ songKey }}

            <template v-if="data.metadata.key"> (original: {{ data.metadata.key }}) </template>
          </span>

          <span v-if="data.metadata.tempo || data.metadata.time">
            {{ data.metadata.tempo }} BPM {{ data.metadata.time }}
          </span>
        </p>
      </div>

      <div class="relative" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <div class="song" v-if="displayedSong" v-html="formatter.format(displayedSong)"></div>
      </div>
    </div>

    <RouterLink
      v-if="prevSong"
      :to="{ name: 'song', params: { slug: prevSong.slug } }"
      class="absolute inset-y-0 left-0 z-10 w-1/8"
      :aria-label="`Previous: ${prevSong.title}`"
    />
    <RouterLink
      v-if="nextSong"
      :to="{ name: 'song', params: { slug: nextSong.slug } }"
      class="absolute inset-y-0 right-0 z-10 w-1/8"
      :aria-label="`Next: ${nextSong.title}`"
    />
  </template>
</template>

<style lang="scss">
$comment-color: #0087ff;

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
