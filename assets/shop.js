const mast = document.querySelector('.mast');
if (mast) {
  const panels = [...mast.querySelectorAll('details')];
  for (const panel of panels) {
    panel.addEventListener('toggle', () => {
      if (!panel.open) return;
      for (const other of panels) if (other !== panel) other.open = false;
      if (panel.classList.contains('find')) panel.querySelector('input').focus();
    });
    if (panel.closest('.menu') && matchMedia('(hover:hover)').matches) {
      panel.addEventListener('pointerenter', () => panel.open = true);
      panel.addEventListener('pointerleave', () => panel.open = false);
    }
  }
  document.addEventListener('click', e => panels.forEach(panel => {
    if (!panel.contains(e.target)) panel.open = false;
  }));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    for (const panel of panels) if (panel.open) {
      panel.open = false;
      panel.querySelector('summary').focus();
    }
  });
}
document.addEventListener('click', e => {
  const step = e.target.closest('[data-step]');
  if (!step) return;
  const qty = step.parentElement.querySelector('input.qty');
  if (!qty) return;
  if (step.dataset.step === '1') qty.stepUp(); else qty.stepDown();
  qty.dispatchEvent(new Event('change', {bubbles:true}));
});

const items = [
  {id:14,name:'厚切牛排',price:580,image:'steak'},
  {id:16,name:'雙人燒肉組',price:880,image:'cuts'},
  {id:18,name:'牛肉漢堡排',price:320,image:'burger'}
];
const bag = document.querySelector('.bag');
const info = document.querySelector('#demo-info');
const key = 'sumi-preview-basket-v1';
let stored;
try { stored=JSON.parse(localStorage.getItem(key)); } catch {}
const qty = items.map((_,i)=> Number.isInteger(stored?.[i]) ? Math.max(0,Math.min(30,stored[i])) : 0);
function renderBag(){
  const badge=bag.querySelector('.bag-count');
  const count=qty.reduce((a,b)=>a+b,0);
  badge.textContent=count;badge.hidden=!count;
  const list=items.map((p,i)=>qty[i] ? '<li><button type="button" data-remove="'+i+'" aria-label="移除'+p.name+'">×</button> <a href="market-'+p.id+'.html"><img alt="" src="assets/'+p.image+'.jpg">'+p.name+'</a><span class="quantity">'+qty[i]+' × NT$'+p.price+'</span></li>':'').join('');
  const total=qty.reduce((sum,n,i)=>sum+n*items[i].price,0);
  bag.querySelector('.widget_shopping_cart_content').innerHTML=count ? '<ul>'+list+'</ul><p>小計 NT$'+total.toLocaleString('zh-TW')+'</p><p class="buttons"><a class="checkout" href="#demo-info">模擬結帳</a></p>' : '<p class="woocommerce-mini-cart__empty-message">購物袋是空的</p>';
  try {localStorage.setItem(key,JSON.stringify(qty));}catch{}
}
function add(id,n){
  const i=items.findIndex(p=>p.id===Number(id));if(i<0)return;
  qty[i]=Math.min(30,qty[i]+n);renderBag();
  bag.open=true;
  bag.classList.toggle('float-feedback',mast.getBoundingClientRect().bottom<=0);
  document.querySelector('#cart-status').textContent='已加入模擬購物袋。';
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)bag.querySelector('.bag-panel').animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],220);
}
document.addEventListener('click',e=>{
  const button=e.target.closest('.add_to_cart_button,[data-remove],a[href="#demo-info"]');
  if(!button)return;
  e.preventDefault();
  if(button.matches('.add_to_cart_button'))return add(button.dataset.product_id,1);
  if(button.hasAttribute('data-remove')){qty[Number(button.dataset.remove)]=0;renderBag();return;}
  info.showModal();
});
bag.addEventListener('toggle',()=>{if(!bag.open)bag.classList.remove('float-feedback');});
document.querySelector('form.cart')?.addEventListener('submit',e=>{
  e.preventDefault();
  add(e.target.querySelector('[name="add-to-cart"]').value,Number(e.target.querySelector('.qty').value));
});
const tabLinks=[...document.querySelectorAll('.wc-tabs a')];
function showTab(link){
  tabLinks.forEach(a=>{
    const active=a===link,panel=document.getElementById(a.hash.slice(1));
    if(panel)panel.hidden=!active;
    a.parentElement.classList.toggle('active',active);
  });
}
tabLinks.forEach(a=>a.onclick=e=>{e.preventDefault();showTab(a);});
if(tabLinks.length)showTab(tabLinks[0]);
const grid=document.querySelector('ul.products');
if(grid){
 const filter=new URLSearchParams(location.search).get('s')?.trim().toLowerCase()||'';
 const cards=[...grid.children];
 cards.forEach(c=>{c.hidden=!c.textContent.toLowerCase().includes(filter);});
 if(filter){const message=document.querySelector('.woocommerce-result-count');if(message)message.textContent='搜尋「'+filter+'」：'+cards.filter(c=>!c.hidden).length+' 筆商品';}
 const sort=document.querySelector('.woocommerce-ordering select');
 sort?.addEventListener('change',()=>{const code=sort.value;const order=cards.slice();if(code.startsWith('price'))order.sort((a,b)=>(parseInt(a.querySelector('.price').textContent.replace(/\D/g,''))-parseInt(b.querySelector('.price').textContent.replace(/\D/g,'')))*(code==='price-desc'?-1:1));if(code==='date')order.reverse();grid.append(...order);});
}
renderBag();
