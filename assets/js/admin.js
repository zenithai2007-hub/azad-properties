/* Azad Properties — Listings Manager (admin.html)
   PIN-protected add / edit / delete for the property listings.
   Data source: assets/data/listings.json (single source of truth, also read
   by the public site). Edits are kept in this browser (localStorage) and
   exported as a new listings.json — see the instructions panel in admin.html.
   There is NO server write-back on the static site: publishing = replace the
   file on the server and redeploy (see REPORT.md). */

/* ---- CHANGE THE PIN HERE (and redeploy) ----
   Default PIN: 2012 (the year Azad Properties was established).
   This is a simple gate for a static site, not bank-grade security:
   anyone who can read this file can see the PIN. Real protection comes
   from the Vercel deployment itself (only the team can deploy). */
var ADMIN_PIN = "2012";
var LS_KEY = "azad-admin-listings";
var AUTH_KEY = "azad-admin-auth";
var WA_NUM = "905531633074";

var DIST = ["Ataşehir","Bahçeşehir","Bakırköy","Beylikdüzü","Beyoğlu","Beşiktaş","Bomonti","Bostancı","Büyükçekmece","Erenköy","Esenyurt","Eyüp","Fatih","Florya","Güneşli","Kadıköy","Kartal","Kağıthane","Küçükçekmece","Levent","Maltepe","Maslak","Nişantaşı","Sarıyer","Sefaköy","Taksim","Topkapı","Zeytinburnu","Çekmeköy","Şişli"];
var TYPES = ["Apartment","Building","Commercial","Hotel","Land","Office","Villa"];
var TAGS = ["Citizenship Qualified","Residence Permit Qualified","New Development","Installment Plan Available","Rental Guaranteed","Whole Building","Commercial"];
var EXISTING_PHOTOS = ["assets/img/listings/ak-camlivadi.jpg","assets/img/listings/ak-sisli.jpg","assets/img/listings/bomonti-residences.jpg","assets/img/listings/elite-erenkoy.jpg","assets/img/listings/fitil-2.jpg","assets/img/listings/galata-hocali.jpg","assets/img/listings/lotus-sisli.jpg","assets/img/listings/moda-restaurant.jpg","assets/img/listings/nilgun.jpg","assets/img/listings/nisantasi-tesvikiye.jpg","assets/img/listings/nurol-tower.jpg","assets/img/listings/siper.jpg","assets/img/listings/taksim-360.jpg","assets/img/listings/taksim-cactus.jpg","assets/img/listings/taksim-dolapdere.jpg","assets/img/listings/taksim-kurdela.jpg","assets/img/listings/taksim-nevizade.jpg","assets/img/listings/yeni-levent.jpg"];

var listings = [];
var published = [];
var dirty = 0;
var editingRef = null;

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function money(n){ return n == null ? "Price on request" : "$" + n.toLocaleString("en-US"); }
function todayISO(){ return new Date().toISOString().slice(0, 10); }

function toast(msg){
  var t = $("toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show");
  setTimeout(function(){ t.classList.remove("show"); }, 3200);
}

/* ---------- auth ---------- */
function checkAuth(){
  var ok = false;
  try { ok = sessionStorage.getItem(AUTH_KEY) === "1"; } catch(e){}
  $("login-view").style.display = ok ? "none" : "";
  $("app-view").style.display = ok ? "" : "none";
  if (ok) loadData();
}
$("login-form").addEventListener("submit", function(e){
  e.preventDefault();
  var pin = $("pin").value.trim();
  if (pin === ADMIN_PIN){
    try { sessionStorage.setItem(AUTH_KEY, "1"); } catch(e){}
    $("pin-error").textContent = "";
    checkAuth();
  } else {
    $("pin-error").textContent = "Wrong PIN — please try again.";
    $("pin").select();
  }
});
$("logout-btn").addEventListener("click", function(){
  try { sessionStorage.removeItem(AUTH_KEY); } catch(e){}
  window.location.reload();
});

