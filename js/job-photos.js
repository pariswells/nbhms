/* Job photo uploads for #nbhms-contact-form.
   Images are resized in the browser (max 1600px, JPEG) before submission so
   they fit Formspree's limits (10 files, 25 MB each, 100 MB total, 30 s). */
(function () {
  var MAX_FILES = 5;
  var MAX_DIM = 1600;
  var QUALITY = 0.8;

  var input = document.getElementById('nbhms-job-photos');
  var list = document.getElementById('nbhms-job-photos-list');
  var form = document.getElementById('nbhms-contact-form');
  if (!input || !form) return;

  var canSetFiles = typeof DataTransfer !== 'undefined';
  var busy = false;

  function setStatus(text, isError) {
    list.innerHTML = '';
    if (!text) return;
    var p = document.createElement('div');
    p.className = 'nbhms-photo-status' + (isError ? ' is-error' : '');
    p.textContent = text;
    list.appendChild(p);
  }

  function render(files) {
    list.innerHTML = '';
    Array.prototype.forEach.call(files, function (f) {
      var wrap = document.createElement('div');
      wrap.className = 'nbhms-photo-thumb';
      var img = document.createElement('img');
      img.alt = f.name;
      img.src = URL.createObjectURL(f);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      wrap.appendChild(img);
      list.appendChild(wrap);
    });
    if (files.length) {
      var note = document.createElement('div');
      note.className = 'nbhms-photo-status';
      note.textContent = files.length + ' photo' + (files.length > 1 ? 's' : '') + ' attached';
      list.appendChild(note);
    }
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
    var files = Array.prototype.filter.call(input.files, function (f) {
      return /^image\//i.test(f.type) || /\.(heic|heif)$/i.test(f.name);
    });
    if (input.files.length > files.length) {
      setStatus('Only image files can be attached.', true);
    }
    if (files.length > MAX_FILES) {
      setStatus('Please choose up to ' + MAX_FILES + ' photos.', true);
      input.value = '';
      return;
    }
    if (!files.length) { input.value = ''; if (!input.files.length) setStatus(''); return; }
    if (!canSetFiles) { render(files); return; }

    busy = true;
    setStatus('Preparing photos…');
    Promise.all(files.map(resize)).then(function (out) {
      var dt = new DataTransfer();
      out.forEach(function (f) { dt.items.add(f); });
      input.files = dt.files;
      render(out);
    }).finally(function () { busy = false; });
  });

  // Don't submit while photos are still being resized.
  form.addEventListener('submit', function (e) {
    if (busy) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setStatus('Photos are still being prepared — please try again in a moment.', true);
    }
  }, true);

  form.addEventListener('reset', function () { setTimeout(function () { setStatus(''); }, 0); });
})();
