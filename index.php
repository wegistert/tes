<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/data/content.php';
require_once __DIR__ . '/includes/supabase.php';
require_once __DIR__ . '/includes/site_counters.php';
$liveStats = get_live_stats();
$siteCounters = default_site_counters();
$latestPlays = get_latest_plays(3);
function stat_value($live, $fallback, $suffix = '')
{
  return $live !== null ? number_format((int)$live, 0, '.', ' ') . $suffix : $fallback;
}
$pageTitle = 'Театр в кармане — скачать Android приложение APK';
$pageDescription = 'Официальное Android-приложение для афиши спектаклей, выбора мест, покупки билетов и QR-входа в театр.';
$canonical = page_url('');
require __DIR__ . '/includes/head.php';
require __DIR__ . '/includes/header.php';
?>
<main>
  <section class="hero section">
    <div class="hero-bg">
      <video autoplay muted loop playsinline poster="/assets/screen-afisha.jpg">
        <source src="https://teatrvkarmane.ru/video2.mp4" type="video/mp4" />
      </video>
      <div class="video-shade"></div>
    </div>

    <div class="hero-content reveal">
      <div class="eyebrow">Официальное Android приложение</div>
      <h1>ТЕАТР<br />В КАРМАНЕ</h1>
      <p>Афиша спектаклей, выбор мест, электронные билеты и QR-код для входа — всё в одном ярком и удобном приложении.</p>
      <div class="hero-actions">
        <a class="btn primary download-cta download-cta--hero js-track-download" href="<?= e($site['apk']) ?>" download data-track="download">Скачать Android</a>
        <a class="btn ghost" href="#screens">Посмотреть приложение</a>
      </div>
      <div class="trust-row" aria-label="Преимущества">
        <span>QR-билет</span><span>Афиша 24/7</span><span>Выбор мест</span>
      </div>
    </div>

    <div class="phone-wrap reveal" data-parallax>
      <div class="phone-glow"></div>
      <div class="phone">
        <div class="phone-top"></div>
        <img src="/assets/screen-afisha.jpg" alt="Скриншот приложения <?= e($site['name']) ?>" />
      </div>
    </div>
  </section>

  <section class="stats section reveal" aria-label="Статистика">
    <div class="stat-card">
      <b data-site-counter="plays"><?= e($siteCounters['plays'] ?? 0) ?></b>
      <span>спектаклей в афише</span>
    </div>

    <div class="stat-card">
      <b data-site-counter="bookings"><?= e($siteCounters['bookings'] ?? 0) ?></b>
      <span>электронных билетов</span>
    </div>

    <div class="stat-card">
      <b data-site-counter="sessions"><?= e($siteCounters['sessions'] ?? 0) ?></b>
      <span>сеансов в расписании</span>
    </div>

    <div class="stat-card">
      <b data-site-counter="theaters"><?= e($siteCounters['theaters'] ?? 0) ?></b>
      <span>театров в базе</span>
    </div>

    <div class="stat-card live-counter">
      <b data-site-counter="downloads"><?= e($siteCounters['downloads'] ?? 0) ?></b>
      <span>скачиваний APK</span>
    </div>

  </section>

  <section class="db-insights section reveal" id="database">
    <div class="section-title compact-title">
      <span>Возможности сервиса</span>
      <h2>Всё важное для зрителя уже внутри приложения</h2>
      <p>Афиша, избранное, отзывы, залы и электронные билеты связаны в единую систему — сайт показывает это аккуратно, без лишней технической информации.</p>
    </div>
    <div class="db-insights-grid">
      <article class="db-insight-card animated-item">
        <span>Зрители</span>
        <b data-site-counter="users" data-empty="—"><?= (int)($siteCounters['users'] ?? 0) > 0 ? e($siteCounters['users']) : '—' ?></b>
        <p>профили пользователей для билетов, отзывов и избранного</p>
      </article>
      <article class="db-insight-card animated-item">
        <span>Избранное</span>
        <b data-site-counter="favorites" data-empty="—"><?= (int)($siteCounters['favorites'] ?? 0) > 0 ? e($siteCounters['favorites']) : '—' ?></b>
        <p>спектакли, которые зрители сохраняют, чтобы вернуться позже</p>
      </article>
      <article class="db-insight-card animated-item">
        <span>Отзывы</span>
        <b data-site-counter="reviews" data-empty="—"><?= (int)($siteCounters['reviews'] ?? 0) > 0 ? e($siteCounters['reviews']) : '—' ?></b>
        <p>оценки и впечатления после посещения спектаклей</p>
      </article>
      <article class="db-insight-card animated-item">
        <span>Залы</span>
        <b data-site-counter="halls" data-empty="—"><?= (int)($siteCounters['halls'] ?? 0) > 0 ? e($siteCounters['halls']) : '—' ?></b>
        <p>схемы залов для выбора удобного ряда и места</p>
      </article>
    </div>
  </section>

  <section class="database-live section reveal" id="live-data">
    <div class="database-live-hero">
      <div class="section-title compact-title">
        <span>Актуальная афиша</span>
        <h2>Свежие сеансы, отзывы и спектакли</h2>
        <p>Расписание и контент подтягиваются из приложения автоматически. На сайте остаётся только чистая витрина для зрителей — без технических таблиц и лишнего шума.</p>
      </div>
    </div>

    <div class="database-live-grid">
      <article class="database-panel database-panel--sessions">
        <div class="database-panel__head">
          <span>Расписание</span>
          <h3>Ближайшие сеансы</h3>
        </div>
        <div class="database-list" data-highlights-list="nearest_sessions">
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
        </div>
      </article>

      <article class="database-panel database-panel--reviews">
        <div class="database-panel__head">
          <span>Мнения зрителей</span>
          <h3>Последние отзывы</h3>
        </div>
        <div class="database-list" data-highlights-list="latest_reviews">
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
        </div>
      </article>

      <article class="database-panel database-panel--plays">
        <div class="database-panel__head">
          <span>Афиша</span>
          <h3>Спектакли в приложении</h3>
        </div>
        <div class="database-mini-grid" data-highlights-list="popular_plays">
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
          <div class="database-skeleton"></div>
        </div>
      </article>
    </div>
  </section>

  <?php if (!empty($latestPlays)): ?>
    <section class="live-afisha section reveal" id="afisha">
      <div class="section-title compact-title">
        <span>Из Supabase</span>
        <h2>Сейчас в афише</h2>
        <p>Эти карточки подтягиваются прямо из таблицы <b>plays</b>, поэтому главная может обновляться без ручной правки HTML.</p>
      </div>
      <div class="live-plays-grid">
        <?php foreach ($latestPlays as $play): ?>
          <article class="live-play-card">
            <div class="live-play-top">
              <span><?= e($play['genre'] ?? 'Спектакль') ?></span>
              <?php if (!empty($play['age_restriction'])): ?><b><?= e($play['age_restriction']) ?></b><?php endif; ?>
            </div>
            <h3><?= e($play['title'] ?? 'Без названия') ?></h3>
            <p><?= e($play['description'] ?? 'Описание скоро появится.') ?></p>
            <div class="live-play-meta">
              <?php if (!empty($play['director'])): ?><span>Режиссёр: <?= e($play['director']) ?></span><?php endif; ?>
              <?php if (!empty($play['duration_min'])): ?><span><?= e($play['duration_min']) ?> мин</span><?php endif; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php endif; ?>

  <section class="about section" id="about">
    <div class="section-title reveal">
      <span>Возможности</span>
      <h2>Приложение для зрителей, которым нужен быстрый доступ к театру</h2>
    </div>
    <div class="features">
      <?php foreach ($features as $feature): ?>
        <article class="feature reveal">
          <div class="feature-icon"><?= e($feature['icon']) ?></div>
          <h3><?= e($feature['title']) ?></h3>
          <p><?= e($feature['text']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="journey section reveal" id="how">
    <div class="section-title compact-title">
      <span>Как это работает</span>
      <h2>От афиши до входа в зал — в три шага</h2>
    </div>
    <div class="journey-grid">
      <?php foreach ($steps as $index => $step): ?>
        <article class="journey-card">
          <strong><?= str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) ?></strong>
          <h3><?= e($step['title']) ?></h3>
          <p><?= e($step['text']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="screens section" id="screens">
    <div class="section-title reveal">
      <span>Интерфейс</span>
      <h2>Скриншоты приложения</h2>
    </div>
    <div class="screens-grid reveal">
      <?php foreach ($screens as $i => $screen): ?>
        <figure class="screen-card <?= !empty($screen['active']) ? 'active screen-current' : '' ?>" style="--screen-i: <?= (int)$i ?>">
          <button class="screen-open" type="button" data-full="/<?= e($screen['img']) ?>" aria-label="Открыть скриншот: <?= e($screen['caption']) ?>">
            <img src="/<?= e($screen['img']) ?>" alt="<?= e($screen['alt']) ?>" />
          </button>
          <figcaption><?= e($screen['caption']) ?><small>Нажми, чтобы открыть полностью</small></figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="team section" id="team">
    <div class="section-title reveal">
      <span>Люди проекта</span>
      <h2>Главный человек проекта</h2>
    </div>
    <div class="team-grid single-team">
      <article class="person-card founder-card reveal">
        <div class="founder-aura"></div>
        <div class="creator-badge">CREATOR</div>
        <div class="person-photo founder-photo"><img src="/assets/chumarov.jpg" alt="<?= e($site['creator']) ?>" /></div>
        <div class="person-info founder-info">
          <p class="role">Создатель проекта</p>
          <h3><?= e($site['creator']) ?></h3>
          <p>Автор идеи и создатель приложения «<?= e($site['name']) ?>». Центр проекта: концепция, разработка, визуальный стиль и развитие сервиса для зрителей.</p>
          <div class="creator-tags"><span>идея</span><span>приложение</span><span>дизайн</span><span>цифровой театр</span></div>
        </div>
      </article>
    </div>
    <button class="easter-gazan" type="button" aria-label="Секретная пасхалка" title="пасхалка"><img src="/assets/director.jpg" alt="" /></button>
  </section>

  <section class="seo-tags section reveal" aria-label="Поисковые теги">
    <div class="section-title">
      <span>Поисковые теги</span>
      <h2>Как найти приложение</h2>
      <p>Ищи сайт по запросам: Театр в кармане, скачать Театр в кармане APK, приложение театр, билеты в театр, афиша спектаклей, QR билет.</p>
    </div>
    <div class="tag-cloud">
      <?php foreach ($tags as $tag): ?><span><?= e($tag) ?></span><?php endforeach; ?>
    </div>
  </section>

  <section class="faq section reveal" id="faq">
    <div class="section-title compact-title">
      <span>FAQ</span>
      <h2>Коротко о приложении</h2>
    </div>
    <div class="faq-grid">
      <?php foreach ($faq as $item): ?>
        <article class="faq-card">
          <h3><?= e($item['q']) ?></h3>
          <p><?= e($item['a']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="download section reveal" id="download">
    <div class="download-card premium-download">
      <img src="/assets/app-icon.jpg" alt="Иконка приложения" />
      <div><span>Android APK</span>
        <h2>Скачайте «<?= e($site['name']) ?>»</h2>
        <p>Загрузите приложение на Android и получите быстрый доступ к афише и электронным билетам.</p>
      </div>
      <a class="btn primary download-cta download-cta--bottom js-track-download" href="<?= e($site['apk']) ?>" download data-track="download">Скачать APK</a>
    </div>
  </section>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>