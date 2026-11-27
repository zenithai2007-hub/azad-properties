/* Azad Properties — shared front-end logic (static, no backend) */
(function(){
"use strict";
var CUR = localStorage.getItem("azad-cur") || "USD";
var SKY = '<svg viewBox="0 0 120 40" class="sky" aria-hidden="true"><path d="M6 40V18h10v22M20 40V8h12v32M36 40V22h10v18M50 40V4h12v36M66 40V16h10v24M80 40V10h12v30M96 40V20h10v20M110 40V26h6v14" fill="rgba(255,255,255,.28)"/></svg>';

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function waLink(msg){ return "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(msg); }
/* Price ranges (Shaan sheet, 27 Nov 2026): a listing may carry priceMin/priceMax
   (priceMaxOpen = range is open-ended, e.g. "$560,000+"). price = priceMin. */
function priceText(l, cur){
  if (l.priceMin != null){
    var mn = fmtPrice(l.priceMin, cur);
    if (l.priceMax != null) return mn + " – " + fmtPrice(l.priceMax, cur) + (l.priceMaxOpen ? "+" : "");
    return "From " + mn;
  }
  if (l.price != null) return fmtPrice(l.price, cur);
  return null;
}
function priceWa(l){
  if (l.priceMin != null) return " listed from $" + l.priceMin.toLocaleString("en-US") + " USD";
  if (l.price != null) return " listed at $" + l.price.toLocaleString("en-US") + " USD";
  return "";
}
function priceHtml(l){
  var t = priceText(l, CUR);
  if (t == null) return '<div class="card-price"><span class="por">Price on request</span></div>';
  var extra = CUR !== "USD" ? ' <small>(' + priceText(l, "USD") + ')</small>' : "";
  return '<div class="card-price">' + t + extra + (l.note ? '<span class="lnote" style="display:block;font-family:sans-serif;font-size:11px;color:var(--mut2);letter-spacing:.5px">' + esc(l.note) + '</span>' : '') + '</div>';
}
function badgeHtml(l){
  if (l.tags && l.tags.indexOf("New Development") >= 0) return '<span class="card-badge dev">New Development</span>';
  if (l.eligCit) return '<span class="card-badge cbi">Citizenship Qualified</span>';
  if (l.eligRes) return '<span class="card-badge res">Residence Permit Qualified</span>';
  return "";
}
function cardHtml(l, gold){
  var meta = [];
  if (l.sqm) meta.push(l.sqm.toLocaleString("en-US") + " sqm");
  if (l.layout) meta.push(esc(l.layout));
  var spec = [];
  if (l.units) spec.push(esc(l.units));
  if (l.status) spec.push(esc(l.status));
  if (l.side) spec.push(esc(l.side) + " Side");
  var det = "property.html?ref=" + encodeURIComponent(l.ref);
  return '<article class="card">' +
    '<div class="card-img' + (gold ? ' gold' : '') + '">' +
      '<a class="card-img-link" href="' + det + '">' +
      (l.img ? '<img src="' + esc(l.img) + '" alt="' + esc(l.name) + '" loading="lazy">' : '') +
      '<span class="card-cat">' + esc(l.type) + '</span>' + badgeHtml(l) + SKY +
      '<span class="card-loc">' + esc(l.district) + ', ' + esc(l.city) + '</span></a>' +
      '<button class="fav-btn' + (isFav(l.ref) ? ' on' : '') + '" data-fav="' + esc(l.ref) + '" aria-label="Save to favourites" title="Save to favourites">♥</button></div>' +
    '<div class="card-body">' +
      '<a class="card-name" href="' + det + '">' + esc(l.name) + '</a>' +
      (l.d ? '<div class="card-desc">' + esc(l.d) + '</div>' : '') +
      '<div class="small muted">Ref: ' + esc(l.ref) + '</div>' +
      priceHtml(l) +
      '<div class="card-meta">' + meta.map(function(m){return "<span>"+m+"</span>";}).join("") + '</div>' +
      (spec.length ? '<div class="card-spec">' + spec.join(" &middot; ") + '</div>' : '') +
      '<div class="card-cta-row">' +
        '<a class="card-cta" href="#" data-enquire="' + esc(l.ref) + '">Quick Enquire</a>' +
        '<a class="card-cta wa" target="_blank" rel="noopener" href="' + waLink("Hello Azad Properties, I am interested in " + l.name + " (" + l.ref + ")" + priceWa(l) + ".") + '">WhatsApp</a>' +
      '</div>' +
      (l.video ? '<a class="video-link" target="_blank" rel="noopener" href="' + esc(l.video) + '">▶ Video Tour</a>' : '') +
      '</div></article>';
}
function renderInto(el, list){
  if (!el) return;
  if (!list.length){ el.innerHTML = '<div class="empty">No properties match these filters. Try widening the price range or clearing a filter — or ask us on WhatsApp and we will find a match.</div>'; return; }
  el.innerHTML = list.map(function(l,i){ return cardHtml(l, i % 5 === 2); }).join("");
  bindEnquire(el);
  bindFavs(el);
}
function bindFavs(scope){
  (scope || document).querySelectorAll("[data-fav]").forEach(function(b){
    b.addEventListener("click", function(e){ e.preventDefault(); toggleFav(b.getAttribute("data-fav")); });
  });
}
function bindEnquire(scope){
  (scope || document).querySelectorAll("[data-enquire]").forEach(function(a){
    a.addEventListener("click", function(e){ e.preventDefault(); openEnquiry(a.getAttribute("data-enquire")); });
  });
}
function applyCurrency(){
  document.querySelectorAll("[data-cur]").forEach(function(s){ s.value = CUR; });
  document.querySelectorAll("[data-price-note]").forEach(function(n){ n.textContent = CUR === "USD" ? "" : RATE_NOTE; });
  if (window.__renderCurrent) window.__renderCurrent();
}
window.AZAD = { renderInto: renderInto, cardHtml: cardHtml, esc: esc, waLink: waLink, priceHtml: priceHtml, priceText: priceText, priceWa: priceWa };

/* ---------- mobile nav ---------- */
var tog = document.getElementById("nav-toggle"), mnav = document.getElementById("mobile-nav");
if (tog && mnav) tog.addEventListener("click", function(){ mnav.classList.toggle("open"); });

/* ---------- live FX rates (open.er-api.com, free, no key) ----------
   Shaan flagged the TRY conversion as wrong: the hardcoded TRY 41.2 in data.js
   is stale (live rate is ~50.7). We fetch live USD rates and update RATES, then
   re-render prices. Rates are cached 6h in localStorage. If the fetch fails or
   times out, the hardcoded fallback rates stay — prices never go blank. */
var RATES_TTL = 6 * 60 * 60 * 1000; /* 6h */
function applyLiveRates(r){
  if (!r || typeof RATES === "undefined") return false;
  var ok = false;
  ["EUR","GBP","TRY"].forEach(function(c){
    var v = parseFloat(r[c]);
    if (isFinite(v) && v > 0 && RATES[c]){ RATES[c].rate = v; ok = true; }
  });
  return ok;
}
function refreshRates(){
  try {
    var raw = localStorage.getItem("azad-rates");
    if (raw){
      var c = JSON.parse(raw);
      if (c && c.ts && (Date.now() - c.ts) < RATES_TTL && applyLiveRates(c.rates)) return;
    }
  } catch(e){}
  var ctl = null, timer = null;
  try {
    if (window.AbortController){
      ctl = new AbortController();
      timer = setTimeout(function(){ try { ctl.abort(); } catch(e){} }, 8000);
    }
    fetch("https://open.er-api.com/v6/latest/USD", ctl ? { signal: ctl.signal } : undefined)
      .then(function(res){ return res.json(); })
      .then(function(d){
        if (timer) clearTimeout(timer);
        if (!d || d.result !== "success" || !d.rates) return;
        if (!applyLiveRates(d.rates)) return;
        try { localStorage.setItem("azad-rates", JSON.stringify({ ts: Date.now(), rates: { EUR: d.rates.EUR, GBP: d.rates.GBP, TRY: d.rates.TRY } })); } catch(e){}
        applyCurrency();
      })
      .catch(function(){ if (timer) clearTimeout(timer); /* keep fallback rates */ });
  } catch(e){ if (timer) clearTimeout(timer); }
}
refreshRates();

/* ---------- language: handled by assets/js/i18n.js (10 languages, English default) ---------- */

/* ---------- FAQ accordions ---------- */
document.querySelectorAll(".faq-q").forEach(function(q){
  q.addEventListener("click", function(){
    var item = q.parentElement, wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(function(i){ i.classList.remove("open"); });
    if (!wasOpen) item.classList.add("open");
  });
});

/* ---------- toast ---------- */
var toastTimer = null;
function toast(html){
  var t = document.getElementById("toast"); if (!t) return;
  t.innerHTML = html; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 3800);
}
window.__toast = toast;

/* ---------- favourites (saved in this browser) ---------- */
var FAVS = [];
try { FAVS = JSON.parse(localStorage.getItem("azad-favs") || "[]"); } catch(e){ FAVS = []; }
function isFav(ref){ return FAVS.indexOf(ref) >= 0; }
function toggleFav(ref){
  var i = FAVS.indexOf(ref);
  if (i >= 0) FAVS.splice(i, 1); else FAVS.push(ref);
  try { localStorage.setItem("azad-favs", JSON.stringify(FAVS)); } catch(e){}
  updateFavCount();
  if (window.__renderCurrent) window.__renderCurrent();
}
function updateFavCount(){ document.querySelectorAll("[data-fav-count]").forEach(function(el){ el.textContent = FAVS.length; }); }
window.__toggleFav = toggleFav;

/* ---------- Ask Azad chat: answer basics -> capture lead -> hand over to sales agent on WhatsApp ---------- */
var CHAT = [
{k:["steps to apply", "certificate of conformity", "application steps"], a:"The steps are: 1) Turkish tax ID, 2) Turkish bank account, 3) buy property of $400,000+ with a 3-year hold clause, 4) licensed valuation report, 5) register the Tapu, 6) Certificate of Conformity, 7) residence permit, 8) citizenship application — usually processed in 4 to 8 months."},
{k:["lira", "convert", "currency conversion", "foreign currency", "exchange certificate"], a:"Yes. All investments must be converted to Turkish Lira through a Turkish bank, and a Foreign Currency Purchase Certificate must accompany the title deed submission."},
{k:["excluded", "nationalities", "language test", "language requirement"], a:"The main applicant, spouse and children under 18 can apply. No Turkish language test and no residency are required. Excluded nationalities: Armenia, North Korea, Cuba and Syria."},
{k:["resell", "sell after", "sell my property", "sell the property"], a:"Yes — after the mandatory 3-year holding period you can resell, and your citizenship is not affected."},
{k:["denied", "denial", "rejected", "refused", "appeal"], a:"You can appeal. Denials are often due to file issues or incorrect currency conversion, so legal assistance is strongly recommended."},
{k:["background check", "police certificate", "criminal"], a:"Yes — Turkish authorities run a background check. You do not need foreign police certificates."},
{k:["legal risk", "risks", "pitfall", "mistakes to avoid"], a:"Make sure funds go through Turkish banks only, the appraisal matches the purchase value, you do not buy from another foreigner, the 3-year hold clause is recorded on the Tapu, and short-term rentals have the required permits."},
{k:["under construction", "off-plan", "off plan", "renovating", "still being built"], a:"Yes. You can apply while renovating or building, as long as you hold a valid title deed and valuation."},
{k:["hold value", "deprecia", "lose value"], a:"Yes — Istanbul's average price rose from US$1,517 per sqm in Q2 2024 to US$1,520 in Q1 2025, and the national average rose from US$870 to US$988. Even after the Lira lost about half its value, USD prices moved higher."},
{k:["visa-free", "visa free", "110 countries", "visa access"], a:"A Turkish passport gives visa-free or visa-on-arrival access to 110+ countries, including Japan, South Korea, Singapore, South Africa, most of South America and many Balkan nations. Schengen, UK, US and Canada require standard visa applications."},
{k:["schengen"], a:"Yes. Turkish passport holders and residents can apply at any Schengen country's consulate in Turkey. Apply at least 15 days before travel; processing usually takes within 15 business days."},
{k:["us visa", "u.s. visa", "us tourist", "b-1", "b-2", "ds-160", "america visa"], a:"Yes. Complete Form DS-160, book an interview at the US Embassy in Ankara or the Consulate in Istanbul, pay the $185 visa fee, and show proof of travel purpose and ties to Turkey. Issuance usually takes 5 to 15 business days after the interview."},
{k:["uk visa", "uk tourist", "british visa", "tlscontact", "vfs"], a:"Yes. With a Turkish residence permit you can apply for Standard Visitor, Family and Work visas online, processed through TLSContact or VFS Global centres in Turkey. You must not be in the UK when you apply."},
{k:["why invest", "price growth", "capital appreciation", "knight frank"], a:"Turkey led all 56 markets in Knight Frank's Global House Price Index in Q4 2024, with 29.4% annual nominal growth, and Istanbul saw 29.6% nominal gains in January 2025."},
{k:["yield", "rental yield", "net return", "gross yield"], a:"Turkey-wide gross rental yield reached 7.41% in Q1 2025, and Istanbul averages 7.30% gross — about 5–6% net. Top areas include Beylikdüzü at 11.7% for 1-bed homes."},
{k:["rent increase", "rent hike", "cpi", "tuik", "t\u00fcik"], a:"Yes. Rents can be adjusted annually based on Turkey's Consumer Price Index (CPI), published monthly by TUİK. After the old 25% cap was lifted, increases follow CPI, which ranged 25–65% in 2024."},
{k:["airbnb", "short-term rental", "short term rental", "tourism license", "holiday rental"], a:"Short-term rentals under 100 days a year are allowed but need a Tourism Purpose Accommodation License and building management approval. Unlicensed rentals risk fines of TRY 100,000 to TRY 1,000,000."},
{k:["citizen","passport","400","400000","400,000"], a:"Invest a minimum of $400,000 in eligible real estate. The property has a 3-year holding commitment and the average processing time is 4 to 8 months from complete file submission. Your spouse and children under 18 can qualify too."},
{k:["minimum","invest","price","cost"], a:"The minimum qualifying investment for Turkish citizenship is $400,000 in eligible property. For an Investor Residence Permit, the threshold is $200,000."},
{k:["live","relocat","move","residency"], a:"No. There is no mandatory relocation requirement, and dual citizenship is permitted under Turkish law."},
{k:["rental guaranteed","guaranteed rent","rental"], a:"Selected properties come with guaranteed rental income. Rental Guaranteed listings start from $117,000."},
{k:["family","spouse","children","wife"], a:"Yes. Your spouse and all legal children under 18 are included in the same citizenship application at no additional investment cost."},
{k:["tax","tapu","title deed","fee"], a:"The Title Deed Transfer Tax (Tapu Harcı) is 4% of the declared value, typically split 2% buyer / 2% seller. Annual property tax is 0.1% to 0.2% for residential property (0.2% to 0.4% in metropolitan areas like Istanbul)."},
{k:["start","begin","how do i"], a:"Tap the WhatsApp button or call +90 553 163 3074. Tell us your budget and what you are looking for, and we will send matching properties with a private consultation."},
{k:["rent out","rent my"], a:"Yes. You retain full rental rights and can earn rental yield in foreign currency or TRY throughout the mandatory 3-year holding period."},
{k:["combine","multiple propert"], a:"Yes. You can combine multiple properties across Turkey, provided the total appraised value meets or exceeds $400,000 USD and all applications are processed together."},
{k:["dual"], a:"Yes. Turkish law fully recognizes dual and multiple citizenship. Please also check whether your home country permits dual citizenship."},
{k:["time","long","months","process"], a:"The average processing time is 4 to 8 months from complete file submission. The government security background review inside that process takes approximately 6 to 10 months."},
{k:["bed","bedroom"], a:"Listings range from 1+0 studios to 6+ bedroom villas. Use the filters on the Buy Properties page to narrow by bedrooms, or tell me a budget and I will point you to matching homes."},
{k:["location","district","where","istanbul","antalya","izmir","bodrum","area","city"], a:"We list across Istanbul (Şişli, Beşiktaş, Beyoğlu, Sarıyer, Kağıthane, Kadıköy, Üsküdar, Ataşehir, Bakırköy, Başakşehir), Antalya, Izmir, Bodrum and more. Tell me a city or district and I will point you to matching homes."},
{k:["eligib","qualif"], a:"Any eligible property priced at $400,000 or above qualifies for Citizenship by Investment. Properties at $200,000 or above qualify for an Investor Residence Permit. Look for the gold 'Citizenship Qualified' badge on listings."},
{k:["how to buy","buying process","power of attorney","poa"], a:"The purchase process: 1) Choose a property with us, 2) Reserve and sign a sales contract, 3) Get your Turkish tax number and open a bank account, 4) Transfer funds and sign at the Land Registry (Tapu) office, 5) Receive your title deed. We handle every step with you — the full guide is on the Buyer's Guide page."},
{k:["agent","human","sales","talk to","speak to","call"], a:"Of course — I will connect you with our sales team on WhatsApp.", handover:true},
{k:["hello","hi","salam","hey"], a:"Hello — I am Azad's assistant. Ask me about citizenship, prices, property types, or how to start. For anything else, I can connect you to the team on WhatsApp."},
];
var chatStage = "idle", leadName = "", leadInterest = "";
var chatBox = document.getElementById("chat-box"), chatLog = document.getElementById("chat-log");
function chatT(key, fallback){
  var L = window.__azadLang, D = window.I18N && window.I18N.chat;
  if (L && D && D[L] && D[L][key]) return D[L][key];
  if (D && D.en && D.en[key]) return D.en[key];
  return fallback;
}
function chatAdd(cls, html){ if (!chatLog) return; chatLog.innerHTML += '<div class="msg ' + cls + '">' + html + '</div>'; chatLog.scrollTop = chatLog.scrollHeight; }
function chatAskName(){
  chatAdd("bot", esc(chatT("askName", "May I take your name, so our sales agent knows who is asking?")));
  chatStage = "askName";
}
function chatAskInterest(){
  chatAdd("bot", esc(chatT("askInterest", "Thank you" + (leadName ? ", " + leadName : "") + ". What are you looking for — a city or district, property type, and budget?")));
  chatStage = "askInterest";
}
function chatHandover(){
  var msg = "Hello Azad Properties, my name is " + (leadName || "-") + ". I am interested in " + (leadInterest || "a property in Türkiye") + ". (Sent via Ask Azad on azadproperties.com)";
  chatAdd("bot", esc(chatT("handover", "Thank you — your enquiry is ready. Tap below to send it to our sales agent on WhatsApp:")) +
    '<br><a class="chat-wa" target="_blank" rel="noopener" href="' + waLink(msg) + '">' + esc(chatT("sendWa", "Send to sales agent on WhatsApp →")) + '</a>');
  chatStage = "done";
}
function chatAnswer(q){
  var s = q.toLowerCase();
  chatAdd("user", esc(q));
  setTimeout(function(){
    if (chatStage === "askName"){ leadName = q.trim().slice(0, 60); chatAskInterest(); return; }
    if (chatStage === "askInterest"){ leadInterest = q.trim().slice(0, 200); chatHandover(); return; }
    var hit = null;
    for (var i=0;i<CHAT.length;i++){ if (CHAT[i].k.some(function(k){ return s.indexOf(k) >= 0; })){ hit = CHAT[i]; break; } }
    if (hit){
      chatAdd("bot", esc(hit.a));
      if (hit.handover){ if (!leadName) chatAskName(); else chatHandover(); return; }
      if (chatStage === "idle"){ chatStage = "asked"; chatAskName(); }
    } else {
      chatAdd("bot", 'Good question — I can answer about citizenship, prices, property types, taxes and how to start. For anything else, <a target="_blank" rel="noopener" href="' + waLink("Hello Azad Properties, " + q) + '">chat with our team on WhatsApp</a>.');
      if (chatStage === "idle"){ chatStage = "asked"; chatAskName(); }
    }
  }, 350);
}
var chatBtn = document.getElementById("chat-btn");
if (chatBtn && chatBox) chatBtn.addEventListener("click", function(){ chatBox.classList.toggle("open"); });
var chatClose = document.getElementById("chat-close");
if (chatClose && chatBox) chatClose.addEventListener("click", function(){ chatBox.classList.remove("open"); });
document.querySelectorAll(".chat-quick").forEach(function(b){ b.addEventListener("click", function(){ chatAnswer(b.textContent.trim()); }); });
var chatForm = document.getElementById("chat-form");
if (chatForm){
  chatForm.addEventListener("submit", function(e){
    e.preventDefault();
    var inp = document.getElementById("chat-input");
    if (inp && inp.value.trim()){ chatAnswer(inp.value.trim()); inp.value = ""; }
  });
}

/* ---------- enquiry / consultation modal ---------- */
var modalBack = document.getElementById("modal-back"), modalRef = document.getElementById("modal-ref");
function openEnquiry(ref){
  if (modalRef) modalRef.value = ref || "";
  var t = document.getElementById("modal-title");
  if (t) t.textContent = ref ? "Enquire about " + ref : "Book a Free Investment Consultation";
  if (modalBack) modalBack.classList.add("open");
}
window.__openEnquiry = openEnquiry;
document.querySelectorAll("[data-open-enquiry]").forEach(function(b){
  b.addEventListener("click", function(e){ e.preventDefault(); openEnquiry(b.getAttribute("data-open-enquiry") || ""); });
});
var modalClose = document.getElementById("modal-close");
if (modalClose && modalBack) modalClose.addEventListener("click", function(){ modalBack.classList.remove("open"); });
if (modalBack) modalBack.addEventListener("click", function(e){ if (e.target === modalBack) modalBack.classList.remove("open"); });
var enqForm = document.getElementById("enquiry-form");
if (enqForm){
  enqForm.addEventListener("submit", function(e){
    e.preventDefault();
    var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var msg = "Hello Azad Properties, I would like to enquire" +
      (g("modal-ref") ? " about " + g("modal-ref") : "") + "." +
      "\nName: " + (g("enq-name") || "-") +
      "\nEmail: " + (g("enq-email") || "-") +
      "\nPhone: " + (g("enq-phone") || "-") +
      "\nBudget: " + (g("enq-budget") || "-") +
      "\nLocation: " + (g("enq-location") || "-") +
      "\nPurpose: " + (g("enq-purpose") || "-") +
      (g("enq-msg") ? "\nMessage: " + g("enq-msg") : "");
    window.open(waLink(msg), "_blank");
    if (modalBack) modalBack.classList.remove("open");
    toast("Opening WhatsApp — your enquiry is ready to send.");
  });
}

/* ---------- listings: single source of truth = assets/data/listings.json ----------
   The Azad team edits that file via admin.html (add / edit / delete + export).
   An admin preview saved in this browser (localStorage "azad-admin-listings")
   overrides the published file so the team can preview before publishing. */
var LISTINGS = [];
var LISTINGS_LOADED = false, LISTINGS_FAILED = false;
var LOAD_ERR_HTML = '<p class="muted" style="grid-column:1/-1">Listings could not be loaded right now. Please refresh the page, or contact us on WhatsApp and we will help you directly.</p>';
function showPreviewBanner(){
  if (document.getElementById("admin-preview-bar")) return;
  var b = document.createElement("div");
  b.id = "admin-preview-bar";
  b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#0f0f0f;color:#fff;font:14px/1.4 system-ui;padding:10px 14px;text-align:center;border-bottom:2px solid #d4af37";
  b.innerHTML = 'Previewing <b>unpublished</b> listing changes saved in this browser (admin preview). <button id="admin-preview-clear" style="margin-left:10px;background:#d4af37;border:0;padding:4px 12px;border-radius:4px;cursor:pointer;font-weight:700">Clear preview</button>';
  document.body.appendChild(b);
  document.getElementById("admin-preview-clear").addEventListener("click", function(){
    try { localStorage.removeItem("azad-admin-listings"); } catch(e){}
    window.location.reload();
  });
}
function loadListings(){
  ["featured-grid","recent-grid","all-grid"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.innerHTML = '<p class="muted" style="grid-column:1/-1">Loading properties&hellip;</p>';
  });
  var done = function(list, failed){
    LISTINGS = list || []; LISTINGS_LOADED = true; LISTINGS_FAILED = !!failed;
    initListingViews();
  };
  try {
    var ov = JSON.parse(localStorage.getItem("azad-admin-listings") || "null");
    if (ov && ov.listings && ov.listings.length){ showPreviewBanner(); done(ov.listings); return; }
  } catch(e){}
  fetch("assets/data/listings.json").then(function(r){
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function(j){ done(j.listings || j); }).catch(function(){ done([], true); });
}
function initListingViews(){
/* home: featured + recently added grids */
var feat = document.getElementById("featured-grid");
if (feat){
  if (LISTINGS_FAILED){ feat.innerHTML = LOAD_ERR_HTML; }
  else {
    var list = FEATURED.map(function(r){ return LISTINGS.find(function(l){ return l.ref === r; }); }).filter(Boolean);
    window.__renderCurrent = function(){ renderInto(feat, list); };
    renderInto(feat, list);
  }
}
var recent = document.getElementById("recent-grid");
if (recent){
  if (LISTINGS_FAILED){ recent.innerHTML = LOAD_ERR_HTML; }
  else {
    var rlist = LISTINGS.slice(-6).reverse();
    var renderRecent = function(){ renderInto(recent, rlist); };
    var prevRender = window.__renderCurrent;
    window.__renderCurrent = function(){ if (prevRender) prevRender(); renderRecent(); };
    renderRecent();
  }
}

/* ---------- properties page: filters ---------- */
var grid = document.getElementById("all-grid"), countEl = document.getElementById("prop-count");
/* Bedroom range from the Turkish layout notation (e.g. "1+1 to 3+1" -> 1..3).
   Layout is the source of truth; the old beds/baths numbers were unreliable.
   Returns [min,max] or null when the listing has no bedroom count. */
function bedRange(l){
  if (l.bedsMin != null && l.bedsMax != null) return [l.bedsMin, l.bedsMax];
  var m = String(l.layout || "").match(/(\d+)\s*\+\s*\d+/g);
  if (m && m.length){
    var ns = m.map(function(x){ return parseInt(x, 10); });
    return [Math.min.apply(null, ns), Math.max.apply(null, ns)];
  }
  if ((l.type === "Apartment" || l.type === "Villa" || l.type === "Hotel") && l.beds > 0 && l.beds <= 8) return [l.beds, l.beds];
  return null;
}
function currentFilters(){
  var g = function(id){ var el = document.getElementById(id); return el ? el.value : ""; };
  var tags = [];
  document.querySelectorAll("[data-tag]:checked").forEach(function(c){ tags.push(c.getAttribute("data-tag")); });
  var savedEl = document.getElementById("f-saved");
  return { q: (g("f-q")||"").toLowerCase(), city: g("f-city"), district: g("f-district"), type: g("f-type"),
    bracket: g("f-price"), rooms: g("f-rooms"), tags: tags, elig: g("f-elig"),
    savedOnly: !!(savedEl && savedEl.checked) };
}
/* Price bracket (USD). A listing matches a band when its price — or its price
   RANGE — OVERLAPS the band: e.g. a $338k–$514k project shows in both the
   $200–400k and the $400–600k bands. Single-price listings behave as before.
   A trailing "+" on a range ("$560,000+") is shown in the price text, but the
   filter uses the stated max — a $185k–$285k+ project does not belong in $1M+.
   Unpriced listings ("Price on request") never match a band. */
function inBracket(l, b){
  if (!b) return true;
  var lo = l.priceMin != null ? l.priceMin : l.price;
  var hi = l.priceMax != null ? l.priceMax : l.price;
  if (lo == null) return false;
  if (b === "0-100") return lo < 100000;
  if (b === "100-200") return lo < 200000 && hi >= 100000;
  if (b === "200-400") return lo < 400000 && hi >= 200000;
  if (b === "400-600") return lo < 600000 && hi >= 400000;
  if (b === "600-1000") return lo < 1000000 && hi >= 600000;
  if (b === "1000+") return hi >= 1000000;
  return true;
}
function applyFilters(){
  if (!grid || !LISTINGS_LOADED) return;
  if (LISTINGS_FAILED){ grid.innerHTML = LOAD_ERR_HTML; if (countEl) countEl.textContent = ""; return; }
  var f = currentFilters();
  var list = LISTINGS.filter(function(l){
    if (f.q && (l.name + " " + l.district + " " + l.ref + " " + l.type).toLowerCase().indexOf(f.q) < 0) return false;
    if (f.city && l.city !== f.city) return false;
    if (f.district && l.district !== f.district) return false;
    if (f.savedOnly && !isFav(l.ref)) return false;
    if (f.type && l.type !== f.type) return false;
    if (f.bracket && !inBracket(l, f.bracket)) return false;
    if (f.elig === "cit" && !l.eligCit) return false;
    if (f.elig === "res" && !l.eligRes) return false;
    if (f.rooms){ var need = parseInt(f.rooms, 10); var br = bedRange(l); if (!br || need < br[0] || need > br[1]) return false; }
    if (f.tags.length){ for (var i=0;i<f.tags.length;i++){ if (!l.tags || l.tags.indexOf(f.tags[i]) < 0) return false; } }
    return true;
  });
  renderInto(grid, list);
  if (countEl) countEl.textContent = (window.__t ? window.__t("prop.count") : "{n} of {m} properties").replace("{n}", list.length).replace("{m}", LISTINGS.length);
  /* eligibility totals (full set, shown next to the filter) */
  var ec = document.getElementById("elig-counts");
  if (ec){
    var nc = 0, nr = 0;
    LISTINGS.forEach(function(x){ if (x.eligCit) nc++; if (x.eligRes) nr++; });
    ec.textContent = nc + " citizenship-eligible · " + nr + " residence-eligible";
  }
}
if (grid){
  ["f-q","f-city","f-district","f-type","f-price","f-rooms","f-elig"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener(el.tagName === "INPUT" ? "input" : "change", applyFilters);
  });
  document.querySelectorAll("[data-tag]").forEach(function(c){ c.addEventListener("change", applyFilters); });
  var savedChk = document.getElementById("f-saved");
  if (savedChk) savedChk.addEventListener("change", applyFilters);
  var clearBtn = document.getElementById("f-clear");
  if (clearBtn) clearBtn.addEventListener("click", function(){
    ["f-q","f-city","f-district","f-type","f-price","f-rooms","f-elig"].forEach(function(id){
      var el = document.getElementById(id); if (el) el.value = "";
    });
    document.querySelectorAll("[data-tag]").forEach(function(c){ c.checked = false; });
    if (savedChk) savedChk.checked = false;
    applyFilters();
  });
  window.__renderCurrent = applyFilters;
  /* pre-fill from home search / region links (?q= &type= &price= &city= &district=) */
  try {
    var params = new URLSearchParams(window.location.search);
    var set = function(id, v){ var el = document.getElementById(id); if (el && v) el.value = v; };
    set("f-q", params.get("q")); set("f-type", params.get("type")); set("f-price", params.get("price")); set("f-district", params.get("district")); set("f-city", params.get("city"));
  } catch(e){}
  applyFilters();
}
}
loadListings();
updateFavCount();

/* ---------- testimonials render (home page; real reviews only) ---------- */
var testiWrap = document.getElementById("testi-grid");
if (testiWrap && typeof TESTIMONIALS !== "undefined"){
  testiWrap.innerHTML = TESTIMONIALS.map(function(r){
    var stars = "★★★★★".slice(0, r.s);
    return '<div class="testi"><div class="testi-stars">' + stars + '</div><p>“' + esc(r.t) + '”</p><div class="testi-who"><b>' + esc(r.n) + '</b><span>via ' + esc(r.src) + '</span></div></div>';
  }).join("");
}

/* ---------- FAQ render (guide page; language-aware) ---------- */
function getFaqs(){
  var L = (window.__azadLang && window.I18N && window.I18N.faq && window.I18N.faq[window.__azadLang]) || null;
  return L || (typeof FAQS !== "undefined" ? FAQS : []);
}
function renderFaqs(){
  var faqWrap = document.getElementById("faq-list");
  if (faqWrap) renderFaqInto(faqWrap, getFaqs());
  var teaser = document.getElementById("faq-teaser");
  if (teaser) renderFaqInto(teaser, getFaqs().slice(0, 3));
}
function renderFaqInto(wrap, list){
  wrap.innerHTML = list.map(function(f){
    return '<div class="faq-item"><button class="faq-q">' + esc(f.q) + '<span>+</span></button><div class="faq-a">' + esc(f.a) + '</div></div>';
  }).join("");
  wrap.querySelectorAll(".faq-q").forEach(function(q){
    q.addEventListener("click", function(){
      var item = q.parentElement, wasOpen = item.classList.contains("open");
      wrap.querySelectorAll(".faq-item").forEach(function(i){ i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });
}
renderFaqs();

/* ---------- team render (about page; roles translated, bios in English) ---------- */
function renderTeam(){
  var teamWrap = document.getElementById("team-grid");
  if (!teamWrap || typeof TEAM === "undefined") return;
  var roles = (window.__azadLang && window.I18N && window.I18N.teamRoles && window.I18N.teamRoles[window.__azadLang]) || null;
  teamWrap.innerHTML = TEAM.map(function(m, i){
    var ini = m.n.split(" ").map(function(w){ return w.charAt(0); }).slice(0,2).join("");
    var role = roles ? roles[i] : m.r;
    var av = m.photo ? '<img class="avatar-img" src="' + esc(m.photo) + '" alt="' + esc(m.n) + '">' : '<div class="avatar">' + esc(ini) + '</div>';
    return '<div class="member">' + av + '<div><h3>' + esc(m.n) + '</h3><div class="role">' + esc(role) + '</div><p>' + esc(m.d) + '</p>' +
      (m.wa ? '<a class="wa" target="_blank" rel="noopener" href="' + waLink("Hello " + m.n + ", I would like to speak with you about a property in Türkiye.") + '">Message on WhatsApp →</a>' : '') +
      '</div></div>';
  }).join("");
}
renderTeam();

/* ---------- ecosystem render ---------- */
var ecoWrap = document.getElementById("eco-grid");
if (ecoWrap && typeof ECOSYSTEM !== "undefined"){
  ecoWrap.innerHTML = ECOSYSTEM.map(function(e){
    return '<div class="eco" style="--accent:' + e.c + '"><h3>' + esc(e.n) + '</h3><div class="eco-domain">' + esc(e.d) + '</div><p>' + esc(e.s) + '</p></div>';
  }).join("");
}

/* ---------- CBI steps render (language-aware: titles + summaries translated) ---------- */
function getSteps(){
  var L = (window.__azadLang && window.I18N && window.I18N.steps && window.I18N.steps[window.__azadLang]) || null;
  return L || (typeof CBI_STEPS !== "undefined" ? CBI_STEPS : []);
}
function renderSteps(){
  var stepsWrap = document.getElementById("cbi-steps");
  if (!stepsWrap) return;
  stepsWrap.innerHTML = getSteps().map(function(p){
    return '<div class="phase"><h3>' + esc(p.phase) + '</h3><div class="phase-meta">' + esc(p.meta) + '</div><ol class="steps">' +
      p.steps.map(function(s){ return '<li><b>' + esc(s.t) + '</b><br>' + esc(s.d) + '</li>'; }).join("") + '</ol></div>';
  }).join("");
}
renderSteps();

window.__rerenderDynamic = function(){ renderFaqs(); renderTeam(); renderSteps(); if (window.__renderCurrent) window.__renderCurrent(); };

/* ---------- contact page form (opens WhatsApp) ---------- */
var contactForm = document.getElementById("contact-form");
if (contactForm){
  contactForm.addEventListener("submit", function(e){
    e.preventDefault();
    var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var msg = "Hello Azad Properties, I would like to get in touch." +
      "\nName: " + (g("ct-name") || "-") +
      "\nEmail: " + (g("ct-email") || "-") +
      "\nPhone: " + (g("ct-phone") || "-") +
      (g("ct-msg") ? "\nMessage: " + g("ct-msg") : "");
    window.open(waLink(msg), "_blank");
    toast("Opening WhatsApp — your message is ready to send.");
  });
}

applyCurrency();
})();
