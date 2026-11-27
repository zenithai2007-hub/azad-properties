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
  var ALL = [], current = null;
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
  function renderDetail(l){
    current = l;
    document.title = l.name + " — Azad Properties";
    var waMsg = "Hello Azad Properties, I am interested in " + l.name + " (" + l.ref + ")" + (l.price ? " listed at $" + l.price.toLocaleString("en-US") + " USD" : "") + ".";
    var facts = "";
    facts += fact("Reference", l.ref);
    facts += fact("Type", l.type);
    facts += fact("Location", (l.district || "") + ", " + (l.city || ""));
    facts += fact("Side", l.side ? l.side + " Side" : "");
    facts += fact("Layout", l.layout);
    facts += fact("Bedrooms", l.beds != null ? String(l.beds) : "");
    facts += fact("Bathrooms", l.baths != null ? String(l.baths) : "");
    facts += fact("Area", l.sqm ? l.sqm.toLocaleString("en-US") + " sqm" : "");
    facts += fact("Units", l.units);
    facts += fact("Status", l.status);
    var tags = (l.tags || []).map(function(t){ return '<span class="pill">' + window.AZAD.esc(t) + '</span>'; }).join("");
    wrap.innerHTML =
      '<div class="detail">' +
        '<div class="detail-img">' +
          (l.img ? '<img src="' + window.AZAD.esc(l.img) + '" alt="' + window.AZAD.esc(l.name) + '">' : SKY_SVG) +
          '<span class="card-cat">' + window.AZAD.esc(l.type) + '</span>' + badge(l) +
        '</div>' +
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
      '</div>';
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
