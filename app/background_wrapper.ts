
/**
 * 拡張機能登録時のデバッグ用コンポーネント
 *
 * ```json
 * manifest.jsonを下記のように設定すると、使用可能になる。
 * "background": {
 *   "service_worker": "background_wrapper.js"
 * },
 * ```
 */

try {
  importScripts("background.js");
} catch (e) {
  console.error(e);
}

