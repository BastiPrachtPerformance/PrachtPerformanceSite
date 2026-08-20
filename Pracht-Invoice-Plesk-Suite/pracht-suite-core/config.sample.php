<?php

/*
 * Copy this file to config.php and enter the Plesk database credentials there.
 * config.php is intentionally excluded from the release archive and Git.
 */
return [
    'app_name' => 'Pracht Invoice',
    'database' => [
        'host' => 'localhost',
        'name' => 'DATABASE_NAME_HERE',
        'user' => 'DATABASE_USER_HERE',
        'password' => 'DATABASE_PASSWORD_HERE',
        'charset' => 'utf8mb4',
    ],
    'security' => [
        'session_name' => 'pracht_invoice_session',
        // Replace this before installation with a long random value.
        'install_key' => 'CHANGE-THIS-TO-A-LONG-RANDOM-INSTALL-KEY',
    ],
];
