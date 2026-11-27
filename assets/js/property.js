/* Azad Properties — property detail page (?ref=APH-xxxxx) */
(function(){
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var ref = (params.get("ref") || "").trim();
  var wrap = document.getElementById("detail");
  var simWrap = document.getElementById("similar-wrap");
  var simGrid = document.getElementById("similar-grid");
  if (!wrap) return;
  var SKY_SVG = '<svg viewBox="0 0 120 40" class="sky" aria-hidden="true"><path d="M6 40V18h10v22M20 40V8h12v32M36 40V22h10v18M50 40V4h12v36M66 40V16h10v24M80 40V10h12v30M96 40V20h10v20M110 40V26h6v14" fill="rgba(255,255,255,.28)"/></svg>';
  var ALL = [], current = null, galList = [], galIdx = 0;

  /* Approximate district centres (Istanbul). District-level pin only — no
     exact street coordinates exist in the data. */
  var DISTRICT_LATLNG = {
    "Istanbul": [41.0082, 28.9784], "Fatih": [41.0100, 28.9500],
    "Beyoğlu": [41.0367, 28.9769], "Taksim": [41.0370, 28.9850],
    "Şişli": [41.0602, 28.9875], "Bomonti": [41.0560, 28.9850],
    "Nişantaşı": [41.0470, 28.9930], "Beşiktaş": [41.0422, 29.0067],
    "Levent": [41.1090, 29.0150], "Maslak": [41.1106, 29.0219],
    "Sarıyer": [41.1650, 29.0550], "Kağıthane": [41.0830, 28.9750],
    "Eyüp": [41.0477, 28.9327], "Topkapı": [41.0190, 28.9270],
    "Zeytinburnu": [40.9857, 28.9090], "Bakırköy": [40.9800, 28.8740],
    "Florya": [40.9850, 28.7910], "Küçükçekmece": [41.0040, 28.7900],
    "Sefaköy": [41.0050, 28.8010], "Güneşli": [41.0340, 28.8360],
    "Esenyurt": [41.0343, 28.6807], "Bahçeşehir": [41.0320, 28.6660],
    "Beylikdüzü": [41.0050, 28.6400], "Büyükçekmece": [41.0214, 28.5770],
    "Kadıköy": [40.9903, 29.0270], "Erenköy": [40.9680, 29.0800],
    "Bostancı": [40.9600, 29.0950], "Ataşehir": [40.9927, 29.1240],
    "Maltepe": [40.9364, 29.1320], "Kartal": [40.9073, 29.1890],
    "Çekmeköy": [41.0260, 29.1800]
  };

  function notFound(msg){
    wrap.innerHTML = '<div class="empty"><h3>Property not found</h3><p>' + msg + '</p><p class="mt"><a class="btn dark small" href="properties.html">Browse all properties →</a></p></div>';
    if (simWrap) simWrap.style.display = "none";
  }
  function badge(l){
    if (l.tags && l.tags.indexOf("New Development") >= 0) return '<span class="card-badge dev">New Development</span>';
    if (l.price != null && l.price >= 400000) return '<span class="card-badge cbi">Citizenship Qualified</span>';
    if (l.price != null && l.price >= 200000) return '<span class="card-badge res">Residence Permit Qualified</span>';
    return "";
  }
  function fact(label, val){
    if (val == null || val === "") return "";
    return '<div><span>' + label + '</span><b>' + window.AZAD.esc(val) + '</b></div>';
  }
  /* Bedroom range from layout notation ("1+1 to 3+1" -> "1–3"), fallback to beds. */
  function bedText(l){
    var mn = null, mx = null;
    if (l.bedsMin != null && l.bedsMax != null){ mn = l.bedsMin; mx = l.bedsMax; }
    else {
      var m = String(l.layout || "").match(/(\d+)\s*\+\s*\d+/g);
      if (m && m.length){
        var ns = m.map(function(x){ return parseInt(x, 10); });
        mn = Math.min.apply(null, ns); mx = Math.max.apply(null, ns);
      } else if (l.beds > 0 && l.beds <= 8){ mn = mx = l.beds; }
    }
    if (mn == null) return "";
    return mn === mx ? String(mn) : mn + "–" + mx;
  }
  function photosOf(l){
    if (l.photos && l.photos.length) return l.photos.slice();
    if (l.img) return [l.img];
    return [];
  }
  function galShow(i){
    if (!galList.length) return;
    galIdx = (i + galList.length) % galList.length;
    var main = document.getElementById("gal-main");
    if (main) main.src = galList[galIdx];
    var cnt = document.getElementById("gal-count");
    if (cnt) cnt.textContent = (galIdx + 1) + " / " + galList.length;
    var ths = document.querySelectorAll(".gal-thumb");
    for (var t = 0; t < ths.length; t++){
      ths[t].classList.toggle("on", parseInt(ths[t].getAttribute("data-i"), 10) === galIdx);
    }
  }
  window.__galShow = galShow;
  window.__galStep = function(d){ galShow(galIdx + d); };

  function initMap(l){
    var box = document.getElementById("prop-map");
    if (!box || !window.L) return; /* Leaflet CDN failed: page still works */
    try {
      var ll = DISTRICT_LATLNG[l.district] || DISTRICT_LATLNG["Istanbul"];
      var zoom = (l.district === "Istanbul") ? 10 : 12;
      var map = window.L.map("prop-map", { scrollWheelZoom: false }).setView(ll, zoom);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: "© OpenStreetMap contributors"
      }).addTo(map);
      window.L.marker(ll).addTo(map)
        .bindPopup(window.AZAD.esc(l.district) + ", " + window.AZAD.esc(l.city || "Istanbul")).openPopup();
      setTimeout(function(){ map.invalidateSize(); }, 50);
    } catch (e) { /* map is a bonus: never break the page */ }
  }

  function renderDetail(l){
    current = l;
    document.title = l.name + " — Azad Properties";
    var waMsg = "Hello Azad Properties, I am interested in " + l.name + " (" + l.ref + ")" + (l.price ? " listed at $" + l.price.toLocaleString("en-US") + " USD" : "") + ".";
    var facts = "";
    facts += fact("Reference", l.ref);
    facts += fact("Type", l.type);
    facts += fact("Location", (l.district || "") + ", " + (l.city || ""));
    facts += fact("Side", l.side ? l.side + " Side" : "");
    facts += fact("Area", l.sqm ? l.sqm.toLocaleString("en-US") + " sqm" : "");
    facts += fact("Units", l.units);
    facts += fact("Status", l.status);
    /* Layouts & pricing block — only fields that exist in the data */
    var lp = "";
    lp += fact("Layout", l.layout);
    lp += fact("Bedrooms", bedText(l));
    lp += fact("Price", l.price != null ? "$" + l.price.toLocaleString("en-US") : "Price on request");
    lp += fact("Area", l.sqm ? l.sqm.toLocaleString("en-US") + " sqm" : "");
    lp += fact("Units", l.units);
    lp += fact("Status", l.status);
    lp += fact("Location", (l.district || "") + ", " + (l.city || ""));
    var tags = (l.tags || []).map(function(t){ return '<span class="pill">' + window.AZAD.esc(t) + '</span>'; }).join("");
    galList = photosOf(l); galIdx = 0;
    var gallery = "";
    if (galList.length){
      var thumbs = galList.map(function(src, i){
        return '<img class="gal-thumb' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" src="' + window.AZAD.esc(src) + '" alt="' + window.AZAD.esc(l.name) + ' photo ' + (i + 1) + '" onclick="window.__galShow(' + i + ')">';
      }).join("");
      gallery =
        '<div class="detail-img">' +
          '<img id="gal-main" src="' + window.AZAD.esc(galList[0]) + '" alt="' + window.AZAD.esc(l.name) + '">' +
          '<span class="card-cat">' + window.AZAD.esc(l.type) + '</span>' + badge(l) +
          (galList.length > 1
            ? '<button class="gal-arrow prev" type="button" aria-label="Previous photo" onclick="window.__galStep(-1)">‹</button>' +
              '<button class="gal-arrow next" type="button" aria-label="Next photo" onclick="window.__galStep(1)">›</button>' +
              '<span class="gal-count" id="gal-count">1 / ' + galList.length + '</span>'
            : '') +
        '</div>' +
        (galList.length > 1 ? '<div class="gal-thumbs">' + thumbs + '</div>' : '');
    } else {
      gallery =
        '<div class="detail-img">' + SKY_SVG +
          '<span class="card-cat">' + window.AZAD.esc(l.type) + '</span>' + badge(l) +
        '</div>';
    }
    wrap.innerHTML =
      '<div class="detail">' +
        '<div>' + gallery + '</div>' +
        '<div>' +
          '<p class="kicker">Ref: ' + window.AZAD.esc(l.ref) + '</p>' +
          '<h2>' + window.AZAD.esc(l.name) + '</h2>' +
          '<p class="lede">' + window.AZAD.esc(l.district) + ', ' + window.AZAD.esc(l.city) + (l.side ? ' · ' + window.AZAD.esc(l.side) + ' Side' : '') + '</p>' +
          window.AZAD.priceHtml(l) +
          '<div class="detail-facts">' + facts + '</div>' +
          (l.d ? '<p>' + window.AZAD.esc(l.d) + '</p>' : '') +
          (l.note ? '<p class="muted">' + window.AZAD.esc(l.note) + '</p>' : '') +
          (tags ? '<div class="detail-tags">' + tags + '</div>' : '') +
          (l.video ? '<a class="video-link" target="_blank" rel="noopener" href="' + window.AZAD.esc(l.video) + '">▶ Video Tour</a>' : '') +
          '<div class="detail-cta">' +
            '<button class="btn dark" type="button" onclick="window.__openEnquiry(\'' + window.AZAD.esc(l.ref) + '\')">Quick Enquire</button>' +
            '<a class="btn ghost" target="_blank" rel="noopener" href="' + window.AZAD.waLink(waMsg) + '">WhatsApp</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (lp ? '<div class="lp-box"><h3>Layouts &amp; pricing</h3><div class="detail-facts">' + lp + '</div>' +
        '<p class="muted">Floor plans and the full price list are shared on enquiry — ask us on WhatsApp and we will send them.</p></div>' : '') +
      '<div class="map-wrap"><h3>Location</h3><div id="prop-map"></div>' +
        '<p class="muted">Map shows the district/area. Exact location shared on request.</p></div>';
    initMap(l);
    var sim = ALL.filter(function(x){ return x.ref !== l.ref && x.district === l.district; })
      .concat(ALL.filter(function(x){ return x.ref !== l.ref && x.district !== l.district && x.type === l.type; }))
      .slice(0, 3);
    if (simGrid && sim.length) window.AZAD.renderInto(simGrid, sim);
    else if (simWrap) simWrap.style.display = "none";
    window.__renderCurrent = function(){ if (current) renderDetail(current); };
  }
  if (!ref){ notFound("No property reference was given."); return; }
  wrap.innerHTML = '<p class="muted">Loading property…</p>';
  function done(list){
    ALL = list || [];
    var l = null;
    for (var i = 0; i < ALL.length; i++){ if (ALL[i].ref === ref){ l = ALL[i]; break; } }
    if (!l){ notFound("We could not find a property with reference " + ref + ". It may have been sold or removed."); return; }
    renderDetail(l);
  }
  try {
    var ov = JSON.parse(localStorage.getItem("azad-admin-listings") || "null");
    if (ov && ov.listings && ov.listings.length){ done(ov.listings); return; }
  } catch(e){}
  fetch("assets/data/listings.json").then(function(r){
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function(j){ done(j.listings || j); }).catch(function(){
    wrap.innerHTML = '<p class="muted">Listings could not be loaded right now. Please refresh the page, or contact us on WhatsApp and we will help you directly.</p>';
  });
})();
