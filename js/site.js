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

// Enquiry form: opens the visitor's email app with the message filled in
(function () {
  var form = document.getElementById('enquiry');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var body = 'Name: ' + f.get('name') + '\nPhone: ' + f.get('phone') + '\nEmail: ' + f.get('email') + '\n\n' + f.get('message');
    window.location.href = 'mailto:ste.procter@live.com?subject=' + encodeURIComponent('Garage door enquiry') + '&body=' + encodeURIComponent(body);
    form.querySelector('.form__sent').hidden = false;
  });
})();
