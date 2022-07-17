export class setting_rec{
  constructor(
    _apply : boolean = false,
    _name : string = "",
    _url : string = "",
    _css : string = ""
  ){
    this.apply = _apply;
    this.name = _name;
    this.url = _url;
    this.css = _css;
  }
  apply:boolean;
  name:string;
  url:string;
  css:string;
};

let ROW_MAX : number = 20;

export async function initSave() {

  if (await getLocalStorage('settings')){
    return;
  }

  let recs:Array<setting_rec> = new Array();
  for(let i=0;i<ROW_MAX;i++){
    recs.push(new setting_rec(
      false,
      "",
      "",
      ""
    ));
  }
  chrome.storage.local.set({"settings": JSON.stringify(recs)});
}




/**
 * 今表示しているのタブを取得
 * @returns 取得したタブ
 */
export async function getCurrentTab() : Promise<chrome.tabs.Tab> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);  //query()の戻り値はtabの配列だが、この`let [tab] = ～`記法で、最初の要素だけを取得してtabへ格納できる。
  return tab;
}

/**
 * Storageのget処理をPromiseでラップすることで分離。
 * @param key 取得対象のキー
 * @returns キーに対応する値
 */
export async function getLocalStorage(key:any){
  return new Promise( (resolve) => {
    chrome.storage.local.get(key, (Obj)=>{
      resolve(Obj[key])
    });
  });
}

/**
 * 設定読み込み
 * @returns 読み込んだ設定データ
 */
export async function load() : Promise<Array<setting_rec>> {
  let recs:Array<setting_rec> = new Array();
  let settings = JSON.parse( await getLocalStorage('settings') as string ) as Array<setting_rec>;
  for(let i=0;i<settings.length;i++){
    recs.push(new setting_rec(
      settings[i].apply,
      settings[i].name,
      settings[i].url,
      settings[i].css
    ));
  }
  return recs;
}

/**
 * 適用
 * @param rec 適用対象の設定レコード
 * @param tab イベント発生した読み込まれたタブ
 */
export async function applyProc(rec:setting_rec, tab:chrome.tabs.Tab ) {
  let newCss = rec.css;
  let targetUrl = rec.url;
  let isTarget = (tab.url!.match(targetUrl) != null) ? true : false;
  let isEnable = rec.apply;

  if (isTarget && isEnable) {
    chrome.scripting.insertCSS({
      target: { tabId: tab.id as number },
      css: newCss,
      origin: 'USER'
    })
    console.log('insertCSS');
  }
}


