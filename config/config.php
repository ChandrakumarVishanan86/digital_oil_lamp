<?php
declare(strict_types=1);
// ---- Database (WAMP default: root / empty password) ----
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');            // use 3307 if your WAMP MySQL listens there
define('DB_NAME', 'digital_oil_lamp');
define('DB_USER', 'root');
define('DB_PASS', '');
// ---- App ----
define('APP_TIMEZONE', 'Asia/Colombo');
define('HOLD_MS', 2200);              // how long the finger must stay on the scanner
define('MAX_LAMPS_PER_HOUR', 6);      // per visitor session
define('LAMP_LIFE_HOURS', 24);        // a lamp burns this long on the wall, then fades
define('APP_DEBUG', false);
date_default_timezone_set(APP_TIMEZONE);
