<?php
require_once __DIR__ . '/includes/config.php';

$pageTitle = 'Электронный билет — Театр в кармане';
$pageDescription = 'Проверка электронного билета Театр в кармане по QR-коду.';
$canonical = page_url('ticket');
$bodyClass = 'ticket-page';
$staticHeader = true;

$token = trim((string)($_GET['t'] ?? ''));
$errorTitle = '';
$errorText = '';
$booking = null;

function ticket_render_error(string $title, string $text, int $code = 400): void
{
    global $site, $pageTitle, $bodyClass, $staticHeader, $errorTitle, $errorText;
    http_response_code($code);
    $pageTitle = $title . ' — Театр в кармане';
    $bodyClass = 'ticket-page';
    $staticHeader = true;
    $errorTitle = $title;
    $errorText = $text;
    require __DIR__ . '/includes/head.php';
    ?>
    <main class="ticket-main ticket-error-main">
      <section class="ticket-error-card reveal visible">
        <span class="ticket-kicker">Электронный билет</span>
        <h1><?= e($errorTitle) ?></h1>
        <p><?= e($errorText) ?></p>
        <div class="ticket-error-actions">
          <a class="btn primary" href="/">На главную</a>
          <a class="btn ghost" href="/#download">Скачать приложение</a>
        </div>
      </section>
    </main>
    <?php
    ?>
    <script src="/script.js?v=26"></script>
    </body>
    </html>
    <?php
    exit;
}

function ticket_format_date_time(?string $date, ?string $time): string
{
    $date = trim((string)$date);
    $time = trim((string)$time);
    if ($date === '' && $time === '') {
        return 'Дата уточняется';
    }

    $formattedDate = $date;
    if ($date !== '') {
        $ts = strtotime($date);
        if ($ts !== false) {
            $months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
            $formattedDate = (int)date('j', $ts) . ' ' . $months[(int)date('n', $ts) - 1] . ' ' . date('Y', $ts);
        }
    }

    $formattedTime = $time;
    if ($time !== '') {
        $formattedTime = substr($time, 0, 5);
    }

    return trim($formattedDate . ($formattedTime !== '' ? ' · ' . $formattedTime : ''));
}

function ticket_supabase_get(string $url, string $key): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $key,
            'Accept: application/json',
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return [$response, $httpCode, $error];
}

if ($token === '') {
    ticket_render_error('Билет не найден', 'В ссылке нет токена билета. Откройте билет из письма или приложения.', 400);
}

if (empty($site['supabase_service_key'])) {
    ticket_render_error('База не настроена', 'На сервере не задан SUPABASE_SERVICE_KEY. Добавьте service role key в переменные PHP-FPM.', 500);
}

$select = 'id,booking_date,price_at_booking,ticket_token,user_id,session_id,seat_id,status_id,users(email,username),booking_statuses(name),seats(row_num,seat_num),sessions(session_date,session_time,plays(title),halls(name,theaters(name,address)))';

$url = rtrim($site['supabase_url'], '/') . '/rest/v1/bookings?select=' . rawurlencode($select)
    . '&ticket_token=eq.' . rawurlencode($token)
    . '&limit=1';

[$response, $httpCode, $curlError] = ticket_supabase_get($url, $site['supabase_service_key']);

if ($curlError || $httpCode !== 200) {
    $details = $curlError ?: ('Supabase вернул код ' . $httpCode . '. Ответ: ' . mb_substr((string)$response, 0, 450));
    ticket_render_error('Ошибка загрузки билета', $details, 500);
}

$data = json_decode((string)$response, true);
if (!is_array($data) || count($data) === 0) {
    ticket_render_error('Билет недействителен', 'Билет не найден в базе или токен устарел.', 404);
}

$booking = $data[0];
$user = $booking['users'] ?? [];
$seat = $booking['seats'] ?? [];
$session = $booking['sessions'] ?? [];
$play = $session['plays'] ?? [];
$hall = $session['halls'] ?? [];
$theater = $hall['theaters'] ?? [];
$status = $booking['booking_statuses']['name'] ?? 'Активен';

