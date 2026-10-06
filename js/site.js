// Mobile menu toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
})();

// Fact tiles are <details>: collapsed to their headings on phones (tap to read),
// always open from tablet up, where there's room to show everything.
(function () {
  var tiles = document.querySelectorAll('details.tile');
  if (!tiles.length) return;
  var phone = window.matchMedia('(max-width: 767px)');
  function sync() {
    for (var i = 0; i < tiles.length; i++) tiles[i].open = !phone.matches;
  }
  sync();
  phone.addEventListener('change', sync);
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener('toggle', function (e) {
      if (!phone.matches && !e.target.open) e.target.open = true;
    });
  }
})();

// Enquiry form: posts to FormSubmit, which emails the details and photo to Steve.
// Large phone photos are shrunk in the browser first so they stay under FormSubmit's 10MB limit.
(function () {
  var form = document.getElementById('enquiry');
  if (!form) return;
  var sent = form.querySelector('.form__sent');
  var error = form.querySelector('.form__error');
  var button = form.querySelector('button[type=submit]');
  var photo = form.querySelector('input[type=file]');
  var MAX_BYTES = 10 * 1024 * 1024;

  if (/[?&]sent=1/.test(location.search)) sent.hidden = false;

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

  form.addEventListener('submit', function (e) {
    if (form.dataset.ready) return;
    e.preventDefault();
    error.hidden = true;
    form.querySelector('input[name=_next]').value = location.origin + location.pathname + '?sent=1#enquiry';
    var file = photo && photo.files[0];
    button.disabled = true;
    shrink(file).then(function (small) {
      if (small && small !== file && window.DataTransfer) {
        try { var dt = new DataTransfer(); dt.items.add(small); photo.files = dt.files; } catch (err) { small = file; }
      }
      var size = photo && photo.files[0] ? photo.files[0].size : 0;
      if (size > MAX_BYTES) {
        button.disabled = false;
        error.textContent = 'That photo is too large to send (over 10MB). Please choose a smaller one, or send it to Steve on WhatsApp.';
        error.hidden = false;
        return;
      }
      form.dataset.ready = '1';
      HTMLFormElement.prototype.submit.call(form);
    });
  });
})();