/* ---------- data load / persist ---------- */
function loadData(){
  var usedOverride = false;
  try {
    var ov = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (ov && ov.listings && ov.listings.length){ listings = ov.listings; usedOverride = true; }
  } catch(e){}
  fetch("assets/data/listings.json").then(function(r){ return r.json(); }).then(function(j){
    published = j.listings || j;
    if (!usedOverride) listings = published.slice();
    renderAll();
    if (usedOverride) toast("Loaded your saved (unpublished) changes.");
  }).catch(function(){
    if (!usedOverride){ $("tbody").innerHTML = '<tr><td colspan="7">Could not load listings.json. Check the file exists at assets/data/listings.json.</td></tr>'; }
    else renderAll();
  });
}
function persist(){
  try { localStorage.setItem(LS_KEY, JSON.stringify({ updated: todayISO(), count: listings.length, listings: listings })); } catch(e){ toast("Could not save in this browser (storage full?)"); }
}
function nextRef(){
  var max = 0;
  listings.forEach(function(l){ var n = parseInt(String(l.ref || "").split("-")[1], 10); if (!isNaN(n) && n > max) max = n; });
  return "APH-" + (max + 1);
}

/* ---------- table ---------- */
function filtered(){
  var q = ($("search").value || "").toLowerCase();
  var t = $("filter-type").value;
  return listings.filter(function(l){
    if (t && l.type !== t) return false;
    if (q && (l.name + " " + l.district + " " + l.ref + " " + (l.type || "")).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }).slice().sort(function(a, b){ return String(a.ref).localeCompare(String(b.ref)); });
}
function renderAll(){
  var list = filtered();
  $("tbody").innerHTML = list.map(function(l){
    var cbi = (l.price != null && l.price >= 400000) ? '<span class="chip cbi">CBI $400k+</span>' : "";
    var res = (l.price != null && l.price >= 200000 && l.price < 400000) ? '<span class="chip res">Residence $200k+</span>' : "";
    return '<tr><td><b>' + esc(l.ref) + '</b></td><td>' + esc(l.name) + '</td><td>' + esc(l.district || "") + '</td><td>' + esc(l.type || "") + '</td><td>' + money(l.price) + ' ' + cbi + res + '</td><td>' + (l.img ? "Yes" : "—") + '</td>' +
      '<td class="row-actions"><button class="btn small" data-edit="' + esc(l.ref) + '">Edit</button> <button class="btn small danger" data-del="' + esc(l.ref) + '">Delete</button></td></tr>';
  }).join("") || '<tr><td colspan="7">No listings match the search.</td></tr>';
  var withPhoto = listings.filter(function(l){ return !!l.img; }).length;
  var cbiN = listings.filter(function(l){ return l.price != null && l.price >= 400000; }).length;
  $("stats").innerHTML = "<b>" + listings.length + "</b> listings &nbsp;·&nbsp; <b>" + withPhoto + "</b> with photos &nbsp;·&nbsp; <b>" + cbiN + "</b> CBI-eligible ($400k+) &nbsp;·&nbsp; <b>" + dirty + "</b> unsaved change" + (dirty === 1 ? "" : "s") + " since last export";
  $("tbody").querySelectorAll("[data-edit]").forEach(function(b){ b.addEventListener("click", function(){ openForm(b.getAttribute("data-edit")); }); });
  $("tbody").querySelectorAll("[data-del]").forEach(function(b){ b.addEventListener("click", function(){ deleteListing(b.getAttribute("data-del")); }); });
}
$("search").addEventListener("input", renderAll);
$("filter-type").addEventListener("change", renderAll);

/* ---------- add / edit form ---------- */
function fillSelects(){
  var d = $("f-district");
  d.innerHTML = DIST.map(function(x){ return '<option>' + x + '</option>'; }).join("");
  var t = $("f-type");
  t.innerHTML = TYPES.map(function(x){ return '<option>' + x + '</option>'; }).join("");
  var ph = $("f-photo-existing");
  ph.innerHTML = '<option value="">— no photo / keep current —</option>' + EXISTING_PHOTOS.map(function(x){ return '<option value="' + x + '">' + x.split("/").pop() + '</option>'; }).join("");
  $("f-tags").innerHTML = TAGS.map(function(x){ return '<label class="tagchk"><input type="checkbox" value="' + esc(x) + '"> ' + esc(x) + '</label>'; }).join("");
}
fillSelects();

function openForm(ref){
  editingRef = ref || null;
  var l = ref ? listings.find(function(x){ return x.ref === ref; }) : null;
  $("form-title").textContent = l ? "Edit listing " + l.ref : "Add new listing";
  $("f-ref").value = l ? l.ref : nextRef();
  $("f-ref").readOnly = !!l;
  $("f-name").value = l ? l.name : "";
  $("f-type").value = l ? (l.type || "Apartment") : "Apartment";
  $("f-district").value = l ? (l.district || "Şişli") : "Şişli";
  $("f-city").value = l ? (l.city || "Istanbul") : "Istanbul";
  $("f-price").value = l && l.price != null ? l.price : "";
  $("f-beds").value = l ? (l.beds || 0) : 0;
  $("f-baths").value = l ? (l.baths || 0) : 0;
  $("f-sqm").value = l ? (l.sqm || "") : "";
  $("f-layout").value = l ? (l.layout || "") : "";
  $("f-units").value = l ? (l.units || "") : "";
  $("f-status").value = l ? (l.status || "") : "";
  $("f-side").value = l ? (l.side || "European") : "European";
  $("f-desc").value = l ? (l.desc || "") : "";
  $("f-img").value = l ? (l.img || "") : "";
  $("f-photo-existing").value = "";
  $("f-photo-file").value = "";
  $("f-photo-note").textContent = "";
  document.querySelectorAll("#f-tags input").forEach(function(c){ c.checked = !!(l && l.tags && l.tags.indexOf(c.value) >= 0); });
  updateCbiHint();
  $("form-view").style.display = "";
  $("form-view").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("add-btn").addEventListener("click", function(){ openForm(null); });
$("form-cancel").addEventListener("click", function(){ $("form-view").style.display = "none"; editingRef = null; });

function updateCbiHint(){
  var p = parseFloat($("f-price").value);
  var el = $("cbi-hint");
  if (!isNaN(p) && p >= 400000) el.textContent = "✓ This listing will show the CBI $400k+ badge.";
  else if (!isNaN(p) && p >= 200000) el.textContent = "This listing will show the Residence $200k+ badge.";
  else el.textContent = "No eligibility badge (price under $200k, or price on request).";
}
$("f-price").addEventListener("input", updateCbiHint);

$("f-photo-existing").addEventListener("change", function(){
  if (this.value){ $("f-img").value = this.value; $("f-photo-note").textContent = "Photo set to an existing site photo."; }
});
$("f-photo-file").addEventListener("change", function(){
  var file = this.files && this.files[0];
  if (!file) return;
  if (file.size > 400 * 1024){
    $("f-photo-note").textContent = "⚠ This photo is " + Math.round(file.size / 1024) + " KB — large photos slow the site. Please use a smaller image (under ~300 KB) or upload it to the site's assets/img/listings/ folder and paste its path instead.";
    return;
  }
  var reader = new FileReader();
  reader.onload = function(){
    $("f-img").value = reader.result;
    $("f-photo-note").textContent = "Photo embedded from your device (" + Math.round(file.size / 1024) + " KB). It will travel inside listings.json when you export.";
  };
  reader.readAsDataURL(file);
});

$("listing-form").addEventListener("submit", function(e){
  e.preventDefault();
  var ref = $("f-ref").value.trim().toUpperCase();
  var name = $("f-name").value.trim();
  if (!ref){ toast("Ref code is required."); return; }
  if (!name){ toast("Property name is required."); return; }
  if (!editingRef && listings.some(function(x){ return x.ref === ref; })){ toast("Ref " + ref + " already exists — pick another."); return; }
  var priceRaw = $("f-price").value.trim();
  var price = priceRaw === "" ? null : parseFloat(priceRaw);
  if (priceRaw !== "" && (isNaN(price) || price < 0)){ toast("Price must be a number (USD) or empty for price on request."); return; }
  var tags = [];
  document.querySelectorAll("#f-tags input:checked").forEach(function(c){ tags.push(c.value); });
  var rec = {
    ref: ref, name: name, type: $("f-type").value, city: $("f-city").value.trim() || "Istanbul",
    district: $("f-district").value, price: price,
    beds: parseInt($("f-beds").value, 10) || 0, baths: parseInt($("f-baths").value, 10) || 0,
    sqm: $("f-sqm").value.trim() === "" ? null : parseFloat($("f-sqm").value),
    layout: $("f-layout").value.trim(), units: $("f-units").value.trim() === "" ? null : parseInt($("f-units").value, 10),
    status: $("f-status").value.trim(), side: $("f-side").value,
    desc: $("f-desc").value.trim(), tags: tags
  };
  var img = $("f-img").value.trim();
  if (img) rec.img = img;
  if (editingRef){
    var i = listings.findIndex(function(x){ return x.ref === editingRef; });
    /* Merge over the existing record — never rebuild it from scratch.
       The form does not cover photos, video, eligibility flags
       (eligCit/eligRes/eligAirbnb) or price ranges (priceMin/priceMax),
       so a plain replace would silently wipe them on every edit. */
    if (i >= 0) listings[i] = Object.assign({}, listings[i], rec);
    toast("Updated " + ref + ".");
  } else {
    listings.push(rec);
    toast("Added " + ref + ".");
  }
  dirty++;
  persist();
  $("form-view").style.display = "none";
  editingRef = null;
  renderAll();
});

function deleteListing(ref){
  var l = listings.find(function(x){ return x.ref === ref; });
  if (!l) return;
  if (!window.confirm("Delete " + l.ref + " — " + l.name + "?\n\nThis removes it from the list. It is NOT live on the website until you export listings.json and re-deploy.")) return;
  listings = listings.filter(function(x){ return x.ref !== ref; });
  dirty++;
  persist();
  renderAll();
  toast("Deleted " + ref + ".");
}

/* ---------- export / import / reset / preview ---------- */
$("export-btn").addEventListener("click", function(){
  var data = { updated: todayISO(), count: listings.length, listings: listings };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "listings.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  dirty = 0; renderAll();
  toast("listings.json downloaded (" + listings.length + " listings). Replace the file on the server and re-deploy to publish.");
});
$("import-btn").addEventListener("click", function(){ $("import-file").click(); });
$("import-file").addEventListener("change", function(){
  var file = this.files && this.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    try {
      var j = JSON.parse(reader.result);
      var arr = j.listings || j;
      if (!Array.isArray(arr) || !arr.length || !arr[0].ref) throw new Error("bad shape");
      if (!window.confirm("Replace the current list with " + arr.length + " listings from " + file.name + "?")) return;
      listings = arr; dirty++;
      persist(); renderAll();
      toast("Imported " + arr.length + " listings from " + file.name + ".");
    } catch(e){ toast("That file is not a valid listings.json."); }
  };
  reader.readAsText(file);
  this.value = "";
});
$("reset-btn").addEventListener("click", function(){
  if (!window.confirm("Discard all unpublished changes and reload the published listings.json?")) return;
  try { localStorage.removeItem(LS_KEY); } catch(e){}
  dirty = 0;
  loadData();
  toast("Reset to the published listings.");
});
$("preview-btn").addEventListener("click", function(){
  persist();
  window.open("index.html", "_blank");
});
$("wa-help").addEventListener("click", function(){
  window.open("https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent("Hi Azad team — I need help with the Listings Manager."), "_blank");
});

checkAuth();
