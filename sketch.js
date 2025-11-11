let objs = [];
let colors = ['#52489c', '#4062bb', '#59c3c3', '#ebebeb', '#f45b69', '#454545'];

//（已還原）不使用自訂字體變數

// 新增：選單與狀態變數
let menuDiv;
let menuButtons = [];
let currentArtwork = 1; // 1..7
let bgColors = ['#ffc2d1', '#f0f8ff', '#fff7e6'];
// 新增子選單相關狀態變數
let submenuDiv;
let subBtn;               // 教育科技學系按鈕參考
let submenuHovered = false;
let subSelected = false;
// 新增：啟動畫面標題顯示旗標
let showStartupTitle = true;

// 新增 iframe 相關變數與目標 URL
let iframeEl;
const iframeUrls = {
    1: 'https://jenny0225p-bot.github.io/20251014_3/',
    2: 'https://hackmd.io/@uumP-3ncSdqWuO_Q9gDn6g/r1j5Kdyhle',
    3: 'https://jenny0225p-bot.github.io/1028/', // 測驗系統使用 iframe 開啟此網址
    4: 'https://hackmd.io/@uumP-3ncSdqWuO_Q9gDn6g/BJas0RLyWe', // 測驗卷筆記
    5: 'https://hackmd.io/@uumP-3ncSdqWuO_Q9gDn6g/ryEVSJDyWl', // 作品筆記（iframe 開啟）
    6: 'https://www.tku.edu.tw/', // 淡江大學（在 iframe 中開啟）
    7: ''  // 回到主頁（無外部連結，點選時會切換到該作品頁面並隱藏 iframe）
};

// 新增：啟動畫面文字特效變數
let titleAnim = {
    hue: 0,
    speed: 20,     // 色相變化速度
    glowLayers: 6, // 發光層數
    wobbleAmp: 6   // 文字抖動振幅（像素）
};

