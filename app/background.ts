
import * as process from './scripts/process';
//import * as testF from 'scripts/testf';
// import {bgsetting} from 'scripts/popup';

/**
 * グローバル処理
 */
// (async ()=>{
//   await process.initSave();
// })();

chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
  if (changeInfo.status == "loading") {
  } else if (changeInfo.status == "complete") {
    let recs:Array<process.setting_rec> = await process.load();
    for(let i=0;i<recs.length; i++){
      await process.applyProc(recs[i], tab);
    }
  }
});

