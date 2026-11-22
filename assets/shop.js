const products = [
  {name:'厚切牛排', unit:'250 公克／包', price:580, image:'steak'},
  {name:'雙人燒肉組', unit:'500 公克／盒', price:880, image:'cuts'},
  {name:'牛肉漢堡排', unit:'150 公克 × 2 片', price:320, image:'burger'}
];
const basket = document.querySelector('#basket');
const storageKey = 'sumi-preview-basket-v1';
let saved;
try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
const quantities = products.map((_,i) => Number.isInteger(saved?.[i]) && saved[i] > 0 ? Math.min(saved[i],99) : 0);
function update() {
  document.querySelector('#count').textContent = quantities.reduce((a,b)=>a+b,0);
  const lines = document.querySelector('#lines');
  lines.replaceChildren();
  products.forEach((item,i)=>{
    if (!quantities[i]) return;
    const row=document.createElement('p');
    row.append(item.name+' × '+quantities[i]);
    const remove=document.createElement('button');
    remove.textContent='移除';
    remove.setAttribute('aria-label','移除'+item.name);
    remove.onclick=()=>{quantities[i]=0;update();};
    row.append(remove);lines.append(row);
  });
  if (!lines.childElementCount) lines.textContent='購物袋是空的';
  const total=products.reduce((sum,item,i)=>sum+item.price*quantities[i],0);
  document.querySelector('#total').textContent='小計 NT$'+total.toLocaleString('zh-TW');
  try {localStorage.setItem(storageKey,JSON.stringify(quantities));} catch {}
}
products.forEach((item,i)=>{
  const card=document.createElement('article');
  card.innerHTML='<img loading="lazy" alt="'+item.name+'料理示意" src="assets/'+item.image+'.jpg"><h3>'+item.name+'</h3><p>'+item.unit+' · NT$'+item.price+'</p><button>加入購物袋</button>';
  card.querySelector('button').onclick=()=>{quantities[i]=Math.min(99,quantities[i]+1);update();basket.showModal();};
  document.querySelector('#grid').append(card);
});
document.querySelector('#bag').onclick=()=>basket.showModal();
document.querySelector('#close').onclick=()=>basket.close();
update();