function setup() {
    // 全螢幕 canvas 並移除 body 預設 margin
    createCanvas(windowWidth, windowHeight);
    let bd = select('body');
    if (bd) bd.style('margin', '0');
    rectMode(CENTER);
    INIT();

    // 不再注入自訂字體，使用預設系統字型

    // 建立左側半透明選單（固定定位，確保在畫布之上）
    menuDiv = createDiv();
    menuDiv.style('position', 'fixed');
    menuDiv.style('left', '12px');
    menuDiv.style('top', '12px');
    // 改用寬度與最大高度 (vh) 讓選單可以隨內容伸長，但不超過視窗
    menuDiv.style('width', '220px');
    menuDiv.style('max-height', '88vh'); // 最多佔視窗高度的 88%
    menuDiv.style('height', 'auto');
    menuDiv.style('background', 'rgba(255,255,255,0.94)');
    menuDiv.style('padding', '14px'); // 內邊距增大，避免文字被切到
    menuDiv.style('border-radius', '8px');
    menuDiv.style('box-shadow', '0 6px 18px rgba(0,0,0,0.08)');
    menuDiv.style('z-index', '10000');
    // 使用系統預設字型
    menuDiv.style('font-family', 'sans-serif');
    menuDiv.style('user-select', 'none');
    menuDiv.style('box-sizing', 'border-box'); // 包含內邊距於寬高計算
    // 若按鈕太多會出現捲軸，避免溢出白色框框
    menuDiv.style('overflow-y', 'auto');
    menuDiv.style('overflow-x', 'hidden');

    let title = createP('選擇作品');
    title.parent(menuDiv);
    title.style('margin', '0 0 8px 0'); // 增加標題底部間距
    title.style('padding', '0 4px');    // 小內距避免被邊緣切到
    title.style('font-weight', '700');
    title.style('font-size', '16px'); // 放大標題字型
    title.style('word-wrap', 'break-word'); // 避免標題溢出
    title.style('overflow', 'hidden');
    // 使用系統字型
    title.style('font-family', 'sans-serif');

    // 建七個按鈕（點選僅切換作品，不再開新分頁）
    for (let i = 1; i <= 7; i++) {
        // 根據索引設定顯示文字（新增第7項）
        let label = (i === 1) ? '第一單元作品'
                  : (i === 2) ? '第一單元講義'
                  : (i === 3) ? '測驗系統'
                  : (i === 4) ? '測驗卷筆記'
                  : (i === 5) ? '作品筆記'
                  : (i === 6) ? '淡江大學'
                  : '回到主頁';
        let btn = createButton(label);
        btn.parent(menuDiv);
        // 使用系統字型（恢復為原始）
        // btn.style('font-family', 'sans-serif'); // 可留空由瀏覽器繼承
        btn.style('display', 'block');
        btn.style('width', '100%');
        btn.style('margin', '6px 0');        // 保留一點垂直留白
        btn.style('padding', '10px 10px');   // 增加按鈕內邊距，避免文字靠邊
        btn.style('text-align', 'left');
        btn.style('font-size', '15px');      // 放大按鈕字型
        btn.style('line-height', '20px');    // 增加行高讓文字更易讀
        btn.style('background', i === currentArtwork ? '#e9e9e9' : 'transparent');
        btn.style('border', 'none');
        btn.style('cursor', 'pointer');
        btn.style('box-sizing', 'border-box'); // 確保 padding 不會造成文字被裁切
        // 確保文字換行且不會超出白色框框
        btn.style('white-space', 'normal');
        btn.style('word-wrap', 'break-word');
        btn.style('overflow', 'hidden');
        btn.style('text-overflow', 'ellipsis'); // 若單行情況下也保險顯示省略

        // 淡江大學（i === 6）需要同時在 iframe 開啟網址並顯示子選單
        if (i === 6) {
            // 建子選單（放在淡江大學按鈕下方，使用正常 document flow）
            submenuDiv = createDiv();
            submenuDiv.parent(menuDiv);
            // 使用標準文件流（相對定位），確保子選單會在主按鈕下方顯示
            submenuDiv.style('display', 'none');
            submenuDiv.style('position', 'relative');
            submenuDiv.style('margin-left', '8px');           // 縮排
            submenuDiv.style('width', 'calc(100% - 8px)');
            submenuDiv.style('box-sizing', 'border-box');
            submenuDiv.style('padding', '4px 6px 8px 6px');
            submenuDiv.style('background', 'transparent');
 
             // 子項目按鈕：教育科技學系（點擊在 iframe 中開啟教育科技學系）
             subBtn = createButton('教育科技學系');
             subBtn.parent(submenuDiv);
             // subBtn 使用系統字型（恢復為原始）
             subBtn.style('display', 'block');
             subBtn.style('width', '100%');
             subBtn.style('margin', '4px 0');
             subBtn.style('padding', '8px 8px');
             subBtn.style('text-align', 'left');
             subBtn.style('font-size', '14px');
             subBtn.style('background', 'transparent');
             subBtn.style('border', 'none');
             subBtn.style('cursor', 'pointer');
             subBtn.style('box-sizing', 'border-box');
 
             subBtn.mousePressed(() => {
                 // 在 iframe 中開啟教育科技學系（不跳轉頁面）
                 setArtwork(6); // 套用淡江大學相關狀態
                 if (iframeEl) {
                     iframeEl.attribute('src', 'https://www.et.tku.edu.tw/');
                     iframeEl.style('display', 'block');
                 }
                 // 設定子選單為已選取，並更新樣式（使按鈕變灰）
                 subSelected = true;
                 subBtn.style('background', '#e9e9e9');
                 // 同時把主按鈕（淡江大學）設為選取色（使用當前 btn 以免 menuButtons 尚未建立）
                 btn.style('background', '#e9e9e9');
             });
 
            // 當滑鼠移到淡江大學主按鈕時自動顯示子選單
            btn.mouseOver(() => {
                if (submenuDiv) submenuDiv.style('display', 'block');
            });
            btn.mouseOut(() => {
                setTimeout(() => {
                    if (!submenuHovered && submenuDiv) submenuDiv.style('display', 'none');
                }, 120);
            });
 
             // 追蹤子選單是否被滑鼠停留
             submenuDiv.mouseOver(() => {
                 submenuHovered = true;
                 submenuDiv.style('display', 'block');
             });
             submenuDiv.mouseOut(() => {
                 submenuHovered = false;
                 setTimeout(() => {
                     if (!submenuHovered && submenuDiv) submenuDiv.style('display', 'none');
                 }, 120);
             });
 
             // 主按鈕：點擊開啟淡江大學並切換子選單顯示狀態
             btn.mousePressed(() => {
                 // 每次點淡江大學都在 iframe 中顯示淡江大學官網（不跳轉頁面）
                 if (iframeEl) {
                     iframeEl.attribute('src', iframeUrls[6] || 'about:blank');
                     iframeEl.style('display', 'block');
                 }
                 // 更新狀態與按鈕樣式
                 setArtwork(6);
 
                // 切換子選單顯示（固定在按鈕下方）
                if (submenuDiv) {
                    submenuDiv.style('display', submenuDiv.style('display') === 'none' ? 'block' : 'none');
                }
              });
         } else {
             btn.mousePressed(((id) => {
                 return () => {
                     // 其他按鈕行為：直接切換作品
                     setArtwork(id);
                 };
             })(i));
         }
          menuButtons.push(btn);
    }

    // 初始隱藏選單，只有滑鼠靠左時才顯示
    menuDiv.style('display', 'none');

    // 建立 iframe（預設隱藏），寬度為視窗的 80%（使用 vw/vh）
    iframeEl = createElement('iframe');
    iframeEl.attribute('src', 'about:blank');
    iframeEl.style('position', 'fixed');
    iframeEl.style('left', '10vw');   // 保持置中（左右各10%）
    iframeEl.style('top', '10vh');
    iframeEl.style('width', '80vw');  // 寬度為全螢幕的 80%
    iframeEl.style('height', '80vh');
    iframeEl.style('border', '0');
    iframeEl.style('display', 'none');
    iframeEl.style('z-index', '9999'); // 在畫布之上，但 menuDiv z-index 較高
    iframeEl.style('background', '#ffffff');
}

