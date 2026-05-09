I have what I need. The pattern is straightforward — Song.transpose(delta) returns a new transposed Song, so you keep a reactive offset and recompute.

## Here's how I'd do it in SongView.vue:

1. Track an offset and derive the displayed song from it

```js
import { ref, computed } from 'vue';
import { ChevronLeft, Minus, Plus } from 'lucide-vue-next';

const transposeOffset = ref(0);

const displayedSong = computed(() => {
  if (!data.value) return null;
  return data.value.song.transpose(transposeOffset.value);
});

const displayedKey = computed(
  () => displayedSong.value?.metadata.metadata.key ?? data.value?.metadata.key,
);
```

2. Render from `displayedSong` instead of `data.song`

```html
<dd>{{ displayedKey }}</dd>
...
<div class="song" v-if="displayedSong" v-html="formatter.format(displayedSong)"></div>
```

3. Add the buttons (next to the Key row, or in the header #action slot)

```html
<RoundIconButton :icon="Minus" @click="transposeOffset--" />
<span>{{ transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset }}</span>
<RoundIconButton :icon="Plus" @click="transposeOffset++" />
```

## Why this works

- `song.transpose(delta)` is immutable — it returns a new `Song` and updates the chord objects + the `key` metadata for you. So you don't accumulate state; you always transpose by `offset` from the original parsed song.
- That's why an `offset` ref is better than calling `transposeUp()`/`transposeDown()` and mutating — you can reset to 0, and the chord enharmonics stay consistent with the original key rather than drifting.
- `formatter.format(displayedSong)` then renders the transposed chords automatically.

## Optional niceties

- A reset button: `@click="transposeOffset = 0"`.
- Disable the - button at some lower bound if you want (chordsheetjs handles arbitrary deltas, but going past ±11 is musically pointless — it wraps).
- If you want to display chords as flats instead of sharps after transposing up, pass `{ accidental: 'b' }` as the second arg to `transpose()`.
