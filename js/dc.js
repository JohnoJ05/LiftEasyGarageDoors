/* Lift Easy: tiny renderer for the interactive parts of the design.
 *
 * Each interactive view ships as a <template> (the design's own markup, with
 * {{ holes }}, <sc-if> and <sc-for>) plus the design's own Component class.
 * DC.mount() renders the template, wires onClick/onChange/onScroll to the
 * component, and re-renders only the sections whose output changed whenever
 * the component calls setState. Typed field values survive re-renders.
 */
(function () {
  'use strict';

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this.__update) this.__update();
  };
  window.DCLogic = DCLogic;

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(expr, scope) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    var parts = expr.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function text(str, scope) {
    return str.replace(HOLE, function (_, e) { var v = lookup(e, scope); return v == null ? '' : String(v); });
  }
  function child(scope, name, value) { var s = Object.create(scope); s[name] = value; return s; }

  // Render one template node into an array of live nodes.
  function render(node, scope, ctx) {
    if (node.nodeType === 3) return [document.createTextNode(text(node.nodeValue, scope))];
    if (node.nodeType !== 1) return [];
    var tag = node.localName.toLowerCase();
    var out = [], i;
    if (tag === 'sc-if') {
      if (lookup(node.getAttribute('value').replace(WHOLE, '$1'), scope)) out = kids(node, scope, ctx);
      return out;
    }
    if (tag === 'sc-for') {
      var list = lookup(node.getAttribute('list').replace(WHOLE, '$1'), scope) || [];
      var as = node.getAttribute('as') || 'item';
      for (i = 0; i < list.length; i++) out = out.concat(kids(node, child(scope, as, list[i]), ctx));
      return out;
    }
    var el = node.cloneNode(false);
    var attrs = Array.prototype.slice.call(node.attributes);
    for (i = 0; i < attrs.length; i++) {
      var a = attrs[i], name = a.name, val = a.value, m;
      if (/^hint-/.test(name)) { el.removeAttribute(name); continue; }
      if (/^on/i.test(name) && (m = val.match(WHOLE))) {
        el.removeAttribute(name);
        var evt = name.slice(2).toLowerCase(), fn = lookup(m[1], scope);
        if (evt === 'scroll') { ctx.onScroll = fn; continue; }
        if (typeof fn === 'function') el.addEventListener(evt, fn);
        continue;
      }
      if (val.indexOf('{{') !== -1) el.setAttribute(name, text(val, scope));
    }
    var c = kids(node, scope, ctx);
    for (i = 0; i < c.length; i++) el.appendChild(c[i]);
    return [el];
  }
  function kids(node, scope, ctx) {
    var src = node.content || node, out = [];
    for (var n = src.firstChild; n; n = n.nextSibling) out = out.concat(render(n, scope, ctx));
    return out;
  }
  function html(nodes) {
    var s = '';
    for (var i = 0; i < nodes.length; i++) s += nodes[i].nodeType === 1 ? nodes[i].outerHTML : nodes[i].nodeValue;
    return s;
  }
  function pathTo(el, roots) {
    for (var r = 0; r < roots.length; r++) {
      if (!roots[r].contains || !roots[r].contains(el)) continue;
      var p = [];
      for (var n = el; n !== roots[r]; n = n.parentNode) p.unshift(Array.prototype.indexOf.call(n.parentNode.childNodes, n));
      return [r].concat(p);
    }
    return null;
  }
  function fromPath(p, roots) {
    var n = roots[p[0]];
    for (var i = 1; n && i < p.length; i++) n = n.childNodes[p[i]];
    return n;
  }

  /* Mount: host is where the view goes, tpl the <template>, Comp the class.
   * Regions are the template root's children, and the children of any plain
   * wrapper div inside it (the design's scroll container), so a state change
   * only replaces the sections it actually affects. */
  function mount(host, tpl, Comp, hooks) {
    var comp = new Comp({});
    var ctx = {}, fields = {}, regions = [];
    hooks = hooks || {};
    if (hooks.init) hooks.init(comp);

    function vals() {
      var v = comp.renderVals();
      return hooks.vals ? hooks.vals(v, comp) : v;
    }
    function regionNodes(r, v) { return r.tpl ? render(r.tpl, v, ctx) : []; }

    var rootTpl = tpl.content.firstElementChild;
    var v0 = vals();
    var root = render(shallow(rootTpl), v0, ctx)[0];
    host.appendChild(root);

    function shallow(n) { var c = n.cloneNode(false); return c; }
    function build(tplParent, outParent, depth) {
      for (var n = tplParent.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) { outParent.appendChild(document.createTextNode(n.nodeValue)); continue; }
        if (n.nodeType !== 1) continue;
        if (depth === 0 && n.localName === 'div' && n.children.length > 3 && !/\{\{/.test(attrsOf(n))) {
          var wrap = render(shallow(n), v0, ctx)[0];
          outParent.appendChild(wrap);
          build(n, wrap, 1);
          continue;
        }
        var start = document.createComment('r'), end = document.createComment('/r');
        outParent.appendChild(start);
        var nodes = render(n, v0, ctx);
        for (var i = 0; i < nodes.length; i++) outParent.appendChild(nodes[i]);
        outParent.appendChild(end);
        regions.push({ tpl: n, start: start, end: end, nodes: nodes, html: html(nodes) });
      }
    }
    function attrsOf(n) { var s = ''; for (var i = 0; i < n.attributes.length; i++) if (!/^on/i.test(n.attributes[i].name)) s += n.attributes[i].value; return s; }
    build(rootTpl, root, 0);

    function restoreFields(scope) {
      var els = scope.querySelectorAll ? scope.querySelectorAll('input[id],textarea[id],select[id]') : [];
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.type === 'file' || !(el.id in fields)) continue;
        el.value = fields[el.id];
      }
    }
    root.addEventListener('input', function (e) { if (e.target.id && e.target.type !== 'file') fields[e.target.id] = e.target.value; });
    root.addEventListener('change', function (e) { if (e.target.id && e.target.type !== 'file') fields[e.target.id] = e.target.value; });

    comp.__update = function () {
      var v = vals();
      for (var i = 0; i < regions.length; i++) {
        var r = regions[i], nodes = regionNodes(r, v), h = html(nodes);
        if (h === r.html) continue;
        var focus = document.activeElement && pathTo(document.activeElement, r.nodes);
        for (var j = 0; j < r.nodes.length; j++) if (r.nodes[j].parentNode) r.nodes[j].parentNode.removeChild(r.nodes[j]);
        var parent = r.end.parentNode;
        for (j = 0; j < nodes.length; j++) parent.insertBefore(nodes[j], r.end);
        r.nodes = nodes; r.html = h;
        for (j = 0; j < nodes.length; j++) restoreFields(nodes[j]);
        if (focus) { var f = fromPath(focus, nodes); if (f && f.focus) f.focus({ preventScroll: true }); }
      }
      document.documentElement.style.overflow = host.querySelector('[role=dialog]') ? 'hidden' : '';
      if (hooks.after) hooks.after(comp, root);
    };

    // The design scrolled inside a phone-sized box; on the real page the window scrolls.
    window.addEventListener('scroll', function () {
      if (typeof ctx.onScroll === 'function') ctx.onScroll({ currentTarget: { scrollTop: window.scrollY } });
    }, { passive: true });

    if (hooks.after) hooks.after(comp, root);
    return { comp: comp, root: root, fields: fields };
  }

  /* Views: each page has a desktop and a phone layout. A view is rendered the
   * first time its layout is needed, so phones never build the desktop one. */
  function view(selector, query, start) {
    var mq = window.matchMedia(query), done = false;
    function go() { if (!done && mq.matches) { done = true; start(document.querySelector(selector)); } }
    go();
    if (mq.addEventListener) mq.addEventListener('change', go); else mq.addListener(go);
  }

  window.DC = { mount: mount, view: view, PHONE: '(max-width: 600px)', DESKTOP: '(min-width: 601px)' };
})();
