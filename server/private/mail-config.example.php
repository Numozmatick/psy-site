<?php
// This file belongs NEXT TO public_html, never inside it. Edit on Beget only.
return [
    'enabled' => false, // Change to true after setting the app password.
    'site_url' => getenv('LAHTINKA_SITE_URL') ?: 'https://psycholog.laht1nka.ru', // Exact HTTPS origin; env override is for local QA.
    'smtp_host' => 'smtp.yandex.ru',
    'smtp_port' => 465,
    'smtp_user' => 'psy@lahtinka.ru',
    'smtp_password' => '', // Yandex Mail app password, not the account password.
    'mail_from' => 'psy@lahtinka.ru',
    'mail_to' => 'psy@lahtinka.ru',
    'sender_name' => 'Сайт Юлии Лахтиной',
    'rate_secret' => '92e75cc5da52be163e461af376e7d3e3d35c32e4481d776fa7661beaae42dcc5',
];