$playTitle = $play['title'] ?? 'Спектакль';
$genre = $play['genre'] ?? '';
$age = $play['age_restriction'] ?? '';
$duration = $play['duration_min'] ?? '';
$sessionDateTime = ticket_format_date_time($session['session_date'] ?? '', $session['session_time'] ?? '');
$userName = !empty($user['username']) ? $user['username'] : ($user['email'] ?? 'Гость');
$row = $seat['row_num'] ?? '—';
$place = $seat['seat_num'] ?? '—';
$price = number_format((float)($booking['price_at_booking'] ?? 0), 0, '.', ' ');
$bookingId = $booking['id'] ?? '—';
$theaterName = $theater['name'] ?? 'Театр';
$theaterAddress = $theater['address'] ?? '';
$hallName = $hall['name'] ?? 'Зал';
$publicTicketUrl = page_url('ticket') . '?t=' . rawurlencode((string)($booking['ticket_token'] ?? $token));

$qrUrl = '';
$qrLib = '/usr/share/phpqrcode/qrlib.php';
if (is_file($qrLib)) {
    require_once $qrLib;
    ob_start();
    QRcode::png($publicTicketUrl, null, QR_ECLEVEL_M, 6, 1);
    $qrImage = base64_encode((string)ob_get_clean());
    $qrUrl = 'data:image/png;base64,' . $qrImage;
} else {
    $qrUrl = 'https://qrcoder.ru/code/?' . rawurlencode($publicTicketUrl) . '&6&0';
}

$pageTitle = 'Билет № ' . $bookingId . ' — ' . $playTitle;
require __DIR__ . '/includes/head.php';
?>
<main class="ticket-main">
  <section class="ticket-hero reveal visible">
    <div class="ticket-bg-glow" aria-hidden="true"></div>
    <div class="ticket-title-block">
      <span class="ticket-kicker">Электронный билет</span>
      <h1>Ваш билет готов</h1>
      <p>Покажите QR-код на входе. Страница адаптирована под телефон, планшет и горизонтальную развёртку.</p>
    </div>

    <article class="ticket-card">
      <div class="ticket-main-info">
        <div class="ticket-card-head">
          <div>
            <span class="ticket-label">Спектакль</span>
            <h2><?= e($playTitle) ?></h2>
          </div>
          <span class="ticket-status"><?= e($status) ?></span>
        </div>

        <div class="ticket-detail-grid">
          <div class="ticket-detail wide">
            <span>Дата и время</span>
            <strong><?= e($sessionDateTime) ?></strong>
          </div>
          <div class="ticket-detail wide">
            <span>Театр и зал</span>
            <strong><?= e($theaterName) ?> · <?= e($hallName) ?></strong>
            <?php if ($theaterAddress !== ''): ?><small><?= e($theaterAddress) ?></small><?php endif; ?>
          </div>
          <div class="ticket-detail">
            <span>Ряд</span>
            <strong><?= e($row) ?></strong>
          </div>
          <div class="ticket-detail">
            <span>Место</span>
            <strong><?= e($place) ?></strong>
          </div>
          <div class="ticket-detail">
            <span>Цена</span>
            <strong><?= e($price) ?> ₽</strong>
          </div>
          <div class="ticket-detail wide">
            <span>Зритель</span>
            <strong><?= e($userName) ?></strong>
          </div>
        </div>

        <div class="ticket-meta-row">
          <?php if ($genre !== ''): ?><span><?= e($genre) ?></span><?php endif; ?>
          <?php if ($age !== ''): ?><span><?= e($age) ?></span><?php endif; ?>
          <?php if ($duration !== ''): ?><span><?= e($duration) ?> мин</span><?php endif; ?>
          <span>Бронь № <?= e($bookingId) ?></span>
        </div>
      </div>

      <aside class="ticket-control">
        <div class="ticket-control-title">Контроль</div>
        <div class="ticket-qr-wrap">
          <img src="<?= e($qrUrl) ?>" alt="QR код билета № <?= e($bookingId) ?>" />
        </div>
        <p>Сканируйте QR для проверки билета</p>
        <div class="ticket-dashed"></div>
        <small>Билет действителен при предъявлении. Не передавайте QR-код посторонним.</small>
      </aside>
    </article>

    <div class="ticket-actions">
      <a class="btn ghost" href="/">На главную</a>
      <button class="btn primary" type="button" onclick="window.print()">Распечатать</button>
    </div>
  </section>
</main>
<script src="/script.js?v=26"></script>
</body>
</html>
