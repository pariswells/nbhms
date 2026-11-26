/* Quote form submission -> Forminit (https://forminit.com).
   Maps the form's fields to Forminit blocks. If a submission with photos
   fails, it is retried without photos so the enquiry is never lost. */
(function () {
  var ENDPOINT = 'https://forminit.com/f/29z1bq1mln1';
  var PHONE = '0412 334 872';

  var form = document.getElementById('nbhms-contact-form');
  var btn = document.getElementById('nbhms-submit-btn');
  var msg = document.getElementById('nbhms-form-msg');
  if (!form || !btn || !msg) return;

  // --- Job location field (added here so the 21 pages don't need editing) ---
  var SUBURBS = {
    'albany-creek': 'Albany Creek QLD 4035', 'aspley': 'Aspley QLD 4034', 'chermside': 'Chermside QLD 4032',
    'clontarf': 'Clontarf QLD 4019', 'dakabin': 'Dakabin QLD 4503', 'deception-bay': 'Deception Bay QLD 4508',
    'griffin': 'Griffin QLD 4503', 'kallangur': 'Kallangur QLD 4503', 'kippa-ring': 'Kippa-Ring QLD 4021',
    'mango-hill': 'Mango Hill QLD 4509', 'newport': 'Newport QLD 4020', 'redcliffe': 'Redcliffe QLD 4020',
    'rothwell': 'Rothwell QLD 4022', 'scarborough': 'Scarborough QLD 4020'
  };
  (function addLocationField() {
    if (form.elements['job_location']) return;
    var message = form.elements['message'];
    var msgCol = message && message.closest('[class*="col-"]');
    if (!msgCol) return;
    var col = document.createElement('div');
    col.className = 'col-lg-12 col-md-12 col-sm-12 col-xs-12';
    var list = document.createElement('datalist');
    list.id = 'nbhms-suburbs';
    Object.keys(SUBURBS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = SUBURBS[k];
      list.appendChild(o);
    });
    var p = document.createElement('p');
    var label = document.createElement('label');
    var input = document.createElement('input');
    input.type = 'text';
    input.name = 'job_location';
    input.required = true;
    input.maxLength = 150;
    input.autocomplete = 'address-level2';
    input.setAttribute('list', 'nbhms-suburbs');
    input.placeholder = 'Job location (suburb or street address)';
    input.className = 'wpcf7-form-control wpcf7-text';
    input.style.width = '100%';
    input.style.maxWidth = '100%';
    input.setAttribute('aria-label', 'Job location');
    var m = location.pathname.match(/handyman-services-([a-z-]+)\.html/);
    if (m && SUBURBS[m[1]]) input.value = SUBURBS[m[1]];
    input.defaultValue = input.value; // so form.reset() restores the page's suburb
    label.appendChild(input);
    p.appendChild(label);
    col.appendChild(p);
    col.appendChild(list);
    msgCol.parentNode.insertBefore(col, msgCol);
  })();

  function val(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function build(withPhotos) {
    var fd = new FormData();
    fd.append('fi-sender-firstName', val('first_name'));
    fd.append('fi-sender-lastName', val('last_name'));
    fd.append('fi-sender-email', val('email'));
    // Sent as text: Forminit's phone block rejects local AU formats (e.g. 0412 ...).
    fd.append('fi-text-phone', val('phone'));
    fd.append('fi-text-job_location', val('job_location'));
    fd.append('fi-text-message', val('message'));
    fd.append('fi-text-page', document.title + ' (' + location.pathname + ')');
    var input = document.getElementById('nbhms-job-photos');
    if (withPhotos && input && input.files) {
      Array.prototype.forEach.call(input.files, function (f) {
        fd.append('fi-file-photos[]', f, f.name);
      });
    }
    return fd;
  }

  function hasPhotos() {
    var input = document.getElementById('nbhms-job-photos');
    return !!(input && input.files && input.files.length);
  }

  function send(fd) {
    return fetch(ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || j.success === false) {
            var err = new Error(j.message || ('HTTP ' + r.status));
            err.code = j.error;
            throw err;
          }
          return j;
        });
      });
  }

  function show(text, ok) {
    msg.style.cssText = 'display:block;margin-top:16px;padding:14px 20px;border-radius:4px;font-size:15px;font-weight:600;' +
      (ok ? 'background:#e8f5e9;color:#2e7d32;' : 'background:#ffebee;color:#c62828;');
    msg.textContent = text;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Sending…';
    var photos = hasPhotos();

    send(build(true))
      .then(function () {
        show("Thanks! We'll be in touch shortly.", true);
        form.reset();
      })
      .catch(function (err) {
        if (window.console) console.warn('Quote form error:', err.code || '', err.message);
        if (!photos) throw err;
        // Retry without photos so the enquiry still arrives.
        return send(build(false)).then(function () {
          show("Thanks! We've got your enquiry, but the photos couldn't be uploaded — please text them to " + PHONE + '.', true);
          form.reset();
        });
      })
      .catch(function () {
        show('Something went wrong — please call us directly on ' + PHONE + '.', false);
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
  });
})();
