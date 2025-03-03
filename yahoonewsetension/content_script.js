const categoryLabels = ["国内・地域・ライフ", "国際", "経済", "エンタメ・スポーツ", "IT・科学"];

const recommends = [
  { text: "国内", href: 'https://news.yahoo.co.jp/categories/domestic' }, //国内・地域・ライフがminのとき
  { text: "国際", href: 'https://news.yahoo.co.jp/categories/world' }, //国際がminのとき
  { text: "経済", href: 'https://news.yahoo.co.jp/categories/business' }, //経済がminのとき
  { text: "エンタメ", href: 'https://news.yahoo.co.jp/categories/entertainment' }, //スポーツ・エンタメがminのとき
  { text: "IT", href: 'https://news.yahoo.co.jp/categories/it'} //IT・科学がminのとき
];

document.querySelectorAll(".msthdtxt").forEach(e => e.parentNode.removeChild(e)); //消す
document.querySelectorAll(".yjnSubAd").forEach(e => e.parentNode.removeChild(e)); //消す

let oscategory
let newscategory;//（主要=0）国内=1　国際=2　経済=3　エンタメ=4　スポーツ=5　ＩＴ=6　科学=7　ライフ=8　地域=9
let index;
let balance;
const target = document.querySelector("#msthd");

hensuu();
chrome.storage.local.get(['balance', 'kiroku'], update);

function hensuu(){
  if(document.querySelectorAll(".yjnHeader_sub_cat a").length > 0){
    oscategory = document.querySelectorAll(".yjnHeader_sub_cat a")
    newscategory = document.querySelectorAll(".yjnHeader_sub_cat li");
    current = document.querySelector(".yjnHeader_sub_cat .current");
    console.log(".yjnHeader_sub_cat .current");
    index = 0;//記事以外のページではグラフが更新されない
  }else{
    oscategory = document.querySelectorAll("#gnSec li a")
    newscategory = document.querySelectorAll("#gnSec li");
    const current = document.querySelector("#gnSec .current");
    console.log("#gnSec .current");
    newscategory = [].slice.call(newscategory);// HTMLCollectionから配列を作成
    index = newscategory.indexOf(current);// 要素の順番を取得
    console.log(index);
  }
}

function update(value) {
  balance = value.balance || Array(5).fill(0);
  let kiroku = value.kiroku || [];
  let url = location.href;//現在のurlを取得
  let categorytext = newscategory[index].textContent;//カテゴリーの名前

  if(document.querySelectorAll("#gnSec li").length > 0){//記事ページなら
    let urlog = kiroku.map(function(o){ return o.url });//urlのみの配列
    let found = urlog.find(function(elem) { return elem === url; });
    if(!found){
      let saishin = { timestamp: Date.now(), category: categorytext, url: url };
      kiroku.push(saishin);
      chrome.storage.local.set({'kiroku': kiroku}, function () { console.log("新しく保存"); });
      if(index == 1 ||index == 8 || index == 9) balance[0] += 1;
      if(index == 2) balance[1] += 1;
      if(index == 3) balance[2] += 1;
      if(index == 4 ||index == 5) balance[3] += 1;
      if(index == 6 ||index == 7) balance[4] += 1;
      chrome.storage.local.set({ 'balance': balance });
    }else{
      console.log("前にも見た");
    }
  }

  console.log(kiroku);

  let max = Math.max.apply(null, balance);
  let min = Math.min.apply(null, balance);
  let maxindex = balance.indexOf(max);
  let minindex = balance.indexOf(min);// 閲覧回数が最小のカテゴリー:0~4

  countlist(balance);
  osbutton(minindex);
  chartposition();
  if(max > 0) changescreen(min / max);
}

function countlist(balance){// カテゴリごとの閲覧回数のリスト表示
   let e = document.createElement("div");// <div></div>
   e.textContent = balance.map((count, i) => categoryLabels[i] + ":" + count + "回").join("\n");
   console.log(e.textContent);
   target.appendChild(e);
}

