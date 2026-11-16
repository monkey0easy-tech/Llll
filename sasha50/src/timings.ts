/**
 * ALL TIMINGS FOR THE VIDEO LIVE HERE.
 *
 * Every scene start and every lyric line is driven by this file. Scene
 * animations are keyed to the lines of their section (e.g. "the boy winks
 * during line 3 of verse1"), so once the line times are right, the whole
 * picture follows the song.
 *
 * HOW TO FIX THE TIMINGS FOR THE REAL SONG
 * 1. Run `npm run dev` to open Remotion Studio and pick the "Sasha50"
 *    composition. Press play (space) and listen.
 * 2. When a line starts being sung, pause and read the time in the timeline
 *    (top-right of the player shows seconds when you switch the display to
 *    "time", or divide the frame number by 30).
 * 3. Type that second into `start` of the line below. `end` is when the
 *    singer finishes the line. If you delete `end`, it is set automatically
 *    to just before the next line starts.
 * 4. Section `start`/`end` are the scene boundaries. A section should start
 *    a little before its first line and end where the next section starts.
 * 5. When you have entered real values, set SCALE_TO_SONG to false.
 *    While it is true, all numbers below are stretched proportionally to the
 *    real length of song.mp3 (they were written for a 210-second song).
 *
 * The studio hot-reloads on save, so you can tweak and listen right away.
 * Every scene also has its own composition (S1-Verse1 and so on) that plays
 * only that part of the song.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Length the estimated numbers below were written for, in seconds. */
export const ESTIMATED_SONG_LENGTH = 210;

/** true: stretch all times to the real song length. Set to false after you enter real times. */
export const SCALE_TO_SONG = true;

/** Seconds of silent outro (final group photo) after the music ends. */
export const OUTRO_TAIL = 5;

/** Length of a scene transition (page flip / map wipe / light flash), seconds. Max 0.6. */
export const TRANSITION = 0.6;

/** Used only when song.mp3 is missing: fake beat for the chorus pulse. */
export const FALLBACK_BPM = 120;

export type SectionId =
  | "intro"
  | "verse1"
  | "chorus1"
  | "verse2"
  | "chorus2"
  | "verse3"
  | "verse4"
  | "chorus3"
  | "finale";

export type Section = { id: SectionId; start: number; end: number };
export type Line = { section: SectionId; text: string; start: number; end?: number };

export const sections: Section[] = [
  { id: "intro", start: 0, end: 6 },
  { id: "verse1", start: 6, end: 31.5 },
  { id: "chorus1", start: 31.5, end: 57 },
  { id: "verse2", start: 57, end: 82.5 },
  { id: "chorus2", start: 82.5, end: 108 },
  { id: "verse3", start: 108, end: 133.5 },
  { id: "verse4", start: 133.5, end: 159 },
  { id: "chorus3", start: 159, end: 184.5 },
  { id: "finale", start: 184.5, end: 210 },
];