// 已還原：不再使用 preload 載入本地字體
function preload() {
    // 保留空的 preload 以符合原始草稿流程
}

function draw() {
    // 根據滑鼠 X 座標顯示或隱藏選單（靠左 100px 時顯示）
    // mouseX 初始為 0，若視窗外或未移動仍會正確處理
    if (mouseX <= 100) {
        menuDiv.style('display', 'block');
    } else {
        menuDiv.style('display', 'none');
    }

    // 使用依作品切換的背景色
    background(bgColors[(currentArtwork - 1) % bgColors.length]);
    for (let i of objs) {
        i.show();
        i.move();
    }

    // 如果尚未切換任何選單，顯示啟動畫面文字（置中）
    if (showStartupTitle) {
        push();
        // 將繪製原點移到畫布正中央
        translate(width / 2, height / 2);
        textAlign(CENTER, CENTER);
        let ts = min(width, height) * 0.12;
        textSize(ts);
        textFont('sans-serif');

        // 動畫參數
        let t = millis() / 1000;
        titleAnim.hue = (t * titleAnim.speed) % 360;
        let baseHue = titleAnim.hue;
        let wobble = sin(t * 2.2) * titleAnim.wobbleAmp;
        let label = '淡江大學';

        // 使用 HSB 方便色相循環
        colorMode(HSB, 360, 100, 100, 1);
        for (let k = titleAnim.glowLayers; k >= 1; k--) {
            let h = (baseHue + k * 14) % 360;
            let a = map(k, 1, titleAnim.glowLayers, 0.12, 0.45);
            fill(h, 90, 90, a);
            noStroke();
            let dx = cos(t * 3 + k) * k * 1.2;
            let dy = sin(t * 2 + k) * k * 0.9 + wobble * (k / titleAnim.glowLayers);
            text(label, dx, dy);
        }

        stroke((baseHue + 10) % 360, 100, 60, 0.95);
        strokeWeight(3 + sin(t * 3) * 1.5);
        fill(0);
        text(label, 0, wobble * 0.2);

        noStroke();
        fill(255, 0.95);
        text(label, 0, wobble * 0.18);

        // 新增：在主標題下方顯示學號與姓名
        colorMode(RGB, 255);
        push();
        // 使用較小字型並稍微下移
        textSize(ts * 0.22);
        fill(24, 24, 24, 220); // 深灰帶點透明
        text('414730159 彭宥蓁', 0, ts * 0.95 + wobble * 0.2);
        pop();

        colorMode(RGB, 255);
        pop();
    }

    if (frameCount % 95 == 0) {
        INIT();
    }
}

// 新增：顯示 / 隱藏 iframe 的輔助函式
function showIframeFor(id) {
    const url = iframeUrls[id];
    if (!url) return hideIframe();
    iframeEl.attribute('src', url);
    iframeEl.style('display', 'block');
}

function hideIframe() {
    if (iframeEl) {
        iframeEl.attribute('src', 'about:blank');
        iframeEl.style('display', 'none');
    }
}

