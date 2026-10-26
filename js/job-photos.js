/* Job photo uploads for #nbhms-contact-form.
   - Photos are resized in the browser (max 1600px, JPEG) before submission.
   - Choosing more photos adds to the selection (up to MAX_FILES).
   - Each thumbnail has a remove button; "Remove all" clears the selection. */
(function () {
  var MAX_FILES = 5;
  var MAX_DIM = 1600;
  var QUALITY = 0.8;

  var input = document.getElementById('nbhms-job-photos');
  var list = document.getElementById('nbhms-job-photos-list');
  var form = document.getElementById('nbhms-contact-form');
  if (!input || !list || !form) return;

  var canSetFiles = typeof DataTransfer !== 'undefined';
  var selected = []; // File objects currently attached
  var busy = false;

  // Styles for the remove buttons (kept here so the pages don't need editing).
  var css = document.createElement('style');
  css.textContent =
    '.nbhms-photo-thumb{position:relative}' +
    '#nbhms-job-photos-list .nbhms-photo-remove{position:absolute;top:-7px;right:-7px;box-sizing:border-box;' +
    'width:22px!important;height:22px!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;' +
    'border:2px solid #fff!important;border-radius:50%!important;background:#222!important;color:#fff!important;' +
    'font:700 14px/18px Arial,sans-serif!important;text-align:center;text-transform:none!important;letter-spacing:0!important;' +
    'cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.35)}' +
    '#nbhms-job-photos-list .nbhms-photo-remove:hover,#nbhms-job-photos-list .nbhms-photo-remove:focus{background:#c62828!important;outline:none}' +
    '#nbhms-job-photos-list .nbhms-photo-clear{background:none!important;border:0!important;padding:0!important;margin:0 0 0 8px!important;' +
    'min-width:0!important;height:auto!important;color:#c62828!important;text-decoration:underline;text-transform:none!important;' +
    'letter-spacing:0!important;cursor:pointer;font-family:inherit!important;font-size:13px!important;font-weight:400!important;line-height:1.4!important}';
  document.head.appendChild(css);

  function syncInput() {
    if (!canSetFiles) return;
    var dt = new DataTransfer();
    selected.forEach(function (f) { dt.items.add(f); });
    input.files = dt.files;
  }

  function status(text, isError, withClear) {
    var p = document.createElement('div');
    p.className = 'nbhms-photo-status' + (isError ? ' is-error' : '');
    p.appendChild(document.createTextNode(text));
    if (withClear) {
      var clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'nbhms-photo-clear';
      clear.textContent = 'Remove all';
      clear.addEventListener('click', function () { selected = []; syncInput(); render(); });
      p.appendChild(clear);
    }
    list.appendChild(p);
  }

  function render(message, isError) {
    list.innerHTML = '';
    selected.forEach(function (f, i) {
      var wrap = document.createElement('div');
      wrap.className = 'nbhms-photo-thumb';
      var img = document.createElement('img');
      img.alt = f.name;
      img.src = URL.createObjectURL(f);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'nbhms-photo-remove';
      rm.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      rm.innerHTML = '&times;';
      rm.addEventListener('click', function () {
        selected.splice(i, 1);
        syncInput();
        render();
      });
      wrap.appendChild(img);
      wrap.appendChild(rm);
      list.appendChild(wrap);
    });
    if (selected.length) {
      status(selected.length + ' of ' + MAX_FILES + ' photos attached', false, true);
    }
    if (message) status(message, isError);
  }

  function resize(file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return resolve(file); // e.g. HEIC: send as-is
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        if (scale === 1 && file.size < 1.5 * 1024 * 1024) return resolve(file);
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          if (!blob) return resolve(file);
          var name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', QUALITY);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  input.addEventListener('change', function () {
    var picked = Array.prototype.slice.call(input.files || []);

    // Older browsers can't edit the file list: fall back to replace-only.
    if (!canSetFiles) { selected = picked.slice(0, MAX_FILES); render(); return; }

    var images = picked.filter(function (f) {
      return /^image\//i.test(f.type) || /\.(heic|heif)$/i.test(f.name);
    });
    var note = images.length < picked.length ? 'Only image files can be attached.' : '';
    var room = MAX_FILES - selected.length;
    if (images.length > room) {
      note = 'Only ' + MAX_FILES + ' photos can be attached — the extra ones were skipped.';
      images = images.slice(0, Math.max(0, room));
    }
    if (!images.length) { syncInput(); render(note, !!note); return; }

    busy = true;
    syncInput();
    render('Preparing photos…');
    Promise.all(images.map(resize)).then(function (out) {
      selected = selected.concat(out);
      syncInput();
      render(note, !!note);
    }).finally(function () { busy = false; });
  });

  // Don't submit while photos are still being resized.
  form.addEventListener('submit', function (e) {
    if (busy) {
      e.preventDefault();
      e.stopImmediatePropagation();
      render('Photos are still being prepared — please try again in a moment.', true);
    }
  }, true);

  form.addEventListener('reset', function () {
    setTimeout(function () { selected = []; syncInput(); render(); }, 0);
  });
})();
