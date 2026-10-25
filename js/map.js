/* Lift Easy: map of the areas Steve covers (Areas page).
 *
 * Draws North Yorkshire, Teesside and County Durham from official ONS council
 * boundaries (assets/map/areas.geojson), with Steve's base in Northallerton.
 * The map uses MapLibre (open source) and OpenFreeMap tiles: no API key, no
 * account and no usage limits, so it can never be billed. The library only
 * loads once the map is about to scroll into view. If it can't load (offline,
 * no WebGL, tiles down), the design's drawn map stays in place.
 */
(function () {
  'use strict';
  var LIB = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl';
  var LIB_JS_SRI = 'sha384-SYKAG6cglRMN0RVvhNeBY0r3FYKNOJtznwA0v7B5Vp9tr31xAHsZC0DqkQ/pZDmj';
  var LIB_CSS_SRI = 'sha384-MinO0mNliZ3vwppuPOUnGa+iq619pfMhLVUXfC4LHwSCvF9H+6P/KO4Q7qBOYV5V';
  var TILES = 'https://tiles.openfreemap.org/styles/positron';

  var LE = window.LE = window.LE || { hooks: {} };
  var AREAS = ['north-yorkshire', 'teesside', 'county-durham'];   // same order as the design's region buttons
  var BASE = { lng: -1.4339, lat: 54.3389, name: 'Northallerton' };
  var LABEL_AT = {   // where each area's name sits, so the three don't overlap
    'north-yorkshire': [-1.45, 54.05],
    'teesside': [-1.15, 54.6],
    'county-durham': [-1.85, 54.72]
  };
  var RED = '#D7141A';

  var libPromise = null, geojson = null, bounds = null;

  function loadLib() {
    if (window.maplibregl) return Promise.resolve();
    if (libPromise) return libPromise;
    libPromise = new Promise(function (resolve, reject) {
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = LIB + '.css'; css.integrity = LIB_CSS_SRI; css.crossOrigin = 'anonymous';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = LIB + '.js'; s.integrity = LIB_JS_SRI; s.crossOrigin = 'anonymous'; s.async = true;
      s.onload = function () { window.maplibregl ? resolve() : reject(new Error('maplibre missing')); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return libPromise;
  }
  function loadAreas() {
    if (geojson) return Promise.resolve(geojson);
    return fetch('assets/map/areas.geojson').then(function (r) { return r.json(); }).then(function (g) {
      geojson = g;
      var w = 180, s = 90, e = -180, n = -90;
      g.features.forEach(function (f) {
        var rings = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        rings.forEach(function (p) { p[0].forEach(function (c) { w = Math.min(w, c[0]); e = Math.max(e, c[0]); s = Math.min(s, c[1]); n = Math.max(n, c[1]); }); });
      });
      bounds = [[w, s], [e, n]];
      return g;
    });
  }

  function tag(text, dark) {
    var el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'white-space:nowrap;pointer-events:none;font:800 13px Archivo,system-ui,sans-serif;padding:6px 9px;' +
      (dark ? 'background:#111111;color:#ffffff;' : 'background:#ffffff;color:#111111;border:2px solid #111111;');
    return el;
  }
  function pin() {
    var el = document.createElement('div');
    el.title = 'Steve is based in ' + BASE.name;
    el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:' + RED + ';border:3px solid #ffffff;box-shadow:0 0 0 1px #111111';
    return el;
  }

  /* One map in an element. opts.selected: index of the highlighted area (-1 none),
   * opts.onPick(i): called when someone taps an area. Returns a handle. */
  function build(el, opts) {
    var entry = { el: el, selected: opts.selected == null ? -1 : opts.selected, map: null, ready: false };
    var map = entry.map = new maplibregl.Map({
      container: el, style: TILES, bounds: bounds, fitBoundsOptions: { padding: 24 },
      attributionControl: { compact: true }, cooperativeGestures: true,
      dragRotate: false, pitchWithRotate: false, touchPitch: false
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('error', function (e) { if (!entry.ready) fail(entry, e); });
    map.on('load', function () {
      entry.ready = true;
      map.addSource('areas', { type: 'geojson', data: geojson });
      map.addLayer({ id: 'areas-fill', type: 'fill', source: 'areas', paint: { 'fill-color': RED, 'fill-opacity': opacity(entry.selected) } });
      map.addLayer({ id: 'areas-line', type: 'line', source: 'areas', paint: { 'line-color': RED, 'line-width': width(entry.selected) } });
      AREAS.forEach(function (id) {
        var f = geojson.features.filter(function (x) { return x.properties.id === id; })[0];
        new maplibregl.Marker({ element: tag(f.properties.name, false) }).setLngLat(LABEL_AT[id]).addTo(map);
      });
      new maplibregl.Marker({ element: pin() }).setLngLat([BASE.lng, BASE.lat]).addTo(map);
      new maplibregl.Marker({ element: tag('Steve · ' + BASE.name, true), offset: [0, 24] }).setLngLat([BASE.lng, BASE.lat]).addTo(map);
      map.on('click', 'areas-fill', function (e) {
        var i = AREAS.indexOf(e.features[0].properties.id);
        select(entry, i);
        if (opts.onPick) opts.onPick(i);
      });
      map.on('mouseenter', 'areas-fill', function () { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'areas-fill', function () { map.getCanvas().style.cursor = ''; });
      document.documentElement.classList.add('le-map-ready');
    });
    // Keep the whole area in view when the box changes size or moves
    if (window.ResizeObserver) new ResizeObserver(function () { map.resize(); map.fitBounds(bounds, { padding: 24, duration: 0 }); }).observe(el);
    return entry;
  }
  function opacity(sel) { return ['case', ['==', ['get', 'id'], AREAS[sel] || ''], 0.38, 0.16]; }
  function width(sel) { return ['case', ['==', ['get', 'id'], AREAS[sel] || ''], 3, 1.6]; }
  function select(entry, i) {
    if (entry.selected === i) return;
    entry.selected = i;
    if (!entry.ready) return;
    entry.map.setPaintProperty('areas-fill', 'fill-opacity', opacity(i));
    entry.map.setPaintProperty('areas-line', 'line-width', width(i));
  }
  function fail(entry) {
    try { entry.map.remove(); } catch (e) { /* already gone */ }
    if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
    entry.dead = true;
  }

  function mapBox() {
    var el = document.createElement('div');
    el.className = 'le-map';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Map of the areas Steve covers: North Yorkshire, Teesside and County Durham');
    return el;
  }
  // Load everything once the slot is near the screen, then make the map
  function whenNear(el, go) {
    if (!window.IntersectionObserver) return go();
    var io = new IntersectionObserver(function (ents) {
      if (ents.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { rootMargin: '400px' });
    io.observe(el);
  }
  function start(el, make) {
    whenNear(el, function () {
      Promise.all([loadLib(), loadAreas()]).then(make).catch(function () { /* the design's drawn map stays */ });
    });
  }

  /* Desktop: the map fills the design's map frame */
  var desktopEntry = null;
  function desktop() {
    if (desktopEntry || !window.matchMedia('(min-width: 601px)').matches) return;
    var frame = document.querySelector('.view-d [data-map-frame]');
    if (!frame) return;
    desktopEntry = {};
    start(frame, function () {
      var el = mapBox(); frame.appendChild(el);
      desktopEntry = build(el, { selected: -1 });
    });
  }

  /* Phone: the design re-renders this section when a region is picked, so the
   * map element is kept here and put back into its slot after each render. */
  var phoneEntry = null, phoneComp = null;
  LE.hooks.phone = {
    after: function (comp, root) {
      phoneComp = comp;
      if (!phoneEntry || !phoneEntry.el || phoneEntry.dead) return;
      var host = root.querySelector('[data-map-host]');
      if (host && phoneEntry.el.parentNode !== host) host.appendChild(phoneEntry.el);
      select(phoneEntry, comp.state.region);
    }
  };
  function phone() {
    if (phoneEntry || !LE.phone) return;
    var host = LE.phone.root.querySelector('[data-map-host]');
    if (!host) return;
    phoneEntry = {};
    start(host, function () {
      var el = mapBox();
      (LE.phone.root.querySelector('[data-map-host]') || host).appendChild(el);
      phoneEntry = build(el, {
        selected: phoneComp ? phoneComp.state.region : 0,
        onPick: function (i) { if (phoneComp && i >= 0) phoneComp.setState({ region: i }); }
      });
    });
  }

  function init() {
    desktop(); phone();
    // A layout that appears later (window resized across the breakpoint) gets its map then
    var mq = window.matchMedia('(max-width: 600px)');
    var later = function () { setTimeout(function () { desktop(); phone(); }, 0); };
    if (mq.addEventListener) mq.addEventListener('change', later); else mq.addListener(later);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
