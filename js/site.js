/* Lift Easy: page hooks for the design views (see js/dc.js) and the contact forms.
 *
 * Both contact forms post to FormSubmit, which emails the details and photos
 * to Steve. Large phone photos are shrunk in the browser first so the total
 * stays under FormSubmit's 10MB limit.
 */
(function () {
  'use strict';
  var LE = window.LE = { hooks: {} };
  var ENDPOINT = 'https://formsubmit.co/steve@lifteasygaragedoors.co.uk';
  var MAX_BYTES = 10 * 1024 * 1024;
  var sent = /[?&]sent=1/.test(location.search);
  var page = location.pathname.split('/').pop() || 'index.html';

  function shrink(file) {
    return new Promise(function (resolve) {
      if (!file || !/^image\//.test(file.type) || file.size < 1.5 * 1024 * 1024) return resolve(file);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) {
          URL.revokeObjectURL(url);
          resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file);
        }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }
  function shrinkAll(files) { return Promise.all(Array.prototype.map.call(files, shrink)); }
  function total(files) { var n = 0; for (var i = 0; i < files.length; i++) n += files[i].size; return n; }
  function setFiles(input, files) {
    if (!window.DataTransfer) return false;
    try { var dt = new DataTransfer(); files.forEach(function (f) { dt.items.add(f); }); input.files = dt.files; return true; }
    catch (e) { return false; }
  }
  function hidden(form, name, value) {
    var i = document.createElement('input');
    i.type = 'hidden'; i.name = name; i.value = value;
    form.appendChild(i);
  }
  function settings(form) {
    hidden(form, '_subject', 'New garage door enquiry from the website');
    hidden(form, '_template', 'table');
    hidden(form, '_next', location.origin + location.pathname + '?sent=1');
    var honey = document.createElement('input');
    honey.type = 'text'; honey.name = '_honey'; honey.className = 'le-honey'; honey.tabIndex = -1; honey.autocomplete = 'off';
    honey.setAttribute('aria-hidden', 'true');
    form.appendChild(honey);
  }
  var tooBig = 'Those photos are too large to send together (over 10MB). Please send fewer, or send them to Steve on WhatsApp.';

  /* "Send Steve a photo" (WhatsApp) buttons, on every page: ask what the problem
   * is first, then open WhatsApp with a message ready so the customer only has
   * to attach their photo. WhatsApp links can carry text but not photos. */
  var WA = 'https://wa.me/447939500544?text=';
  var ISSUES = [
    ['Door stuck or won’t open', 'my garage door is stuck and won’t open'],
    ['Hit a bin or obstruction', 'my garage door hit something and now it’s stuck'],
    ['Noisy or grinding', 'my garage door is noisy or grinding'],
    ['Heavy or sticking', 'my garage door is heavy or sticking'],
    ['Won’t close fully', 'my garage door won’t close fully'],
    ['Remote or opener not working', 'my garage door remote or opener isn’t working'],
    ['Something else', 'I’ve got a problem with my garage door']
  ];
  /* Three kinds of picker: sending a photo, a WhatsApp message ("WhatsApp Steve"),
   * or an email (any email link to Steve) */
  var EMAIL = 'steve@lifteasygaragedoors.co.uk';
  var MESSAGE_ITEMS = ISSUES.slice(0, -1).concat([
    ['General question', 'I’ve got a question about my garage door']
  ]);
  var MODES = {
    photo: {
      tag: 'SEND STEVE A PHOTO',
      help: 'Pick one and WhatsApp opens with a message ready. Then just attach your photo and send.',
      items: ISSUES,
      end: '. Here’s a photo:'
    },
    message: {
      tag: 'WHATSAPP STEVE',
      help: 'Pick one and WhatsApp opens with your message ready to send.',
      items: MESSAGE_ITEMS,
      end: '. Can you help?'
    },
    email: {
      tag: 'EMAIL STEVE',
      help: 'Pick one and your email opens with the message ready. Add your details and send.',
      items: MESSAGE_ITEMS,
      end: '. Can you help?',
      email: true
    }
  };
  function link(mode, it) {
    var msg = 'Hi Steve, ' + it[1] + mode.end;
    if (!mode.email) return WA + encodeURIComponent(msg);
    var body = 'Hi Steve,\n\n' + it[1].charAt(0).toUpperCase() + it[1].slice(1) + mode.end +
      '\n\nName: \nPhone: \nTown or postcode: \n\nThanks';
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Garage door enquiry: ' + it[0]) + '&body=' + encodeURIComponent(body);
  }
  var sheet = null, opener = null;
  function closeSheet() {
    if (!sheet) return;
    sheet.remove(); sheet = null;
    document.documentElement.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }
  function openSheet(from, kind) {
    var mode = MODES[kind] || MODES.photo;
    opener = from;
    sheet = document.createElement('div');
    sheet.className = 'le-sheet';
    var items = mode.items.map(function (it) {
      return '<a class="le-sheet__opt" data-le-direct href="' + link(mode, it) + '"' + (mode.email ? '' : ' target="_blank" rel="noopener"') + '>' +
        '<span>' + it[0] + '</span><span aria-hidden="true">→</span></a>';
    }).join('');
    sheet.innerHTML = '<div class="le-sheet__backdrop" data-close></div>' +
      '<div class="le-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="le-sheet-title">' +
      '<div class="le-sheet__head"><div><div class="le-sheet__tag">' + mode.tag + '</div>' +
      '<h2 id="le-sheet-title">What’s the problem?</h2></div>' +
      '<button type="button" class="le-sheet__x" data-close aria-label="Close">✕</button></div>' +
      '<p class="le-sheet__help">' + mode.help + '</p>' +
      '<div class="le-sheet__list">' + items + '</div></div>';
    document.body.appendChild(sheet);
    document.documentElement.style.overflow = 'hidden';
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeSheet();
      else if (e.target.closest('.le-sheet__opt')) setTimeout(closeSheet, 0);
    });
    sheet.querySelector('.le-sheet__opt').focus();
  }
  document.addEventListener('click', function (e) {
    // The generic "here's a photo" links and links marked data-le-pick ("WhatsApp Steve");
    // WhatsApp links that already carry a specific message go straight through
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"][href*="here%27s%20a%20photo"], a[data-le-pick], a[href^="mailto:' + EMAIL + '"]');
    if (!a || a.hasAttribute('data-le-direct') || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    openSheet(a, a.getAttribute('data-le-pick') || (/^mailto:/.test(a.getAttribute('href')) ? 'email' : 'photo'));
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!sheet) return;
    if (e.key === 'Escape') { closeSheet(); return; }
    if (e.key === 'Tab') {   // keep focus inside the panel
      var f = sheet.querySelectorAll('a,button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (page !== 'contact.html') return;

  /* Desktop form: a real <form> in the page */
  function desktopForm() {
    var form = document.getElementById('enquiry');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    settings(form);
    var ok = form.querySelector('[data-sent]'), err = form.querySelector('[data-error]');
    var button = form.querySelector('button[type=submit]');
    var photos = form.querySelector('input[type=file]');
    if (sent && ok) ok.hidden = false;
    form.addEventListener('submit', function (e) {
      if (form.dataset.ready) return;
      e.preventDefault();
      err.hidden = true;
      button.disabled = true;
      shrinkAll(photos.files).then(function (small) {
        setFiles(photos, small);
        if (total(photos.files) > MAX_BYTES) {
          button.disabled = false;
          err.textContent = tooBig;
          err.hidden = false;
          return;
        }
        form.dataset.ready = '1';
        HTMLFormElement.prototype.submit.call(form);
      });
    });
  }
  document.addEventListener('DOMContentLoaded', desktopForm);
  desktopForm();

  /* Phone form: the design's three-step form. Its own logic handles the steps;
   * these hooks keep the chosen photo files and send everything on the last step. */
  var files = [], latest = null;
  LE.hooks.phone = {
    init: function (comp) { if (sent) comp.state.step = 4; },
    vals: function (v, comp) {
      latest = v;
      var onPhotos = v.onPhotos, clear = v.clearPhotos, restart = v.restart, next = v.next;
      v.onPhotos = function (e) { files = files.concat(Array.prototype.slice.call(e.target.files || [])); onPhotos(e); };
      v.clearPhotos = function () { files = []; clear(); };
      v.restart = function () {
        files = [];
        if (sent) history.replaceState(null, '', location.pathname);
        sent = false;
        restart();
      };
      v.next = function () {
        if (comp.state.step !== 3) return next();
        var need = ['m-name', 'm-phone'];
        for (var i = 0; i < need.length; i++) {
          var el = document.getElementById(need[i]);
          if (el && !el.value.trim()) { el.required = true; el.reportValidity(); el.focus(); return; }
        }
        send(comp);
      };
      return v;
    }
  };

  function pick(list) { for (var i = 0; i < list.length; i++) if (list[i].on) return list[i].label; return ''; }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function send(comp) {
    var phoneView = document.querySelector('.view-m');
    var old = phoneView.querySelector('.le-status'); if (old) old.remove();
    shrinkAll(files).then(function (small) {
      if (total(small) > MAX_BYTES) {
        var p = document.createElement('p');
        p.className = 'le-status'; p.setAttribute('role', 'alert'); p.textContent = tooBig;
        p.style.margin = '14px 0 0';
        var formEl = phoneView.querySelector('form');
        formEl.parentNode.insertBefore(p, formEl.nextSibling);
        return;
      }
      var form = document.createElement('form');
      form.action = ENDPOINT; form.method = 'POST'; form.enctype = 'multipart/form-data';
      form.hidden = true;
      settings(form);
      hidden(form, 'name', val('m-name'));
      hidden(form, 'phone', val('m-phone'));
      hidden(form, 'email', val('m-email'));
      hidden(form, 'location', val('m-town'));
      hidden(form, 'problem', pick(latest.problems) || 'Not picked');
      hidden(form, 'door_make', pick(latest.makes));
      hidden(form, 'message', val('m-problem'));
      var input = document.createElement('input');
      input.type = 'file'; input.name = 'attachment'; input.multiple = true;
      form.appendChild(input);
      setFiles(input, small);
      document.body.appendChild(form);
      HTMLFormElement.prototype.submit.call(form);
    });
  }
})();