function osbutton(minindex){//おすすめボタン
  console.log(minindex);//0,1,2,3,4
  let e = document.createElement("button");
  e.id = "osbutton";
  e.classList.add("recommended");
  e.textContent = "おすすめ→" + recommends[minindex].text;
  e.onclick = function(){ window.location.href = recommends[minindex].href };
  target.appendChild(e);

  if(minindex == 0){//国内・地域・ライフがminのとき
    oscategory[1].classList.add("recommended");
    oscategory[8].classList.add("recommended");
    oscategory[9].classList.add("recommended");
  }
  if(minindex == 1){//国際がminのとき
    oscategory[2].classList.add("recommended");
  }
  if(minindex == 2){//経済がminのとき
    oscategory[3].classList.add("recommended");
  }
  if(minindex == 3){//スポーツ・エンタメがminのとき
    oscategory[4].classList.add("recommended");
    oscategory[5].classList.add("recommended");
  }
  if(minindex == 4){//IT・科学がminのとき
    oscategory[6].classList.add("recommended");
    oscategory[7].classList.add("recommended");
  }
}

function changescreen(rate){ //画面変化
  var obj = document.getElementById("wrapper");
  var obj2 = document.getElementById("contents");
  var obj3 = document.querySelector('body');

  if(rate <= 0.3){
    console.log("とても偏ってる！")
    obj.classList.add("very-unbalanced");
    obj2.classList.add("very-unbalanced");
    obj3.style.webkitTransform = "rotate(1.5deg)";
  }else if(rate <= 0.4){
    console.log("偏ってる！")
    obj.classList.add("unbalanced");
    obj2.classList.add("unbalanced");
    obj3.style.webkitTransform = "rotate(1deg)";
  }else if(rate <= 0.5){
    console.log("微妙です")
  }else if(rate <= 0.7){
    console.log("あんまり偏ってない")
  }
}

function chartposition(){
  let element2 = document.createElement("div");//<div></div>
  element2.className = "chart";
  if(document.querySelector("#yjnSub")){//#yjnSubの配列があれば
    let parentElement = document.querySelector("#yjnSub");
    let referenceElement = document.querySelector("#yjnFixableArea");
    console.log("yjnSubのほう");
    parentElement.insertBefore(element2, referenceElement);
  }else{
    let parentElement = document.querySelector("#sub");
    let referenceElement = document.querySelector("#fixedArea");
    console.log("subのほう");
    parentElement.insertBefore(element2, referenceElement);
  }
  const indexurl = chrome.runtime.getURL("index.html");
  loadFileToElement(element2, indexurl, afterLoad);
}



//
function afterLoad(){
  var ctx = document.getElementById("myChart");
  ctx.style.color = 'black';
  ctx.style.backgroundColor = 'white';
  var myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: categoryLabels,
      datasets: [{
        label: '閲覧回数',
        backgroundColor: "rgba(54, 162, 235,0.4)",
        borderColor: "rgba(54, 162, 235,1)",
        pointBackgroundColor: "rgba(179,181,198,1)",  //結合点の背景色
        pointBorderColor: "#fff",//結合点の枠線の色
        pointHoverBackgroundColor: "#fff",//結合点の背景色（ホバーしたとき）
        pointHoverBorderColor: "rgba(179,181,198,1)",//結合点の枠線の色（ホバーしたとき）
        hitRadius: 5,//結合点より外でマウスホバーを認識する範囲（ピクセル単位）
        data: balance,

      }]
    },
    options: {
      tooltips: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem, data) {
            console.log(data);
            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          }//optionsはdata、typeと同じ階層
        }
      },
      scale: {
        ticks: {
          suggestedMin: 0,
          // suggestedMax: 10,
          stepSize: 1
        }
      }
    }
  });
}

function loadFileToElement(element, indexurl, callback){
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      element.innerHTML = xhr.responseText;
      callback();
    }
  }
  xhr.open('GET', indexurl, true);
  xhr.send();
}