export const lines: Line[] = [
  { section: "verse1", text: "Жил на свете мальчик Саша,", start: 6.3, end: 9.2 },
  { section: "verse1", text: "Тонкий, словно карандаш.", start: 9.4, end: 12.3 },
  { section: "verse1", text: "Был весёлым обояшкой,", start: 12.5, end: 15.4 },
  { section: "verse1", text: "А в душе — сплошной кураж!", start: 15.6, end: 18.5 },
  { section: "verse1", text: "Саня был душой компании,", start: 18.8, end: 21.6 },
  { section: "verse1", text: "Знал, как всех развеселить.", start: 21.9, end: 24.7 },
  { section: "verse1", text: "И умел он с детства раннего", start: 25, end: 27.8 },
  { section: "verse1", text: "Очень искренно дружить!", start: 28.1, end: 31 },

  { section: "chorus1", text: "Саня, Саша! Какой пассаж!", start: 31.8, end: 35.7 },
  { section: "chorus1", text: "Был худеньким мальчишкой,", start: 36, end: 39.9 },
  { section: "chorus1", text: "Красавец наш!", start: 40.1, end: 44 },
  { section: "chorus1", text: "Саня, Саша, ты просто класс!", start: 44.3, end: 48.2 },
  { section: "chorus1", text: "Для семьи ты — счастье, радость,", start: 48.4, end: 52.3 },
  { section: "chorus1", text: "Друг детства наш!", start: 52.6, end: 56.5 },

  { section: "verse2", text: "Годы шли, менялись страны,", start: 57.3, end: 60.2 },
  { section: "verse2", text: "Саня бизнес покорял.", start: 60.4, end: 63.3 },
  { section: "verse2", text: "Строил он большие планы,", start: 63.5, end: 66.4 },
  { section: "verse2", text: "И успешно воплощал!", start: 66.6, end: 69.5 },
  { section: "verse2", text: "То Европа, то Россия,", start: 69.8, end: 72.6 },
  { section: "verse2", text: "Сингапур, потом Дубай.", start: 72.9, end: 75.7 },
  { section: "verse2", text: "Но куда б ни ехал Саня —", start: 76, end: 78.8 },
  { section: "verse2", text: "Дружбу он не забывал!", start: 79.1, end: 81.9 },

  { section: "chorus2", text: "Саня, Саша! Какой пассаж!", start: 82.8, end: 86.7 },
  { section: "chorus2", text: "Был худеньким мальчишкой,", start: 87, end: 90.9 },
  { section: "chorus2", text: "Красавец наш!", start: 91.1, end: 95 },
  { section: "chorus2", text: "Саня, Саша, ты просто класс!", start: 95.3, end: 99.2 },
  { section: "chorus2", text: "Для семьи ты — счастье, радость,", start: 99.4, end: 103.3 },
  { section: "chorus2", text: "Друг детства наш!", start: 103.6, end: 107.5 },

  { section: "verse3", text: "Ах, еврейский мальчик Саша,", start: 108.3, end: 111.2 },
  { section: "verse3", text: "Кто бы мог тогда сказать,", start: 111.4, end: 114.3 },
  { section: "verse3", text: "Что однажды этот мальчик", start: 114.5, end: 117.4 },
  { section: "verse3", text: "Будет мир весь покорять!", start: 117.6, end: 120.5 },
  { section: "verse3", text: "Есть успех, семья прекрасна,", start: 120.8, end: 123.6 },
  { section: "verse3", text: "Дом, любовь и верный круг.", start: 123.9, end: 126.7 },
  { section: "verse3", text: "Но богатство Саши главное —", start: 127, end: 129.8 },
  { section: "verse3", text: "Это каждый старый друг!", start: 130.1, end: 133 },

  { section: "verse4", text: "Мы сегодня все в Дубае,", start: 133.8, end: 136.7 },
  { section: "verse4", text: "Собрались со всех сторон.", start: 136.9, end: 139.8 },
  { section: "verse4", text: "Наш любимый Саня знает —", start: 140, end: 142.9 },
  { section: "verse4", text: "Как друзьями окружён!", start: 143.1, end: 146 },
  { section: "verse4", text: "Пятьдесят — какая малость!", start: 146.3, end: 149.1 },
  { section: "verse4", text: "Впереди ещё кураж!", start: 149.4, end: 152.2 },
  { section: "verse4", text: "Молодость с тобой осталась,", start: 152.5, end: 155.3 },
  { section: "verse4", text: "И всё тот же эпатаж!", start: 155.6, end: 158.5 },

  { section: "chorus3", text: "Саня, Саша! Какой пассаж!", start: 159.3, end: 162.6 },
  { section: "chorus3", text: "Был худеньким мальчишкой,", start: 162.9, end: 166.2 },
  { section: "chorus3", text: "А теперь — какой типаж!", start: 166.4, end: 169.7 },
  { section: "chorus3", text: "Саня, Саша,", start: 170, end: 173.3 },
  { section: "chorus3", text: "Красавец наш!", start: 173.5, end: 176.8 },
  { section: "chorus3", text: "Для семьи ты — счастье, радость,", start: 177.1, end: 180.4 },
  { section: "chorus3", text: "Друг детства наш!", start: 180.6, end: 184 },

  { section: "finale", text: "С Днём рождения поздравляем,", start: 184.8, end: 187.7 },
  { section: "finale", text: "Наш любимый, дорогой,", start: 187.9, end: 190.8 },
  { section: "finale", text: "И себе мы пожелаем:", start: 191, end: 193.9 },
  { section: "finale", text: "Сесть в твой джет — лететь домой.", start: 194.1, end: 197 },
  { section: "finale", text: "Пусть меняются лишь страны,", start: 197.3, end: 200.1 },
  { section: "finale", text: "Но не дружба и любовь!", start: 200.4, end: 203.2 },
  { section: "finale", text: "Покоряются вершины", start: 203.5, end: 206.3 },
  { section: "finale", text: "И мечты приходят вновь!", start: 206.6, end: 209.5 },
];
