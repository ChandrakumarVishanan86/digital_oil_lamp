(function () {
    'use strict';
    var C = window.LAMP, HOLD = C.hold, API = 'api.php';
    var $ = function (id) { return document.getElementById(id); };
    var scanner = $('scanner'), ring = $('ringFg'), rect = $('fpRect'), hint = $('hint'), errEl = $('err'), step = $('stepForm'), altar = $('altar');
    var CIRC = 465, raf = 0, t0 = 0, busy = false, lit = false, seen = {};

    // ---------- helpers
    function toast(m) { var t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 3200); }
    function setHint(m, cls) { hint.textContent = m; hint.className = 'hint ' + (cls || ''); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    function post(body) {
        return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': C.csrf }, body: JSON.stringify(body), credentials: 'same-origin' })
            .then(function (r) { return r.json().catch(function () { return { success: false, message: 'Unexpected response.' }; }); })
            .catch(function () { return { success: false, message: 'Network problem. Try again.' }; });
    }
    function nameOk() {
        var n = $('name').value.replace(/\s+/g, ' ').trim();
        if (n.length < 2) return 'Please enter your name first.';
        if (n.length > 40 || !/^[\p{L}\p{M}][\p{L}\p{M} .'\-]*$/u.test(n)) return 'Name can have letters only.';
        return '';
    }

    // ---------- audio (soft ignition whoosh + bell)
    var ac;
    function sound() {
        try {
            ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
            var t = ac.currentTime, len = ac.sampleRate * 0.6, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
            for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
            var n = ac.createBufferSource(); n.buffer = buf; var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + .5); f.Q.value = 0.9;
            var g = ac.createGain(); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .6); n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t);
            [880, 1318, 1760].forEach(function (fr, k) { var o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = fr; og.gain.setValueAtTime(0, t + .25 + k * .12); og.gain.linearRampToValueAtTime(.08, t + .3 + k * .12); og.gain.exponentialRampToValueAtTime(.0005, t + 2.2); o.connect(og); og.connect(ac.destination); o.start(t + .25 + k * .12); o.stop(t + 2.3); });
        } catch (e) {}
    }
    function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

    // ---------- embers canvas
    var cv = $('sparks'), cx = cv.getContext('2d'), P = [], W, H;
    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; } size(); addEventListener('resize', size);
    function origin() { var r = $('lamp').getBoundingClientRect(); return { x: r.left + r.width * .5, y: r.top + r.height * .36 }; }
    function burst(n) { var o = origin(); for (var i = 0; i < n; i++) P.push({ x: o.x + (Math.random() - .5) * 20, y: o.y, vx: (Math.random() - .5) * 3.2, vy: -Math.random() * 3.6 - 1, life: 1, d: .008 + Math.random() * .012, r: 1 + Math.random() * 2.4 }); }
    var amb = 0;
    function loop() {
        cx.clearRect(0, 0, W, H);
        if (lit && ++amb % 6 === 0) { var o = origin(); P.push({ x: o.x + (Math.random() - .5) * 14, y: o.y - 6, vx: (Math.random() - .5) * .5, vy: -Math.random() * 1.1 - .4, life: 1, d: .006 + Math.random() * .008, r: .8 + Math.random() * 1.4 }); }
        for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; p.x += p.vx + Math.sin(p.y * .03) * .3; p.y += p.vy; p.vy *= .995; p.life -= p.d; if (p.life <= 0) { P.splice(i, 1); continue; }
            cx.globalAlpha = Math.max(p.life, 0); cx.fillStyle = p.life > .5 ? '#ffe39a' : '#ff8a1f'; cx.shadowColor = '#ff9a1f'; cx.shadowBlur = 8; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); }
        cx.globalAlpha = 1; cx.shadowBlur = 0; requestAnimationFrame(loop);
    } loop();

    // ---------- fingerprint hold
    function reset(msg, cls) {
        cancelAnimationFrame(raf); busy = false; scanner.classList.remove('busy'); ring.style.strokeDashoffset = CIRC; rect.setAttribute('y', 100); rect.setAttribute('height', 0);
        if (msg) setHint(msg, cls); else setHint('Press & hold the fingerprint to light your lamp');
    }
    function tick(now) {
        var p = Math.max(0, Math.min((now - t0) / HOLD, 1)); ring.style.strokeDashoffset = CIRC * (1 - p); rect.setAttribute('y', 100 - p * 100); rect.setAttribute('height', p * 100);
        setHint(p < .5 ? 'Scanning…' : p < .98 ? 'Reading your fingerprint…' : 'Verified ✓', p >= .98 ? 'ok' : '');
        if (p >= 1) { complete(now - t0); return; }
        raf = requestAnimationFrame(tick);
    }
    function start(e) {
        if (busy || scanner.classList.contains('done')) return;
        if (e && e.preventDefault) e.preventDefault();
        var m = nameOk(); errEl.textContent = m;
        if (m) { step.classList.remove('shake'); void step.offsetWidth; step.classList.add('shake'); $('name').focus(); setHint(m, 'warn'); return; }
        busy = true; scanner.classList.add('busy'); t0 = performance.now(); buzz(25); raf = requestAnimationFrame(tick);
    }
    function cancel() { if (!busy) return; reset('Keep holding a little longer…', 'warn'); }
    function complete(held) {
        cancelAnimationFrame(raf); scanner.classList.remove('busy'); scanner.classList.add('done'); buzz([40, 40, 80]);
        post({ name: $('name').value, wish: $('wish').value, held_ms: Math.round(held) }).then(function (r) {
            busy = false;
            if (!r.success) { scanner.classList.remove('done'); reset(r.message, 'warn'); errEl.textContent = r.message; return; }
            ignite(r.name, $('wish').value.trim()); loadWall(true);
        });
    }
    scanner.addEventListener('pointerdown', function (e) { try { scanner.setPointerCapture(e.pointerId); } catch (x) {} start(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { scanner.addEventListener(ev, cancel); });
    scanner.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    scanner.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { start(e); } });
    scanner.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') cancel(); });

    // ---------- ignition
    function ignite(name, wish) {
        lit = true; altar.classList.remove('lit'); void altar.offsetWidth; altar.classList.add('lit'); document.body.classList.add('lit-mode');
        $('npName').textContent = name; $('npWish').textContent = wish ? '“' + wish + '”' : '';
        burst(70); setTimeout(function () { burst(30); }, 380); sound(); buzz([20, 30, 20]);
        setHint('🪔 Your lamp is burning, ' + name + '. Light another?', 'ok');
        setTimeout(function () { scanner.classList.remove('done'); ring.style.strokeDashoffset = CIRC; rect.setAttribute('y', 100); rect.setAttribute('height', 0); $('name').value = ''; $('wish').value = ''; errEl.textContent = ''; }, 2400);
        altar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ---------- wall
    function diya(l, life) {
        var o = Math.max(.35, 1 - (l.age_min / life) * .65), isNew = !seen[l.id] && Object.keys(seen).length > 0;
        return '<div class="diya' + (isNew ? ' new' : '') + '" style="--o:' + o.toFixed(2) + '" title="' + esc(l.wish || '') + '"><svg viewBox="0 0 80 70"><defs><radialGradient id="fg' + l.id + '" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffe08a"/><stop offset="1" stop-color="#ff6a1a"/></radialGradient></defs>' +
            '<ellipse cx="40" cy="30" rx="30" ry="22" fill="#ff9a1f" opacity=".16"/><g class="mf"><path d="M40 4C47 15 51 22 51 29c0 6-5 10-11 10s-11-4-11-10c0-7 4-14 11-25z" fill="url(#fg' + l.id + ')"/></g>' +
            '<path d="M10 40c4 18 18 26 30 26s26-8 30-26c-12 6-48 6-60 0z" fill="#c98a2b"/><path d="M10 40c12 6 48 6 60 0 0-3-2-5-6-6-16 5-32 5-48 0-4 1-6 3-6 6z" fill="#f2c15a"/></svg>' +
            '<div class="dn">' + esc(l.name) + '</div>' + (l.wish ? '<div class="dw">' + esc(l.wish) + '</div>' : '') + '</div>';
    }
    function loadWall(force) {
        fetch(API, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (r) {
            if (!r.success) return;
            var box = $('diyas'); $('count').textContent = r.total.toLocaleString() + ' lamps lit so far';
            box.innerHTML = r.lamps.length ? r.lamps.map(function (l) { return diya(l, r.life_min); }).join('') : '<div class="empty">No lamps burning yet. Be the first 🙏</div>';
            r.lamps.forEach(function (l) { seen[l.id] = 1; });
        }).catch(function () {});
    }
    loadWall(); setInterval(function () { if (!document.hidden) loadWall(); }, 8000);
    $('name').addEventListener('input', function () { errEl.textContent = ''; if (!busy) setHint('Press & hold the fingerprint to light your lamp'); });
})();
