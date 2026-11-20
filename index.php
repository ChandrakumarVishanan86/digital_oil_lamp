<?php
declare(strict_types=1);
require_once __DIR__ . '/includes.php';
$csrf = csrf();
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Digital Oil Lamp · Deepam</title>
<meta name="theme-color" content="#0b0612">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Noto+Sans+Tamil:wght@400;600&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/lamp.css">
</head>
<body>
<canvas id="sparks" aria-hidden="true"></canvas>
<div class="stars" aria-hidden="true"></div>
<main class="stage">
    <header class="top"><div class="om">🪔</div><h1>Deepam</h1><p>Light a digital oil lamp. Place your finger, and your name will glow.</p></header>

    <section class="altar" id="altar">
        <div class="halo" id="halo"></div>
        <svg class="lamp" id="lamp" viewBox="0 0 320 360" role="img" aria-label="Brass oil lamp">
            <defs>
                <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b3"/><stop offset=".35" stop-color="#e8b04a"/><stop offset=".7" stop-color="#a8691b"/><stop offset="1" stop-color="#5e3408"/></linearGradient>
                <linearGradient id="brassH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b3d0c"/><stop offset=".3" stop-color="#f6cf72"/><stop offset=".55" stop-color="#c98a2b"/><stop offset="1" stop-color="#5a3109"/></linearGradient>
                <radialGradient id="oil" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#b8650a"/></radialGradient>
                <radialGradient id="fcore" cx=".5" cy=".72" r=".6"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff2a8"/><stop offset=".7" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff5a1f"/></radialGradient>
                <filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>
            </defs>
            <!-- base -->
            <ellipse cx="160" cy="338" rx="112" ry="14" fill="#2a1604" opacity=".6"/>
            <path d="M70 330 Q160 352 250 330 L236 298 Q160 312 84 298 Z" fill="url(#brassH)"/>
            <path d="M120 298 Q132 250 150 232 L170 232 Q188 250 200 298 Q160 306 120 298Z" fill="url(#brassH)"/>
            <ellipse cx="160" cy="232" rx="30" ry="7" fill="url(#brass)"/>
            <!-- stem rings -->
            <rect x="140" y="214" width="40" height="12" rx="6" fill="url(#brassH)"/>
            <rect x="146" y="200" width="28" height="12" rx="6" fill="url(#brassH)"/>
            <!-- bowl -->
            <path d="M54 168 Q60 214 160 216 Q260 214 266 168 Q160 190 54 168Z" fill="url(#brassH)"/>
            <ellipse cx="160" cy="168" rx="106" ry="22" fill="url(#brass)"/>
            <ellipse cx="160" cy="168" rx="94" ry="16" fill="url(#oil)"/>
            <ellipse cx="160" cy="168" rx="94" ry="16" fill="none" stroke="#5e3408" stroke-width="2" opacity=".5"/>
            <!-- decorative dots -->
            <g fill="#ffe9a8" opacity=".75"><circle cx="96" cy="198" r="2.6"/><circle cx="124" cy="206" r="2.6"/><circle cx="160" cy="209" r="2.6"/><circle cx="196" cy="206" r="2.6"/><circle cx="224" cy="198" r="2.6"/></g>
            <!-- spout wick holder -->
            <path d="M150 172 Q160 156 170 172Z" fill="#3a1f05"/>
            <rect x="157.5" y="150" width="5" height="22" rx="2.5" fill="#2b1a0d"/>
            <!-- flame -->
            <g id="flame" class="flame" transform="translate(160 156)">
                <path class="f-glow" d="M0 -118 C28 -82 40 -52 40 -26 C40 0 22 12 0 12 C-22 12 -40 0 -40 -26 C-40 -52 -28 -82 0 -118Z" fill="#ff9a1f" opacity=".4" filter="url(#blur)"/>
                <path class="f-out" d="M0 -100 C22 -70 32 -46 32 -24 C32 -2 18 8 0 8 C-18 8 -32 -2 -32 -24 C-32 -46 -22 -70 0 -100Z" fill="url(#fcore)"/>
                <path class="f-in" d="M0 -56 C10 -40 15 -28 15 -16 C15 -4 8 4 0 4 C-8 4 -15 -4 -15 -16 C-15 -28 -10 -40 0 -56Z" fill="#fff" opacity=".9"/>
            </g>
        </svg>
        <div class="nameplate" id="nameplate" aria-live="polite"><span class="np-label">Lit by</span><span class="np-name" id="npName"></span><span class="np-wish" id="npWish"></span></div>
    </section>

    <section class="panel" id="panel">
        <div class="step" id="stepForm">
            <label class="fld"><span>Your name</span><input id="name" maxlength="40" autocomplete="given-name" placeholder="e.g. Chandra Kumar" inputmode="text"></label>
            <label class="fld"><span>A wish / prayer <em>(optional)</em></span><input id="wish" maxlength="120" placeholder="Peace, health, success…"></label>
            <div class="err" id="err" role="alert"></div>
        </div>

        <div class="scanner-wrap">
            <button class="scanner" id="scanner" type="button" aria-label="Press and hold to scan your fingerprint">
                <svg class="ring" viewBox="0 0 160 160"><circle class="ring-bg" cx="80" cy="80" r="74"/><circle class="ring-fg" id="ringFg" cx="80" cy="80" r="74"/></svg>
                <svg class="fp" viewBox="0 0 100 100" fill="none" stroke-linecap="round">
                    <g class="fp-base" stroke="#6b5a8f" stroke-width="2.2">
                        <path d="M50 12c-20 0-34 15-34 34v8"/><path d="M50 22c-14 0-24 10-24 24v14c0 8-2 14-5 20"/>
                        <path d="M50 32c-8 0-14 6-14 14v12c0 14-3 22-8 30"/><path d="M50 42c-3 0-5 2-5 5v11c0 18-3 28-9 38"/>
                        <path d="M50 12c20 0 34 15 34 34v14c0 12-2 20-6 28"/><path d="M50 22c14 0 24 10 24 24v12c0 12-2 20-5 28"/>
                        <path d="M50 32c8 0 14 6 14 14v12c0 14-2 22-5 30"/><path d="M50 42c3 0 5 2 5 5v11c0 18-1 28-4 38"/>
                    </g>
                    <g class="fp-lit" stroke="url(#fpg)" stroke-width="2.6" clip-path="url(#fpclip)">
                        <path d="M50 12c-20 0-34 15-34 34v8"/><path d="M50 22c-14 0-24 10-24 24v14c0 8-2 14-5 20"/><path d="M50 32c-8 0-14 6-14 14v12c0 14-3 22-8 30"/><path d="M50 42c-3 0-5 2-5 5v11c0 18-3 28-9 38"/>
                        <path d="M50 12c20 0 34 15 34 34v14c0 12-2 20-6 28"/><path d="M50 22c14 0 24 10 24 24v12c0 12-2 20-5 28"/><path d="M50 32c8 0 14 6 14 14v12c0 14-2 22-5 30"/><path d="M50 42c3 0 5 2 5 5v11c0 18-1 28-4 38"/>
                    </g>
                    <defs><linearGradient id="fpg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ffe27a"/></linearGradient>
                    <clipPath id="fpclip"><rect id="fpRect" x="0" y="100" width="100" height="0"/></clipPath></defs>
                </svg>
                <span class="scanline"></span>
            </button>
            <div class="hint" id="hint">Press &amp; hold the fingerprint to light your lamp</div>
        </div>
    </section>

    <section class="wall" aria-label="Lamps lit by others">
        <div class="wall-head"><h2>Lamps burning now</h2><span class="count" id="count">…</span></div>
        <div class="diyas" id="diyas"></div>
    </section>
    <footer>Built by Chandra Kumar Vishanan · HNDIT, SLIATE · <span class="muted">Fingerprint scan is a visual ritual — nothing biometric is stored.</span></footer>
</main>
<div class="toast" id="toast" role="status"></div>
<script>window.LAMP = { csrf: <?= json_encode($csrf) ?>, hold: <?= (int) HOLD_MS ?> };</script>
<script src="assets/js/lamp.js"></script>
</body>
</html>
