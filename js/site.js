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