// 新增：切換作品
function setArtwork(id) {
    // 點回到主頁時顯示啟動畫面文字；選其他項目時隱藏
    if (id === 7) {
        showStartupTitle = true;
    } else {
        showStartupTitle = false;
    }

    if (currentArtwork === id) return;
    currentArtwork = id;

    // 更新按鈕樣式（標示選取）
    for (let i = 0; i < menuButtons.length; i++) {
        menuButtons[i].style('background', (i + 1) === id ? '#e9e9e9' : 'transparent');
    }

    // 若切換到非淡江大學項目，清除子選單選取狀態與樣式
    if (id !== 6) {
        subSelected = false;
        if (subBtn) subBtn.style('background', 'transparent');
        if (submenuDiv) submenuDiv.style('display', 'none');
    }

    // 可根據不同作品調整參數或色盤
    if (currentArtwork === 1) {
        colors = ['#52489c', '#4062bb', '#59c3c3', '#ebebeb', '#f45b69', '#454545'];
    } else if (currentArtwork === 2) {
        colors = ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#ffb4a2', '#2a9d8f'];
    } else if (currentArtwork === 3) {
        colors = ['#0b3c5d', '#1e576a', '#3aa0a8', '#f6f7f8', '#ffd166', '#f25f5c'];
    }

    // 若有對應的 iframe URL 就在 iframe 中顯示，否則隱藏 iframe
    if (iframeUrls[id]) {
        showIframeFor(id);
    } else {
        hideIframe();
    }

    INIT();
}

function INIT() {
    objs = [];
    let num1 = int(random(3, 7));
    let num2 = int(random(40, 80));
    for (let i = 0; i < num1; i++) {
        objs.push(new OMP());
    }

    for (let i = 0; i < num2; i++) {
        objs.push(new SBM(i / 8));
    }
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function easeInQuart(x) {
    return x * x * x * x;
}

class SBM {
    constructor(t) {
        this.x0 = 0;
        this.y0 = 0;
        this.r = random(0.4) * width;
        let a = random(10);
        this.x1 = this.r * cos(a);
        this.y1 = this.r * sin(a);
        this.x = this.x0;
        this.y = this.y0;
        this.d0 = 0;
        this.d1 = random(5, 40);
        this.d = 0;
        this.t = -int(t);
        this.t1 = 40;
        this.t2 = this.t1 + 0;
        this.t3 = this.t2 + 40;
        this.rot1 = PI * random(0.5);
        this.rot = random(10);
        this.col = random(colors);
        this.rnd = int(random(3));
    }

    show() {
        push();
        translate(width / 2, height / 2);
        rotate(this.rot);
        if (this.rnd == 0) {
            fill(this.col);
            strokeWeight(0);
            circle(this.x, this.y, this.d);
        } else if (this.rnd == 1) {
            fill(this.col);
            strokeWeight(0);
            rect(this.x, this.y, this.d, this.d);
        }
        else if (this.rnd == 2) {
            noFill();
            stroke(this.col);
            strokeWeight(this.d * 0.3);
            line(this.x - this.d *0.45, this.y - this.d *0.45, this.x + this.d *0.45, this.y + this.d *0.45);
            line(this.x - this.d *0.45, this.y + this.d *0.45, this.x + this.d *0.45, this.y - this.d *0.45);
        }
        pop();
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1);
            this.x = lerp(this.x0, this.x1, easeOutQuart(n));
            this.y = lerp(this.y0, this.y1, easeOutQuart(n));
            this.d = lerp(this.d0, this.d1, easeOutQuart(n));

        } else if (this.t2 < this.t && this.t < this.t3) {
            let n = norm(this.t, this.t2, this.t3 - 1);
            this.x = lerp(this.x1, this.x0, easeInQuart(n));
            this.y = lerp(this.y1, this.y0, easeInQuart(n));
            this.d = lerp(this.d1, this.d0, easeInQuart(n));
        }
        this.t++;
        this.rot += 0.005;
    }
}

class OMP {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.d = 0;
        this.d1 = width * random(0.1, 0.9) * random();

        this.t = -int(random(20));
        this.t1 = 40;
        this.t2 = this.t1 + 40;
        this.sw = 0;
        this.sw1 = this.d1 * random(0.05);
        this.col = random(colors);
    }

    show() {
        noFill();
        stroke(this.col);
        strokeWeight(this.sw);
        circle(this.x, this.y, this.d);
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1);
            this.d = lerp(0, this.d1, easeOutQuart(n));
            this.sw = lerp(0, this.sw1, easeOutQuart(n));
        } else if (this.t1 < this.t && this.t < this.t2) {
            let n = norm(this.t, this.t1, this.t2 - 1);
            this.d = lerp(this.d1, 0, easeInQuart(n));
            this.sw = lerp(this.sw1, 0, easeInQuart(n));
        }
        this.t++;
    }
}

// 新增：視窗大小改變時調整畫布並重置物件（保持圖像置中）
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    INIT();
}