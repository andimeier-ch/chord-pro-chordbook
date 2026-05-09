import ChordSheetJS from 'chordsheetjs';

export function parseChordPro(chordProCode: string) {
  const parser = new ChordSheetJS.ChordProParser();
  const song = parser.parse(chordProCode);

  return song;
}
