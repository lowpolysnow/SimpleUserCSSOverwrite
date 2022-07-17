// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import * as process from './process';



export async function loadToPopup() {
  let recs = await process.load();

  let applyDOM = document.querySelectorAll('input.apply')! as NodeList;
  let nameDOM = document.querySelectorAll('input.name')! as NodeList;
  let urlDOM = document.querySelectorAll('input.url')! as NodeList;
  let cssDOM = document.querySelectorAll('textarea.css')! as NodeList;

  for(let i=0;i<recs.length;i++){
    (applyDOM[i]! as HTMLInputElement).checked = recs[i].apply;
    (nameDOM[i]! as HTMLInputElement).value = recs[i].name;
    (urlDOM[i]! as HTMLInputElement).value = recs[i].url;
    (cssDOM[i]! as HTMLTextAreaElement).value = recs[i].css;
  }
}

/**
 * 設定保存
 */
 export async function save() {

  let applyDOM = document.querySelectorAll('input.apply')! as NodeList;
  let nameDOM = document.querySelectorAll('input.name')! as NodeList;
  let urlDOM = document.querySelectorAll('input.url')! as NodeList;
  let cssDOM = document.querySelectorAll('textarea.css')! as NodeList;

  let recs:Array<process.setting_rec> = new Array();

  for(let i=0;i<applyDOM.length;i++){
    recs.push(new process.setting_rec(
      (applyDOM[i]! as HTMLInputElement).checked,
      (nameDOM[i]! as HTMLInputElement).value,
      (urlDOM[i]! as HTMLInputElement).value,
      (cssDOM[i]! as HTMLTextAreaElement).value
    ));
  }
  chrome.storage.local.set({"settings": JSON.stringify(recs)});
  await resetSettingsInit();
  await detectChange();
}

export async function exportSetting() {
  let recs = await process.load();

  let settingtext = document.querySelector('textarea.settingio')! as HTMLTextAreaElement;
  settingtext.value = JSON.stringify(recs);
}

export async function importSetting() {

  let recs:Array<process.setting_rec> = new Array();
  let settings = JSON.parse( (document.querySelector('textarea.settingio')! as HTMLTextAreaElement).value ) as Array<process.setting_rec>;
  for(let i=0;i<settings.length;i++){
    recs.push(new process.setting_rec(
      settings[i].apply,
      settings[i].name,
      settings[i].url,
      settings[i].css
    ));
  }

  let applyDOM = document.querySelectorAll('input.apply')! as NodeList;
  let nameDOM = document.querySelectorAll('input.name')! as NodeList;
  let urlDOM = document.querySelectorAll('input.url')! as NodeList;
  let cssDOM = document.querySelectorAll('textarea.css')! as NodeList;

  for(let i=0;i<recs.length;i++){
    (applyDOM[i]! as HTMLInputElement).checked = recs[i].apply;
    (nameDOM[i]! as HTMLInputElement).value = recs[i].name;
    (urlDOM[i]! as HTMLInputElement).value = recs[i].url;
    (cssDOM[i]! as HTMLTextAreaElement).value = recs[i].css;
  }
}

export async function isSame() : Promise<boolean> {
  let applyDOM = document.querySelectorAll('input.apply')! as NodeList;
  let nameDOM = document.querySelectorAll('input.name')! as NodeList;
  let urlDOM = document.querySelectorAll('input.url')! as NodeList;
  let cssDOM = document.querySelectorAll('textarea.css')! as NodeList;

  let recs:Array<process.setting_rec> = new Array();

  for(let i=0;i<applyDOM.length;i++){
    recs.push(new process.setting_rec(
      (applyDOM[i]! as HTMLInputElement).checked,
      (nameDOM[i]! as HTMLInputElement).value,
      (urlDOM[i]! as HTMLInputElement).value,
      (cssDOM[i]! as HTMLTextAreaElement).value
    ));
  }
  return (settingsInit as string) == JSON.stringify(recs);
}

export async function detectChange(){
  if(await isSame()){
    document.querySelector('.message').textContent='';
  }else{
    document.querySelector('.message').textContent='*';
  }
}

export async function resetSettingsInit(){
  settingsInit = JSON.stringify(await process.load());
}

//url: 'http:\/\/(.*)\.google\.com'
//css: '.o3j99{background:#555555;}'

/**
 * グローバル処理
 */
let settingsInit : string;

(()=>{
  let applyDOM = document.querySelectorAll('input.apply')! as NodeList;
  let nameDOM = document.querySelectorAll('input.name')! as NodeList;
  let urlDOM = document.querySelectorAll('input.url')! as NodeList;
  let cssDOM = document.querySelectorAll('textarea.css')! as NodeList;
  for(let i=0; i<applyDOM.length; i++){
    applyDOM[i].addEventListener('change', async()=>{
      detectChange();
    });
  }

  for(let i=0; i<nameDOM.length; i++){
    nameDOM[i].addEventListener('change', async()=>{
      detectChange();
    });
  }

  for(let i=0; i<urlDOM.length; i++){
    urlDOM[i].addEventListener('change', async()=>{
      detectChange();
    });
  }

  for(let i=0; i<cssDOM.length; i++){
    cssDOM[i].addEventListener('change', async()=>{
      detectChange();
    });
  }
})();

export async function copyUrlToClipboard(ele:Event){
  let copyTarget = (ele.target as HTMLElement).closest("div.table-row").querySelector("input.url")! as HTMLInputElement ;
  navigator.clipboard.writeText(copyTarget.value);
}

export async function copyCssToClipboard(ele:Event){
  let copyTarget = (ele.target as HTMLElement).closest("div.table-row").querySelector("textarea.css")! as HTMLInputElement ;
  navigator.clipboard.writeText(copyTarget.value);
}

(()=>{
  let copyUrlDOM = document.querySelectorAll('button.copy_url')! as NodeList;
  let copyCssDOM = document.querySelectorAll('button.copy_css')! as NodeList;
  for(let i=0; i<copyUrlDOM.length; i++){
    copyUrlDOM[i].addEventListener('click', async(ele)=>{
      copyUrlToClipboard(ele);
    });
  }
  for(let i=0; i<copyCssDOM.length; i++){
    copyCssDOM[i].addEventListener('click', async(ele)=>{
      copyCssToClipboard(ele);
    });
  }
})();

(document.querySelector('button.save')! as HTMLButtonElement).addEventListener('click',async ()=>{
  await save();
});
(document.querySelector('button.reload_setting')! as HTMLButtonElement).addEventListener('click',async ()=>{
  await loadToPopup();
});
(document.querySelector('button.apply_from_saved')! as HTMLButtonElement).addEventListener('click',async ()=>{
  let recs:Array<process.setting_rec> = await process.load();
  for(let i=0;i<recs.length; i++){
    await process.applyProc(
      recs[i],
      await process.getCurrentTab()
      );
  }
});
(document.querySelector('button.export')! as HTMLButtonElement).addEventListener('click',async ()=>{
  await exportSetting();
});
(document.querySelector('button.import')! as HTMLButtonElement).addEventListener('click',async ()=>{
  await importSetting();
});
window.addEventListener('load', async()=>{
  await loadToPopup();
  await resetSettingsInit();
});
