/**
 * ブラインドタイマー音声通知（Web Audio API）
 * 外部音源ファイル不要 — ビープ音を動的生成
 */

let audioContext: AudioContext | null = null
let volumeLevel = 0.5
let isMuted = false

// localStorage のキー
const VOLUME_KEY = 'casinohub_timer_volume'
const MUTE_KEY = 'casinohub_timer_mute'

/**
 * AudioContext を初期化する（ユーザーインタラクション後に呼ぶこと）
 * ブラウザの自動再生ポリシー対策
 */
export function initAudio(): void {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  // localStorageから設定を読み込み
  const savedVolume = localStorage.getItem(VOLUME_KEY)
  if (savedVolume !== null) {
    volumeLevel = Math.max(0, Math.min(1, Number(savedVolume)))
  }
  const savedMute = localStorage.getItem(MUTE_KEY)
  if (savedMute !== null) {
    isMuted = savedMute === 'true'
  }
}

/**
 * 音量を設定する（0〜1）
 */
export function setVolume(vol: number): void {
  volumeLevel = Math.max(0, Math.min(1, vol))
  localStorage.setItem(VOLUME_KEY, String(volumeLevel))
}

/**
 * 音量を取得する
 */
export function getVolume(): number {
  const saved = localStorage.getItem(VOLUME_KEY)
  if (saved !== null) {
    volumeLevel = Math.max(0, Math.min(1, Number(saved)))
  }
  return volumeLevel
}

/**
 * ミュートを切り替える
 */
export function toggleMute(): boolean {
  isMuted = !isMuted
  localStorage.setItem(MUTE_KEY, String(isMuted))
  return isMuted
}

/**
 * ミュート状態を取得する
 */
export function getMuted(): boolean {
  const saved = localStorage.getItem(MUTE_KEY)
  if (saved !== null) {
    isMuted = saved === 'true'
  }
  return isMuted
}

/**
 * ミュート状態を設定する
 */
export function setMuted(muted: boolean): void {
  isMuted = muted
  localStorage.setItem(MUTE_KEY, String(isMuted))
}

/**
 * ビープ音を再生する
 */
function playBeep(frequency: number, duration: number, delay: number = 0): void {
  if (!audioContext || isMuted || volumeLevel === 0) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  const startTime = audioContext.currentTime + delay
  gainNode.gain.setValueAtTime(volumeLevel * 0.3, startTime)
  // フェードアウト
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

/**
 * レベル切り替え音（高音ビープ x3）
 */
export function playLevelChange(): void {
  initAudio()
  playBeep(880, 0.15, 0)
  playBeep(880, 0.15, 0.2)
  playBeep(1100, 0.2, 0.4)
}

/**
 * 残り1分の警告音（低音ブー x1）
 */
export function playOneMinuteWarning(): void {
  initAudio()
  playBeep(330, 0.5, 0)
}

/**
 * 残り10秒のカウントダウン音
 */
export function playCountdownTick(): void {
  initAudio()
  playBeep(660, 0.08, 0)
}

/**
 * 残り3秒の高速カウントダウン音
 */
export function playFinalCountdown(): void {
  initAudio()
  playBeep(880, 0.1, 0)
}
