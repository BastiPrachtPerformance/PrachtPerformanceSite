<?php
declare(strict_types=1);

final class PrachtSuite
{
    private static array $config = [];
    private static ?PDO $pdo = null;

    public static function run(string $surface): void
    {
        self::boot();
        $action = (string) ($_GET['action'] ?? '');
        if ($action === 'asset') { self::serveAsset(); return; }
        if ($action === 'logout') { self::logout($surface); return; }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') self::handlePost($surface);
        $user = self::user();
        if (!$user) { self::loginPage($surface); return; }
        if ($surface === 'control' && $user['role'] !== 'super_admin') { http_response_code(403); self::messagePage('Kein Zugriff', 'Dieser Zugang ist nicht für Pracht Control freigegeben.'); return; }
        if ($surface === 'invoice' && !$user['organization_id']) { http_response_code(403); self::messagePage('Kein Mandant', 'Dieser Zugang ist keinem Rechnungsmandanten zugeordnet.'); return; }
        $surface === 'control' ? self::controlPage($user) : self::invoicePage($user);
    }

    public static function install(): void
    {
        self::boot();
        $installed = self::storagePath('.installed');
        if (is_file($installed)) { self::messagePage('Bereits installiert', 'Die Datenbank wurde bereits eingerichtet. Lösche install.php aus beiden Webordnern.'); return; }
        $errors = self::requirements();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $key = (string) ($_POST['install_key'] ?? '');
            if (!hash_equals((string) self::$config['security']['install_key'], $key)) $errors[] = 'Der Installationsschlüssel stimmt nicht.';
            $adminName = trim((string) ($_POST['admin_name'] ?? ''));
            $adminEmail = strtolower(trim((string) ($_POST['admin_email'] ?? '')));
            $adminPassword = (string) ($_POST['admin_password'] ?? '');
            if ($adminName === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL) || strlen($adminPassword) < 12) $errors[] = 'Name, gültige E-Mail und ein Passwort mit mindestens 12 Zeichen werden benötigt.';
            if (!$errors) {
                self::schema();
                $exists = self::one('SELECT id FROM users WHERE role = "super_admin" LIMIT 1');
                if (!$exists) self::exec('INSERT INTO users (organization_id, name, email, password_hash, role, is_active, must_change_password, created_at) VALUES (NULL, ?, ?, ?, "super_admin", 1, 0, NOW())', [$adminName, $adminEmail, password_hash($adminPassword, PASSWORD_ARGON2ID)]);
                @file_put_contents($installed, date(DATE_ATOM));
                self::messagePage('Installation abgeschlossen', 'Melde dich jetzt über control.pracht-performance.de mit deinem neuen Admin-Zugang an. Lösche danach install.php aus beiden Subdomain-Ordnern.');
                return;
            }
        }
        self::installPage($errors);
    }

    private static function boot(): void
    {
        if (self::$config) return;
        $file = __DIR__ . '/config.php';
        if (!is_file($file)) { self::messagePage('Konfiguration fehlt', 'Kopiere pracht-suite-core/config.sample.php nach config.php und trage die Datenbankdaten direkt auf Plesk ein.'); exit; }
        self::$config = require $file;
        if (headers_sent()) return;
        session_name((string) (self::$config['security']['session_name'] ?? 'pracht_suite_session'));
        session_set_cookie_params(['httponly' => true, 'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'), 'samesite' => 'Lax', 'path' => '/']);
        session_start();
    }

    private static function db(): PDO
    {
        if (self::$pdo) return self::$pdo;
        $db = self::$config['database'];
        self::$pdo = new PDO("mysql:host={$db['host']};dbname={$db['name']};charset=" . ($db['charset'] ?? 'utf8mb4'), $db['user'], $db['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
        return self::$pdo;
    }

    private static function schema(): void
    {
        $queries = [
            'CREATE TABLE IF NOT EXISTS organizations (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) NOT NULL, email VARCHAR(190) NULL, street VARCHAR(190) NULL, postal_code VARCHAR(30) NULL, city VARCHAR(100) NULL, country VARCHAR(80) NULL DEFAULT "Deutschland", tax_number VARCHAR(80) NULL, vat_id VARCHAR(80) NULL, iban VARCHAR(80) NULL, bic VARCHAR(80) NULL, logo_filename VARCHAR(190) NULL, accent_color VARCHAR(12) NOT NULL DEFAULT "#fa5139", template_key VARCHAR(40) NOT NULL DEFAULT "classic", invoice_prefix VARCHAR(30) NOT NULL DEFAULT "RE", invoice_counter INT UNSIGNED NOT NULL DEFAULT 0, created_at DATETIME NOT NULL, updated_at DATETIME NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
            'CREATE TABLE IF NOT EXISTS users (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, organization_id INT UNSIGNED NULL, name VARCHAR(190) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, role VARCHAR(30) NOT NULL DEFAULT "invoice_user", is_active TINYINT(1) NOT NULL DEFAULT 1, must_change_password TINYINT(1) NOT NULL DEFAULT 1, created_at DATETIME NOT NULL, last_login_at DATETIME NULL, INDEX(organization_id), CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
            'CREATE TABLE IF NOT EXISTS customers (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, organization_id INT UNSIGNED NOT NULL, name VARCHAR(190) NOT NULL, email VARCHAR(190) NULL, street VARCHAR(190) NULL, postal_code VARCHAR(30) NULL, city VARCHAR(100) NULL, country VARCHAR(80) NULL DEFAULT "Deutschland", created_at DATETIME NOT NULL, updated_at DATETIME NULL, INDEX(organization_id), CONSTRAINT fk_customers_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
            'CREATE TABLE IF NOT EXISTS invoices (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, organization_id INT UNSIGNED NOT NULL, customer_id INT UNSIGNED NULL, invoice_number VARCHAR(100) NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT "draft", issue_date DATE NOT NULL, service_date DATE NULL, due_date DATE NULL, currency CHAR(3) NOT NULL DEFAULT "EUR", note TEXT NULL, footer TEXT NULL, net_total DECIMAL(13,2) NOT NULL DEFAULT 0, tax_total DECIMAL(13,2) NOT NULL DEFAULT 0, gross_total DECIMAL(13,2) NOT NULL DEFAULT 0, snapshot LONGTEXT NULL, pdf_filename VARCHAR(190) NULL, pdf_hash VARCHAR(128) NULL, issued_at DATETIME NULL, created_at DATETIME NOT NULL, updated_at DATETIME NULL, INDEX(organization_id), INDEX(customer_id), INDEX(status), CONSTRAINT fk_invoices_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE, CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
            'CREATE TABLE IF NOT EXISTS invoice_items (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, invoice_id INT UNSIGNED NOT NULL, position_no INT UNSIGNED NOT NULL, title VARCHAR(500) NOT NULL, quantity DECIMAL(13,3) NOT NULL DEFAULT 1, unit_price DECIMAL(13,2) NOT NULL DEFAULT 0, tax_rate DECIMAL(5,2) NOT NULL DEFAULT 19, net_total DECIMAL(13,2) NOT NULL DEFAULT 0, tax_total DECIMAL(13,2) NOT NULL DEFAULT 0, gross_total DECIMAL(13,2) NOT NULL DEFAULT 0, INDEX(invoice_id), CONSTRAINT fk_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
            'CREATE TABLE IF NOT EXISTS audit_logs (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, organization_id INT UNSIGNED NULL, user_id INT UNSIGNED NULL, event VARCHAR(120) NOT NULL, context_json TEXT NULL, created_at DATETIME NOT NULL, INDEX(organization_id), INDEX(user_id), INDEX(created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
        ];
        foreach ($queries as $query) self::db()->exec($query);
        self::ensureStorage();
    }

    private static function requirements(): array
    {
        $errors = [];
        if (!extension_loaded('pdo_mysql')) $errors[] = 'PHP-Erweiterung pdo_mysql fehlt.';
        if (!extension_loaded('mbstring')) $errors[] = 'PHP-Erweiterung mbstring fehlt.';
        if (!extension_loaded('fileinfo')) $errors[] = 'PHP-Erweiterung fileinfo fehlt.';
        if (version_compare(PHP_VERSION, '8.2.0', '<')) $errors[] = 'PHP 8.2 oder neuer wird benötigt.';
        try { self::db()->query('SELECT 1'); } catch (Throwable $e) { $errors[] = 'Datenbankverbindung fehlgeschlagen: ' . $e->getMessage(); }
        return $errors;
    }

    private static function handlePost(string $surface): void
    {
        $action = (string) ($_POST['action'] ?? '');
        if ($action === 'login') { self::login($surface); return; }
        $user = self::user();
        if (!$user) { self::flash('Bitte erneut anmelden.', 'error'); self::redirect(''); }
        self::verifyCsrf();
        try {
            if ($surface === 'control') self::controlPost($user, $action); else self::invoicePost($user, $action);
        } catch (Throwable $e) { self::flash('Speichern nicht möglich: ' . $e->getMessage(), 'error'); }
        self::redirect((string) ($_POST['return_to'] ?? ''));
    }

    private static function login(string $surface): void
    {
        $email = strtolower(trim((string) ($_POST['email'] ?? ''))); $password = (string) ($_POST['password'] ?? '');
        $user = self::one('SELECT * FROM users WHERE email = ? LIMIT 1', [$email]);
        if (!$user || !$user['is_active'] || !password_verify($password, $user['password_hash'])) { self::flash('E-Mail oder Passwort stimmen nicht.', 'error'); self::redirect(''); }
        if ($surface === 'control' && $user['role'] !== 'super_admin') { self::flash('Dieser Zugang ist nur für das Rechnungsportal freigegeben.', 'error'); self::redirect(''); }
        if ($surface === 'invoice' && !$user['organization_id']) { self::flash('Dieser Zugang ist nur für Pracht Control freigegeben.', 'error'); self::redirect(''); }
        session_regenerate_id(true); $_SESSION['suite_user_id'] = (int) $user['id']; self::exec('UPDATE users SET last_login_at = NOW() WHERE id = ?', [$user['id']]); self::audit($user['organization_id'] ? (int) $user['organization_id'] : null, (int) $user['id'], 'login'); self::redirect('');
    }

    private static function logout(string $surface): void { $_SESSION = []; session_destroy(); self::redirect(''); }
    private static function user(): ?array { $id = (int) ($_SESSION['suite_user_id'] ?? 0); return $id ? self::one('SELECT * FROM users WHERE id = ? AND is_active = 1', [$id]) : null; }

    private static function controlPost(array $user, string $action): void
    {
        if ($user['role'] !== 'super_admin') throw new RuntimeException('Kein Zugriff.');
        if ($action === 'create_organization') {
            $name = trim((string) ($_POST['organization_name'] ?? '')); $email = strtolower(trim((string) ($_POST['user_email'] ?? ''))); $password = (string) ($_POST['initial_password'] ?? ''); $userName = trim((string) ($_POST['user_name'] ?? ''));
            if ($name === '' || $userName === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) throw new RuntimeException('Firmenname, Nutzername, gültige E-Mail und ein Passwort mit mindestens 12 Zeichen sind erforderlich.');
            self::db()->beginTransaction();
            try {
                self::exec('INSERT INTO organizations (name, email, created_at) VALUES (?, ?, NOW())', [$name, $email]); $orgId = (int) self::db()->lastInsertId();
                self::exec('INSERT INTO users (organization_id, name, email, password_hash, role, is_active, must_change_password, created_at) VALUES (?, ?, ?, ?, "invoice_user", 1, 1, NOW())', [$orgId, $userName, $email, password_hash($password, PASSWORD_ARGON2ID)]);
                self::audit($orgId, (int) $user['id'], 'organization_created', ['name' => $name]); self::db()->commit(); self::flash("{$name} wurde angelegt. Den Startzugang nur einmal sicher an den Kunden geben.");
            } catch (Throwable $e) { self::db()->rollBack(); throw $e; }
            return;
        }
        if ($action === 'toggle_user') { $id = (int) ($_POST['user_id'] ?? 0); self::exec('UPDATE users SET is_active = IF(is_active = 1, 0, 1) WHERE id = ? AND role != "super_admin"', [$id]); self::audit(null, (int) $user['id'], 'user_toggled', ['user_id' => $id]); self::flash('Zugang aktualisiert.'); return; }
        if ($action === 'reset_password') { $id = (int) ($_POST['user_id'] ?? 0); $password = (string) ($_POST['new_password'] ?? ''); if (strlen($password) < 12) throw new RuntimeException('Das neue Passwort braucht mindestens 12 Zeichen.'); self::exec('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ? AND role != "super_admin"', [password_hash($password, PASSWORD_ARGON2ID), $id]); self::audit(null, (int) $user['id'], 'password_reset', ['user_id' => $id]); self::flash('Passwort wurde zurückgesetzt.'); return; }
        throw new RuntimeException('Unbekannte Aktion.');
    }

    private static function invoicePost(array $user, string $action): void
    {
        $orgId = (int) $user['organization_id'];
        if ($action === 'save_settings') { self::saveSettings($orgId); self::audit($orgId, (int) $user['id'], 'profile_updated'); self::flash('Firmenprofil und Vorlage gespeichert.'); return; }
        if ($action === 'save_customer') { self::saveCustomer($orgId); self::audit($orgId, (int) $user['id'], 'customer_saved'); self::flash('Kunde gespeichert.'); return; }
        if ($action === 'save_invoice' || $action === 'issue_invoice') { $id = self::saveInvoice($orgId, (int) $user['id'], $action === 'issue_invoice'); self::flash($action === 'issue_invoice' ? 'Rechnung wurde final ausgestellt und als PDF gespeichert.' : 'Entwurf gespeichert.'); self::redirect('view=documents&focus=' . $id); }
        if ($action === 'change_password') { $current = (string) ($_POST['current_password'] ?? ''); $next = (string) ($_POST['new_password'] ?? ''); if (!password_verify($current, $user['password_hash']) || strlen($next) < 12) throw new RuntimeException('Aktuelles Passwort prüfen; das neue Passwort braucht mindestens 12 Zeichen.'); self::exec('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?', [password_hash($next, PASSWORD_ARGON2ID), $user['id']]); self::flash('Passwort geändert.'); return; }
        throw new RuntimeException('Unbekannte Aktion.');
    }

    private static function controlPage(array $user): void
    {
        $organizations = self::all('SELECT o.*, (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id AND u.is_active = 1) AS active_users, (SELECT COUNT(*) FROM invoices i WHERE i.organization_id = o.id AND i.status = "issued") AS invoice_count, COALESCE((SELECT SUM(i.net_total) FROM invoices i WHERE i.organization_id = o.id AND i.status = "issued" AND YEAR(i.issue_date) = YEAR(CURDATE()) AND MONTH(i.issue_date) = MONTH(CURDATE())), 0) AS month_net, COALESCE((SELECT SUM(i.gross_total) FROM invoices i WHERE i.organization_id = o.id AND i.status = "issued" AND YEAR(i.issue_date) = YEAR(CURDATE()) AND MONTH(i.issue_date) = MONTH(CURDATE())), 0) AS month_gross, (SELECT MAX(i.issued_at) FROM invoices i WHERE i.organization_id = o.id AND i.status = "issued") AS last_invoice FROM organizations o ORDER BY o.created_at DESC');
        $totals = self::one('SELECT COUNT(*) AS invoices, COALESCE(SUM(net_total),0) AS net, COALESCE(SUM(gross_total),0) AS gross FROM invoices WHERE status = "issued" AND YEAR(issue_date) = YEAR(CURDATE()) AND MONTH(issue_date) = MONTH(CURDATE())');
        $users = self::all('SELECT u.*, o.name AS organization_name FROM users u LEFT JOIN organizations o ON o.id = u.organization_id WHERE u.role != "super_admin" ORDER BY u.created_at DESC');
        self::layout('Pracht Control · Rechnungen', 'control', $user, function () use ($organizations, $totals, $users) { ?>
          <section class="hero"><p class="eyebrow">Pracht Control / Invoice</p><h1>Rechnungen.<br><em>Im Überblick.</em></h1><p>Mandanten, Zugänge und echte Rechnungswerte zentral steuern.</p></section>
          <?= self::flashHtml() ?>
          <section class="metrics"><article><span>Aktive Mandanten</span><strong><?= count($organizations) ?></strong><small>Rechnungsportale</small></article><article><span>Rechnungen / Monat</span><strong><?= (int) $totals['invoices'] ?></strong><small>final ausgestellt</small></article><article><span>Netto / Monat</span><strong><?= self::money($totals['net']) ?></strong><small>über alle Mandanten</small></article><article><span>Brutto / Monat</span><strong><?= self::money($totals['gross']) ?></strong><small>ausgestellte Rechnungen</small></article></section>
          <section class="grid two"><article class="card"><div class="card-head"><div><p class="eyebrow">Neuer Mandant</p><h2>Portal-Zugang<br>anlegen.</h2></div></div><form method="post" class="form"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="action" value="create_organization"><input type="hidden" name="return_to" value=""><label>Firmenname<input name="organization_name" required placeholder="z. B. CK Eventcenter"></label><label>Name des ersten Nutzers<input name="user_name" required placeholder="Vor- und Nachname"></label><label>Login-E-Mail<input type="email" name="user_email" required placeholder="kunde@firma.de"></label><label>Temporäres Startpasswort<input type="password" name="initial_password" minlength="12" required placeholder="mindestens 12 Zeichen"></label><p class="hint">Das Passwort wird nur einmal angezeigt. Der Nutzer ändert es nach dem ersten Login.</p><button class="button" type="submit">Mandant & Zugang anlegen <b>↗</b></button></form></article>
          <article class="card dark"><p class="eyebrow">So funktioniert es</p><h2>Du steuerst.<br><em>Deine Kunden rechnen.</em></h2><ol class="steps"><li><b>01</b> Mandant und ersten Zugang anlegen</li><li><b>02</b> Kunde meldet sich im Invoice Portal an</li><li><b>03</b> Rechnung erstellen und PDF herunterladen</li><li><b>04</b> Kennzahlen erscheinen hier automatisch</li></ol></article></section>
          <section class="card table-card"><div class="card-head"><div><p class="eyebrow">Mandanten</p><h2>Rechnungsportale</h2></div><a class="ghost" href="https://invoice.pracht-performance.de" target="_blank" rel="noreferrer">Portal öffnen ↗</a></div><div class="table scroll"><table><thead><tr><th>Mandant</th><th>Nutzer</th><th>Rechnungen</th><th>Netto / Monat</th><th>Brutto / Monat</th><th>Letzte Rechnung</th></tr></thead><tbody><?php foreach ($organizations as $org): ?><tr><td><b><?= self::e($org['name']) ?></b><small><?= self::e($org['email'] ?: 'Profil noch unvollständig') ?></small></td><td><?= (int) $org['active_users'] ?></td><td><?= (int) $org['invoice_count'] ?></td><td><?= self::money($org['month_net']) ?></td><td><?= self::money($org['month_gross']) ?></td><td><?= $org['last_invoice'] ? self::date($org['last_invoice']) : '—' ?></td></tr><?php endforeach; if (!$organizations): ?><tr><td colspan="6" class="empty">Noch kein Mandant angelegt.</td></tr><?php endif; ?></tbody></table></div></section>
          <section class="card table-card"><div class="card-head"><div><p class="eyebrow">Zugänge</p><h2>Nutzer verwalten</h2></div></div><div class="table scroll"><table><thead><tr><th>Nutzer</th><th>Mandant</th><th>Letzter Login</th><th>Status</th><th>Aktion</th></tr></thead><tbody><?php foreach ($users as $account): ?><tr><td><b><?= self::e($account['name']) ?></b><small><?= self::e($account['email']) ?></small></td><td><?= self::e($account['organization_name']) ?></td><td><?= $account['last_login_at'] ? self::date($account['last_login_at']) : 'Noch nie' ?></td><td><span class="status <?= $account['is_active'] ? 'ok' : 'off' ?>"><?= $account['is_active'] ? 'Aktiv' : 'Gesperrt' ?></span></td><td><details><summary>Verwalten</summary><form method="post"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="return_to" value=""><input type="hidden" name="user_id" value="<?= (int) $account['id'] ?>"><button name="action" value="toggle_user" class="link-button"><?= $account['is_active'] ? 'Zugang sperren' : 'Zugang aktivieren' ?></button></form><form method="post" class="compact"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="return_to" value=""><input type="hidden" name="action" value="reset_password"><input type="hidden" name="user_id" value="<?= (int) $account['id'] ?>"><input name="new_password" type="password" minlength="12" placeholder="Neues Passwort" required><button class="link-button">Passwort setzen</button></form></details></td></tr><?php endforeach; if (!$users): ?><tr><td colspan="5" class="empty">Noch keine Nutzer angelegt.</td></tr><?php endif; ?></tbody></table></div></section>
        <?php });
    }

    private static function invoicePage(array $user): void
    {
        $orgId = (int) $user['organization_id'];
        $org = self::one('SELECT * FROM organizations WHERE id = ?', [$orgId]);
        if (!$org) { self::messagePage('Mandant nicht gefunden', 'Bitte wende dich an Pracht Performance.'); return; }
        $view = (string) ($_GET['view'] ?? 'dashboard');
        if ($view === 'pdf') { self::downloadPdf($orgId, (int) ($_GET['id'] ?? 0)); return; }
        if ($view === 'preview') { self::invoicePreview($orgId, (int) ($_GET['id'] ?? 0), $org); return; }
        self::layout('Pracht Invoice', 'invoice', $user, function () use ($org, $orgId, $view, $user) {
            $nav = ['dashboard' => 'Übersicht', 'new' => 'Neue Rechnung', 'documents' => 'Rechnungen', 'customers' => 'Kunden', 'settings' => 'Vorlage & Profil']; ?>
            <header class="portal-header"><a class="portal-brand" href="?view=dashboard"><span><?= self::e(mb_strtoupper(mb_substr($org['name'], 0, 1))) ?></span><b><?= self::e($org['name']) ?><small>Pracht Invoice</small></b></a><nav><?php foreach ($nav as $key => $label): ?><a class="<?= $view === $key ? 'active' : '' ?>" href="?view=<?= $key ?>"><?= $label ?></a><?php endforeach; ?></nav><details class="user-menu"><summary><?= self::e($user['name']) ?></summary><a href="?view=settings#password">Passwort ändern</a><a href="?action=logout">Abmelden</a></details></header>
            <main class="portal-main"><?= self::flashHtml() ?><?php
                if ($view === 'new') self::invoiceForm($org, $orgId);
                elseif ($view === 'documents') self::documentsPage($org, $orgId);
                elseif ($view === 'customers') self::customersPage($orgId);
                elseif ($view === 'settings') self::settingsPage($org, $user);
                else self::invoiceDashboard($org, $orgId);
            ?></main><?php
        });
    }

    private static function invoiceDashboard(array $org, int $orgId): void
    {
        $month = self::one('SELECT COUNT(*) AS count, COALESCE(SUM(net_total),0) AS net, COALESCE(SUM(gross_total),0) AS gross FROM invoices WHERE organization_id = ? AND status = "issued" AND YEAR(issue_date)=YEAR(CURDATE()) AND MONTH(issue_date)=MONTH(CURDATE())', [$orgId]);
        $latest = self::all('SELECT i.*, c.name AS customer_name FROM invoices i LEFT JOIN customers c ON c.id=i.customer_id WHERE i.organization_id=? ORDER BY i.created_at DESC LIMIT 6', [$orgId]); ?>
        <section class="invoice-hero"><div><p class="eyebrow">Dein Rechnungsportal</p><h1>Guten Tag,<br><em><?= self::e($org['name']) ?>.</em></h1><p>Erstelle professionelle Rechnungen, speichere sie sicher und lade sie als PDF herunter.</p></div><a class="button" href="?view=new">Neue Rechnung <b>↗</b></a></section>
        <section class="metrics"><article><span>Rechnungen / Monat</span><strong><?= (int) $month['count'] ?></strong><small>final ausgestellt</small></article><article><span>Netto / Monat</span><strong><?= self::money($month['net']) ?></strong><small>ohne Umsatzsteuer</small></article><article><span>Brutto / Monat</span><strong><?= self::money($month['gross']) ?></strong><small>inklusive Umsatzsteuer</small></article><article><span>Vorlagenstatus</span><strong><?= $org['logo_filename'] ? '✓' : '—' ?></strong><small><?= $org['logo_filename'] ? 'Logo hinterlegt' : 'Logo noch hinterlegen' ?></small></article></section>
        <section class="grid two"><article class="card accent"><p class="eyebrow">Schnellstart</p><h2>In wenigen<br><em>Schritten fertig.</em></h2><ol class="steps"><li><b>01</b> Rechnungsempfänger auswählen</li><li><b>02</b> Leistungen und Beträge eintragen</li><li><b>03</b> Prüfen, finalisieren und PDF laden</li></ol><a class="button light" href="?view=new">Rechnung erstellen <b>↗</b></a></article><article class="card"><p class="eyebrow">Dein Auftritt</p><h2>Logo & Vorlage<br>einmal <em>einrichten.</em></h2><p class="card-copy">Deine Rechnungen verwenden danach automatisch Firmenangaben, Bankverbindung, Farbe, Logo und Fußzeile.</p><a class="text-link" href="?view=settings">Vorlage einrichten ↗</a></article></section>
        <section class="card table-card"><div class="card-head"><div><p class="eyebrow">Zuletzt bearbeitet</p><h2>Rechnungen</h2></div><a class="ghost" href="?view=documents">Alle anzeigen ↗</a></div><div class="table scroll"><table><thead><tr><th>Nummer</th><th>Kunde</th><th>Datum</th><th>Betrag</th><th>Status</th><th></th></tr></thead><tbody><?php foreach ($latest as $invoice): ?><tr><td><b><?= self::e($invoice['invoice_number'] ?: 'Entwurf') ?></b></td><td><?= self::e($invoice['customer_name'] ?: 'Ohne Kunde') ?></td><td><?= self::date($invoice['issue_date']) ?></td><td><?= self::money($invoice['gross_total']) ?></td><td><span class="status <?= $invoice['status'] === 'issued' ? 'ok' : 'draft' ?>"><?= $invoice['status'] === 'issued' ? 'Ausgestellt' : 'Entwurf' ?></span></td><td><?php if ($invoice['status'] === 'issued'): ?><a class="icon-link" href="?view=pdf&id=<?= (int) $invoice['id'] ?>">PDF ↗</a><?php else: ?><a class="icon-link" href="?view=new&id=<?= (int) $invoice['id'] ?>">Bearbeiten ↗</a><?php endif; ?></td></tr><?php endforeach; if (!$latest): ?><tr><td colspan="6" class="empty">Deine erste Rechnung wartet auf dich.</td></tr><?php endif; ?></tbody></table></div></section>
    <?php }

    private static function invoiceForm(array $org, int $orgId): void
    {
        $id = (int) ($_GET['id'] ?? 0); $invoice = $id ? self::one('SELECT * FROM invoices WHERE id=? AND organization_id=? AND status="draft"', [$id, $orgId]) : null;
        if (!$invoice) $invoice = ['id' => 0, 'customer_id' => '', 'issue_date' => date('Y-m-d'), 'service_date' => date('Y-m-d'), 'due_date' => date('Y-m-d', strtotime('+14 days')), 'note' => '', 'footer' => 'Vielen Dank für Ihr Vertrauen.'];
        $items = $invoice['id'] ? self::all('SELECT * FROM invoice_items WHERE invoice_id=? ORDER BY position_no', [$invoice['id']]) : [['title' => '', 'quantity' => '1', 'unit_price' => '', 'tax_rate' => '19']];
        $customers = self::all('SELECT * FROM customers WHERE organization_id=? ORDER BY name', [$orgId]); ?>
        <section class="page-head"><div><p class="eyebrow"><?= $invoice['id'] ? 'Entwurf bearbeiten' : 'Neue Rechnung' ?></p><h1>Rechnung<br><em>erstellen.</em></h1></div><a class="ghost" href="?view=documents">Zur Übersicht ↗</a></section>
        <?php if (!$customers): ?><div class="notice">Lege zuerst mindestens einen Rechnungsempfänger an. <a href="?view=customers">Kunden anlegen ↗</a></div><?php endif; ?>
        <form method="post" class="invoice-form" id="invoice-form"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="return_to" value="view=documents"><input type="hidden" name="invoice_id" value="<?= (int) $invoice['id'] ?>">
          <section class="card form-card"><div class="card-head"><div><p class="eyebrow">Empfänger & Zeitraum</p><h2>Die Grundlagen.</h2></div></div><div class="form-grid"><label>Rechnungsempfänger<select name="customer_id" required><option value="">Bitte auswählen</option><?php foreach ($customers as $customer): ?><option value="<?= (int) $customer['id'] ?>" <?= (int) $invoice['customer_id'] === (int) $customer['id'] ? 'selected' : '' ?>><?= self::e($customer['name']) ?></option><?php endforeach; ?></select></label><label>Rechnungsdatum<input type="date" name="issue_date" value="<?= self::e($invoice['issue_date']) ?>" required></label><label>Leistungsdatum<input type="date" name="service_date" value="<?= self::e($invoice['service_date']) ?>"></label><label>Zahlbar bis<input type="date" name="due_date" value="<?= self::e($invoice['due_date']) ?>"></label></div></section>
          <section class="card form-card"><div class="card-head"><div><p class="eyebrow">Positionen</p><h2>Was rechnest du ab?</h2></div><button class="ghost" type="button" id="add-row">+ Position</button></div><div class="positions"><div class="position-head"><span>Leistung</span><span>Menge</span><span>Einzelpreis netto</span><span>USt.</span><span>Summe</span><span></span></div><div id="position-rows"><?php foreach ($items as $item): ?><div class="position-row"><input name="item_title[]" value="<?= self::e($item['title']) ?>" placeholder="z. B. Webdesign Mai 2026" required><input class="item-qty" name="item_qty[]" type="number" min="0.001" step="0.001" value="<?= self::e((string) $item['quantity']) ?>" required><input class="item-price" name="item_price[]" type="number" min="0" step="0.01" value="<?= self::e((string) $item['unit_price']) ?>" required><select class="item-tax" name="item_tax[]"><option value="19" <?= (float) $item['tax_rate'] === 19.0 ? 'selected' : '' ?>>19 %</option><option value="7" <?= (float) $item['tax_rate'] === 7.0 ? 'selected' : '' ?>>7 %</option><option value="0" <?= (float) $item['tax_rate'] === 0.0 ? 'selected' : '' ?>>0 %</option></select><output>0,00 €</output><button type="button" class="remove-row" aria-label="Position entfernen">×</button></div><?php endforeach; ?></div></div><div class="totals"><span>Netto <b id="net-total">0,00 €</b></span><span>Umsatzsteuer <b id="tax-total">0,00 €</b></span><strong>Gesamt <b id="gross-total">0,00 €</b></strong></div></section>
          <section class="card form-card"><div class="card-head"><div><p class="eyebrow">Zusatztexte</p><h2>Optional.</h2></div></div><div class="form-grid one"><label>Hinweis auf der Rechnung<textarea name="note" rows="3" placeholder="z. B. Leistungszeitraum oder Projektbezug"><?= self::e($invoice['note']) ?></textarea></label><label>Fußzeile<textarea name="footer" rows="3"><?= self::e($invoice['footer']) ?></textarea></label></div></section>
          <div class="form-actions"><button class="ghost" type="submit" name="action" value="save_invoice">Entwurf speichern</button><button class="button" type="submit" name="action" value="issue_invoice" <?= !$customers ? 'disabled' : '' ?>>Rechnung final ausstellen <b>↗</b></button></div>
        </form><template id="position-template"><div class="position-row"><input name="item_title[]" placeholder="Leistung" required><input class="item-qty" name="item_qty[]" type="number" min="0.001" step="0.001" value="1" required><input class="item-price" name="item_price[]" type="number" min="0" step="0.01" required><select class="item-tax" name="item_tax[]"><option value="19">19 %</option><option value="7">7 %</option><option value="0">0 %</option></select><output>0,00 €</output><button type="button" class="remove-row" aria-label="Position entfernen">×</button></div></template>
    <?php }

    private static function customersPage(int $orgId): void
    {
        $customers = self::all('SELECT * FROM customers WHERE organization_id=? ORDER BY name', [$orgId]); ?>
        <section class="page-head"><div><p class="eyebrow">Rechnungsempfänger</p><h1>Deine<br><em>Kunden.</em></h1></div></section>
        <section class="grid two customer-layout"><article class="card"><p class="eyebrow">Neuer Kunde</p><h2>Empfänger<br>anlegen.</h2><form method="post" class="form"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="action" value="save_customer"><input type="hidden" name="return_to" value="view=customers"><label>Firmenname / Name<input name="name" required></label><label>E-Mail<input type="email" name="email"></label><label>Straße & Hausnummer<input name="street" required></label><div class="form-grid split"><label>PLZ<input name="postal_code" required></label><label>Ort<input name="city" required></label></div><label>Land<input name="country" value="Deutschland"></label><button class="button">Kunde speichern <b>↗</b></button></form></article><article class="card table-card"><div class="card-head"><div><p class="eyebrow">Gespeichert</p><h2>Empfänger</h2></div></div><div class="customer-list"><?php foreach ($customers as $customer): ?><article><b><?= self::e($customer['name']) ?></b><p><?= self::e($customer['street']) ?><br><?= self::e($customer['postal_code']) ?> <?= self::e($customer['city']) ?></p><small><?= self::e($customer['email'] ?: 'Keine E-Mail') ?></small></article><?php endforeach; if (!$customers): ?><p class="empty">Noch keine Kunden gespeichert.</p><?php endif; ?></div></article></section>
    <?php }

    private static function documentsPage(array $org, int $orgId): void
    {
        $invoices = self::all('SELECT i.*, c.name AS customer_name FROM invoices i LEFT JOIN customers c ON c.id=i.customer_id WHERE i.organization_id=? ORDER BY i.created_at DESC', [$orgId]); ?>
        <section class="page-head"><div><p class="eyebrow">Dokumente</p><h1>Deine<br><em>Rechnungen.</em></h1></div><a class="button" href="?view=new">Neue Rechnung <b>↗</b></a></section>
        <section class="card table-card"><div class="table scroll"><table><thead><tr><th>Nummer</th><th>Empfänger</th><th>Rechnungsdatum</th><th>Netto</th><th>Brutto</th><th>Status</th><th>Dokument</th></tr></thead><tbody><?php foreach ($invoices as $invoice): ?><tr id="invoice-<?= (int) $invoice['id'] ?>"><td><b><?= self::e($invoice['invoice_number'] ?: 'Entwurf') ?></b></td><td><?= self::e($invoice['customer_name'] ?: '—') ?></td><td><?= self::date($invoice['issue_date']) ?></td><td><?= self::money($invoice['net_total']) ?></td><td><?= self::money($invoice['gross_total']) ?></td><td><span class="status <?= $invoice['status'] === 'issued' ? 'ok' : 'draft' ?>"><?= $invoice['status'] === 'issued' ? 'Ausgestellt' : 'Entwurf' ?></span></td><td><?php if ($invoice['status'] === 'issued'): ?><a class="icon-link" href="?view=pdf&id=<?= (int) $invoice['id'] ?>">PDF laden ↗</a><a class="icon-link" target="_blank" href="?view=preview&id=<?= (int) $invoice['id'] ?>">Vorschau ↗</a><?php else: ?><a class="icon-link" href="?view=new&id=<?= (int) $invoice['id'] ?>">Bearbeiten ↗</a><?php endif; ?></td></tr><?php endforeach; if (!$invoices): ?><tr><td colspan="7" class="empty">Noch keine Rechnungen angelegt.</td></tr><?php endif; ?></tbody></table></div></section>
    <?php }

    private static function settingsPage(array $org, array $user): void
    { ?>
        <section class="page-head"><div><p class="eyebrow">Einstellungen</p><h1>Deine Vorlage.<br><em>Dein Auftritt.</em></h1></div></section>
        <form method="post" enctype="multipart/form-data" class="settings-form"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="action" value="save_settings"><input type="hidden" name="return_to" value="view=settings">
          <section class="card form-card"><div class="card-head"><div><p class="eyebrow">Unternehmen</p><h2>Absenderangaben</h2></div></div><div class="form-grid"><label>Firmenname<input name="name" value="<?= self::e($org['name']) ?>" required></label><label>Rechnungs-E-Mail<input type="email" name="email" value="<?= self::e($org['email']) ?>"></label><label>Straße & Hausnummer<input name="street" value="<?= self::e($org['street']) ?>"></label><div class="form-grid split"><label>PLZ<input name="postal_code" value="<?= self::e($org['postal_code']) ?>"></label><label>Ort<input name="city" value="<?= self::e($org['city']) ?>"></label></div><label>Land<input name="country" value="<?= self::e($org['country']) ?>"></label><label>Steuernummer<input name="tax_number" value="<?= self::e($org['tax_number']) ?>"></label><label>Umsatzsteuer-ID<input name="vat_id" value="<?= self::e($org['vat_id']) ?>"></label></div></section>
          <section class="grid two"><article class="card form-card"><p class="eyebrow">Zahlung</p><h2>Bankverbindung</h2><label>IBAN<input name="iban" value="<?= self::e($org['iban']) ?>" placeholder="DE…"></label><label>BIC<input name="bic" value="<?= self::e($org['bic']) ?>"></label><label>Rechnungspräfix<input name="invoice_prefix" value="<?= self::e($org['invoice_prefix']) ?>" maxlength="20" placeholder="RE"></label><p class="hint">Die Nummer wird automatisch fortlaufend vergeben, z. B. RE-2026-0001.</p></article><article class="card form-card"><p class="eyebrow">Design</p><h2>Logo & Farbe</h2><?php if ($org['logo_filename']): ?><img class="logo-preview" src="?action=asset" alt="Aktuelles Logo"><?php endif; ?><label>Logo hochladen <small>PNG oder JPG, max. 3 MB</small><input type="file" name="logo" accept="image/png,image/jpeg"></label><label>Akzentfarbe<input name="accent_color" type="color" value="<?= self::e($org['accent_color'] ?: '#fa5139') ?>"></label><label>Vorlagenstil<select name="template_key"><option value="classic" <?= $org['template_key'] === 'classic' ? 'selected' : '' ?>>Classic · klar & professionell</option><option value="minimal" <?= $org['template_key'] === 'minimal' ? 'selected' : '' ?>>Minimal · zurückhaltend</option><option value="bold" <?= $org['template_key'] === 'bold' ? 'selected' : '' ?>>Bold · markant</option></select></label></article></section>
          <button class="button" type="submit">Vorlage speichern <b>↗</b></button>
        </form>
        <section class="card form-card" id="password"><p class="eyebrow">Sicherheit</p><h2>Passwort ändern</h2><form method="post" class="form narrow"><input type="hidden" name="csrf" value="<?= self::csrf() ?>"><input type="hidden" name="action" value="change_password"><input type="hidden" name="return_to" value="view=settings#password"><label>Aktuelles Passwort<input type="password" name="current_password" required></label><label>Neues Passwort<input type="password" name="new_password" minlength="12" required></label><button class="ghost">Passwort aktualisieren</button></form></section>
    <?php }

    private static function saveSettings(int $orgId): void
    {
        $fields = ['name','email','street','postal_code','city','country','tax_number','vat_id','iban','bic','invoice_prefix','accent_color','template_key']; $values = [];
        foreach ($fields as $field) $values[$field] = trim((string) ($_POST[$field] ?? ''));
        if ($values['name'] === '') throw new RuntimeException('Der Firmenname darf nicht leer sein.');
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $values['accent_color'])) $values['accent_color'] = '#fa5139';
        if (!in_array($values['template_key'], ['classic','minimal','bold'], true)) $values['template_key'] = 'classic';
        $logo = self::one('SELECT logo_filename FROM organizations WHERE id=?', [$orgId]);
        if (!empty($_FILES['logo']['tmp_name'])) $logo['logo_filename'] = self::storeLogo($orgId, $_FILES['logo']);
        self::exec('UPDATE organizations SET name=?,email=?,street=?,postal_code=?,city=?,country=?,tax_number=?,vat_id=?,iban=?,bic=?,invoice_prefix=?,accent_color=?,template_key=?,logo_filename=?,updated_at=NOW() WHERE id=?', [...array_values($values), $logo['logo_filename'], $orgId]);
    }

    private static function storeLogo(int $orgId, array $file): string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || ($file['size'] ?? 0) > 3 * 1024 * 1024) throw new RuntimeException('Logo-Upload fehlgeschlagen oder größer als 3 MB.');
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']); if (!in_array($mime, ['image/jpeg','image/png'], true)) throw new RuntimeException('Bitte nur PNG oder JPG hochladen.');
        self::ensureStorage(); $target = self::storagePath('logos/org-' . $orgId . '.jpg');
        if ($mime === 'image/jpeg') { if (!move_uploaded_file($file['tmp_name'], $target)) throw new RuntimeException('Logo konnte nicht gespeichert werden.'); return basename($target); }
        if (!function_exists('imagecreatefrompng')) throw new RuntimeException('Für PNG-Logos muss in Plesk die PHP-Erweiterung GD aktiviert sein. Bitte JPG verwenden oder GD aktivieren.');
        $image = imagecreatefrompng($file['tmp_name']); if (!$image) throw new RuntimeException('PNG konnte nicht verarbeitet werden.');
        $canvas = imagecreatetruecolor(imagesx($image), imagesy($image)); $white = imagecolorallocate($canvas, 255,255,255); imagefill($canvas, 0,0,$white); imagecopy($canvas,$image,0,0,0,0,imagesx($image),imagesy($image)); imagejpeg($canvas, $target, 88); imagedestroy($image); imagedestroy($canvas); return basename($target);
    }

    private static function saveCustomer(int $orgId): void
    {
        $name = trim((string) ($_POST['name'] ?? '')); $street = trim((string) ($_POST['street'] ?? '')); $postal = trim((string) ($_POST['postal_code'] ?? '')); $city = trim((string) ($_POST['city'] ?? ''));
        if ($name === '' || $street === '' || $postal === '' || $city === '') throw new RuntimeException('Name und vollständige Anschrift werden benötigt.');
        self::exec('INSERT INTO customers (organization_id,name,email,street,postal_code,city,country,created_at) VALUES (?,?,?,?,?,?,?,NOW())', [$orgId, $name, trim((string) ($_POST['email'] ?? '')), $street, $postal, $city, trim((string) ($_POST['country'] ?? 'Deutschland')) ?: 'Deutschland']);
    }

    private static function saveInvoice(int $orgId, int $userId, bool $issue): int
    {
        $customerId = (int) ($_POST['customer_id'] ?? 0); $customer = self::one('SELECT * FROM customers WHERE id=? AND organization_id=?', [$customerId, $orgId]); if (!$customer) throw new RuntimeException('Bitte einen gültigen Rechnungsempfänger auswählen.');
        $titles = $_POST['item_title'] ?? []; $qtys = $_POST['item_qty'] ?? []; $prices = $_POST['item_price'] ?? []; $taxes = $_POST['item_tax'] ?? []; $items = []; $net = 0.0; $tax = 0.0;
        foreach ($titles as $index => $title) { $title = trim((string) $title); if ($title === '') continue; $qty = max(0.001, (float) str_replace(',', '.', (string) ($qtys[$index] ?? 1))); $price = max(0, (float) str_replace(',', '.', (string) ($prices[$index] ?? 0))); $rate = (float) ($taxes[$index] ?? 19); if (!in_array($rate, [0.0,7.0,19.0], true)) $rate = 19.0; $itemNet = round($qty * $price, 2); $itemTax = round($itemNet * $rate / 100, 2); $items[] = compact('title','qty','price','rate','itemNet','itemTax'); $net += $itemNet; $tax += $itemTax; }
        if (!$items) throw new RuntimeException('Mindestens eine Rechnungsposition ist erforderlich.');
        $net = round($net,2); $tax = round($tax,2); $gross = round($net + $tax,2); $id = (int) ($_POST['invoice_id'] ?? 0); $issueDate = self::validDate((string) ($_POST['issue_date'] ?? '')) ?: date('Y-m-d'); $serviceDate = self::validDate((string) ($_POST['service_date'] ?? '')); $dueDate = self::validDate((string) ($_POST['due_date'] ?? ''));
        self::db()->beginTransaction();
        try {
            $existing = $id ? self::one('SELECT * FROM invoices WHERE id=? AND organization_id=? AND status="draft" FOR UPDATE', [$id,$orgId]) : null;
            if ($id && !$existing) throw new RuntimeException('Dieser Entwurf kann nicht mehr verändert werden.');
            if (!$existing) { self::exec('INSERT INTO invoices (organization_id,customer_id,status,issue_date,service_date,due_date,note,footer,net_total,tax_total,gross_total,created_at) VALUES (?,?,"draft",?,?,?,?,?,?,?,?,NOW())', [$orgId,$customerId,$issueDate,$serviceDate,$dueDate,trim((string) ($_POST['note'] ?? '')),trim((string) ($_POST['footer'] ?? '')),$net,$tax,$gross]); $id=(int)self::db()->lastInsertId(); }
            else { self::exec('UPDATE invoices SET customer_id=?,issue_date=?,service_date=?,due_date=?,note=?,footer=?,net_total=?,tax_total=?,gross_total=?,updated_at=NOW() WHERE id=?', [$customerId,$issueDate,$serviceDate,$dueDate,trim((string) ($_POST['note'] ?? '')),trim((string) ($_POST['footer'] ?? '')),$net,$tax,$gross,$id]); self::exec('DELETE FROM invoice_items WHERE invoice_id=?',[$id]); }
            foreach ($items as $position => $item) self::exec('INSERT INTO invoice_items (invoice_id,position_no,title,quantity,unit_price,tax_rate,net_total,tax_total,gross_total) VALUES (?,?,?,?,?,?,?,?,?)',[$id,$position+1,$item['title'],$item['qty'],$item['price'],$item['rate'],$item['itemNet'],$item['itemTax'],$item['itemNet']+$item['itemTax']]);
            if ($issue) {
                $org = self::one('SELECT * FROM organizations WHERE id=? FOR UPDATE',[$orgId]); $counter=(int)$org['invoice_counter']+1; $number=(trim($org['invoice_prefix']) ?: 'RE') . '-' . date('Y',strtotime($issueDate)) . '-' . str_pad((string)$counter,4,'0',STR_PAD_LEFT);
                $snapshot=['organization'=>$org,'customer'=>$customer,'items'=>$items,'issue_date'=>$issueDate,'service_date'=>$serviceDate,'due_date'=>$dueDate,'note'=>trim((string) ($_POST['note'] ?? '')),'footer'=>trim((string) ($_POST['footer'] ?? '')),'number'=>$number,'net'=>$net,'tax'=>$tax,'gross'=>$gross];
                self::exec('UPDATE organizations SET invoice_counter=?,updated_at=NOW() WHERE id=?',[$counter,$orgId]); self::exec('UPDATE invoices SET invoice_number=?,status="issued",snapshot=?,issued_at=NOW(),updated_at=NOW() WHERE id=?',[$number,json_encode($snapshot,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$id]);
            }
            self::audit($orgId,$userId,$issue ? 'invoice_issued' : 'invoice_draft_saved',['invoice_id'=>$id]); self::db()->commit();
        } catch(Throwable $e) { self::db()->rollBack(); throw $e; }
        if ($issue) self::generatePdf($orgId,$id); return $id;
    }

    private static function generatePdf(int $orgId, int $invoiceId): void
    {
        $invoice = self::one('SELECT * FROM invoices WHERE id=? AND organization_id=? AND status="issued"', [$invoiceId,$orgId]); if (!$invoice) throw new RuntimeException('Rechnung nicht gefunden.');
        $data = json_decode((string) $invoice['snapshot'], true); if (!is_array($data)) throw new RuntimeException('Rechnungsdaten sind nicht vollständig.');
        $pdf = new PrachtInvoicePdf(); $content = []; $page = $pdf->newPage(); $accent = self::hexRgb($data['organization']['accent_color'] ?? '#fa5139');
        $pdf->text($page, 42, 796, 9, 'RECHNUNG', [0.45,0.43,0.39]);
        $pdf->text($page, 42, 747, 30, (string) $data['number'], [0.08,0.08,0.07], 'bold');
        $logo = self::storagePath('logos/' . ($data['organization']['logo_filename'] ?? '')); if (is_file($logo)) $pdf->image($page, $logo, 420, 754, 125, 48);
        $pdf->line($page, 42, 720, 553, 720, $accent);
        $sender = array_filter([$data['organization']['name'] ?? '', $data['organization']['street'] ?? '', trim(($data['organization']['postal_code'] ?? '') . ' ' . ($data['organization']['city'] ?? '')), $data['organization']['country'] ?? '']);
        $customer = array_filter([$data['customer']['name'] ?? '', $data['customer']['street'] ?? '', trim(($data['customer']['postal_code'] ?? '') . ' ' . ($data['customer']['city'] ?? '')), $data['customer']['country'] ?? '']);
        $pdf->block($page, 42, 690, $sender, 8, [0.33,0.31,0.28]); $pdf->block($page, 312, 690, $customer, 10, [0.08,0.08,0.07]);
        $meta = [['Rechnungsdatum', self::date((string)$data['issue_date'])], ['Leistungsdatum', self::date((string)($data['service_date'] ?: $data['issue_date']))], ['Zahlbar bis', self::date((string)($data['due_date'] ?: $data['issue_date']))]]; $y=598;
        foreach ($meta as [$label,$value]) { $pdf->text($page,42,$y,7,$label,[0.45,0.43,0.39]); $pdf->text($page,150,$y,8,$value,[0.08,0.08,0.07]); $y-=17; }
        $y = 518; $pdf->rect($page,42,$y,511,24,[0.08,0.08,0.07],true); $pdf->text($page,50,$y+8,7,'LEISTUNG',[1,1,1],'bold'); $pdf->text($page,342,$y+8,7,'MENGE',[1,1,1],'bold'); $pdf->text($page,400,$y+8,7,'EINZELPREIS',[1,1,1],'bold'); $pdf->text($page,512,$y+8,7,'NETTO',[1,1,1],'bold'); $y-=24;
        foreach ($data['items'] as $position => $item) {
            if ($y < 175) { $page=$pdf->newPage(); $y=786; $pdf->rect($page,42,$y,511,24,[0.08,0.08,0.07],true); $pdf->text($page,50,$y+8,7,'LEISTUNG',[1,1,1],'bold'); $pdf->text($page,342,$y+8,7,'MENGE',[1,1,1],'bold'); $pdf->text($page,400,$y+8,7,'EINZELPREIS',[1,1,1],'bold'); $pdf->text($page,512,$y+8,7,'NETTO',[1,1,1],'bold'); $y-=24; }
            $pdf->text($page,50,$y+7,8,(string)($position+1) . '. ' . self::limit((string)$item['title'],54),[0.08,0.08,0.07]); $pdf->text($page,342,$y+7,8,self::decimal($item['qty']),[0.08,0.08,0.07]); $pdf->text($page,400,$y+7,8,self::pdfMoney($item['price']),[0.08,0.08,0.07]); $pdf->text($page,512,$y+7,8,self::pdfMoney($item['itemNet']),[0.08,0.08,0.07]); $pdf->line($page,42,$y,553,$y,[0.82,0.80,0.76]); $y-=27;
        }
        if ($y < 170) { $page=$pdf->newPage(); $y=735; }
        $pdf->line($page,345,$y-3,553,$y-3,[0.12,0.11,0.10]); $pdf->text($page,382,$y-23,9,'Netto',[0.25,0.23,0.21]); $pdf->text($page,512,$y-23,9,self::pdfMoney($data['net']),[0.08,0.08,0.07]); $pdf->text($page,382,$y-43,9,'Umsatzsteuer',[0.25,0.23,0.21]); $pdf->text($page,512,$y-43,9,self::pdfMoney($data['tax']),[0.08,0.08,0.07]); $pdf->rect($page,345,$y-78,208,25,$accent,true); $pdf->text($page,382,$y-69,10,'Gesamt',[0.06,0.06,0.05],'bold'); $pdf->text($page,512,$y-69,10,self::pdfMoney($data['gross']),[0.06,0.06,0.05],'bold');
        $noteY=$y-118; if (!empty($data['note'])) { $pdf->text($page,42,$noteY,8,'Hinweis',[0.45,0.43,0.39],'bold'); $pdf->wrapped($page,42,$noteY-16,280,(string)$data['note'],8,[0.16,0.15,0.14]); }
        $footer = trim((string)($data['footer'] ?? '')); $bank = array_filter(['IBAN: ' . ($data['organization']['iban'] ?? ''), 'BIC: ' . ($data['organization']['bic'] ?? '')]); $legal = array_filter(['Steuernummer: ' . ($data['organization']['tax_number'] ?? ''), 'USt-IdNr.: ' . ($data['organization']['vat_id'] ?? '')]);
        $pdf->line($page,42,72,553,72,[0.75,0.73,0.69]); $pdf->wrapped($page,42,55,230,$footer,7,[0.34,0.32,0.29]); $pdf->block($page,308,55,$bank,7,[0.34,0.32,0.29]); $pdf->block($page,442,55,$legal,7,[0.34,0.32,0.29]);
        $filename = 'rechnung-' . preg_replace('/[^A-Za-z0-9_-]+/', '-', (string)$data['number']) . '.pdf'; $path = self::storagePath('pdf/' . $orgId . '-' . $invoiceId . '.pdf'); self::ensureStorage(); file_put_contents($path,$pdf->output()); self::exec('UPDATE invoices SET pdf_filename=?,pdf_hash=? WHERE id=?',[$filename,hash_file('sha256',$path),$invoiceId]);
    }

    private static function downloadPdf(int $orgId, int $id): void
    {
        $invoice = self::one('SELECT * FROM invoices WHERE id=? AND organization_id=? AND status="issued"',[$id,$orgId]); if (!$invoice) { http_response_code(404); self::messagePage('PDF nicht gefunden','Diese Rechnung steht nicht zur Verfügung.'); return; }
        $path=self::storagePath('pdf/' . $orgId . '-' . $id . '.pdf'); if (!is_file($path)) self::generatePdf($orgId,$id); if (!is_file($path)) throw new RuntimeException('PDF konnte nicht erzeugt werden.');
        header('Content-Type: application/pdf'); header('Content-Disposition: attachment; filename="' . self::e($invoice['pdf_filename'] ?: 'rechnung.pdf') . '"'); header('Content-Length: ' . filesize($path)); readfile($path); exit;
    }

    private static function invoicePreview(int $orgId, int $id, array $org): void
    {
        $invoice = self::one('SELECT i.*, c.name AS customer_name,c.street AS customer_street,c.postal_code AS customer_postal,c.city AS customer_city,c.country AS customer_country FROM invoices i LEFT JOIN customers c ON c.id=i.customer_id WHERE i.id=? AND i.organization_id=? AND i.status="issued"',[$id,$orgId]); if (!$invoice) { self::messagePage('Nicht verfügbar','Nur final ausgestellte Rechnungen können angezeigt werden.'); return; } $items=self::all('SELECT * FROM invoice_items WHERE invoice_id=? ORDER BY position_no',[$id]);
        ?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= self::e($invoice['invoice_number']) ?></title><style>body{margin:0;background:#e9e7e1;color:#171614;font-family:Arial,sans-serif}.paper{box-sizing:border-box;width:210mm;min-height:297mm;margin:20px auto;padding:19mm;background:#fff;box-shadow:0 8px 40px #0002}.top{display:flex;justify-content:space-between;border-bottom:2px solid <?= self::e($org['accent_color']) ?>;padding-bottom:8mm}.logo{max-width:45mm;max-height:20mm;object-fit:contain}.k{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#777}.number{font-size:28px;font-weight:700;margin:6mm 0}.addresses{display:grid;grid-template-columns:1fr 1fr;gap:30mm;margin:13mm 0;font-size:11px;line-height:1.5}.meta{font-size:10px;line-height:1.8;margin:7mm 0 12mm}table{width:100%;border-collapse:collapse;font-size:10px}th{padding:3mm;text-align:left;background:#171614;color:#fff;font-size:8px;letter-spacing:.08em}td{padding:3mm;border-bottom:1px solid #ddd}.num{text-align:right}.total{width:75mm;margin:8mm 0 0 auto;font-size:10px}.total div{display:flex;justify-content:space-between;padding:2mm}.total b{background:<?= self::e($org['accent_color']) ?>;padding:3mm;margin-top:2mm}.foot{position:fixed;bottom:16mm;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:8mm;font-size:8px;color:#555;border-top:1px solid #ddd;padding-top:4mm;width:172mm;line-height:1.4}@media print{body{background:#fff}.paper{margin:0;box-shadow:none}.no-print{display:none}}</style></head><body><div class="paper"><button class="no-print" onclick="window.print()">Drucken</button><div class="top"><div><p class="k">Rechnung</p><h1 class="number"><?= self::e($invoice['invoice_number']) ?></h1></div><?php if($org['logo_filename']): ?><img class="logo" src="?action=asset" alt="Logo"><?php endif; ?></div><div class="addresses"><div class="k"><?= self::e($org['name']) ?><br><?= nl2br(self::e(trim(($org['street']??'').'\n'.($org['postal_code']??'').' '.($org['city']??'')))) ?></div><div><b><?= self::e($invoice['customer_name']) ?></b><br><?= self::e($invoice['customer_street']) ?><br><?= self::e($invoice['customer_postal']) ?> <?= self::e($invoice['customer_city']) ?><br><?= self::e($invoice['customer_country']) ?></div></div><div class="meta">Rechnungsdatum: <?= self::date($invoice['issue_date']) ?><br>Leistungsdatum: <?= self::date($invoice['service_date'] ?: $invoice['issue_date']) ?><br>Zahlbar bis: <?= self::date($invoice['due_date'] ?: $invoice['issue_date']) ?></div><table><thead><tr><th>Leistung</th><th class="num">Menge</th><th class="num">Einzelpreis</th><th class="num">Netto</th></tr></thead><tbody><?php foreach($items as $item): ?><tr><td><?= self::e($item['title']) ?></td><td class="num"><?= self::decimal($item['quantity']) ?></td><td class="num"><?= self::money($item['unit_price']) ?></td><td class="num"><?= self::money($item['net_total']) ?></td></tr><?php endforeach; ?></tbody></table><div class="total"><div><span>Netto</span><span><?= self::money($invoice['net_total']) ?></span></div><div><span>Umsatzsteuer</span><span><?= self::money($invoice['tax_total']) ?></span></div><div><b>Gesamt</b><b><?= self::money($invoice['gross_total']) ?></b></div></div><?php if($invoice['note']): ?><p style="margin-top:16mm;font-size:10px"><b>Hinweis</b><br><?= nl2br(self::e($invoice['note'])) ?></p><?php endif; ?><div class="foot"><div><?= nl2br(self::e($invoice['footer'] ?: 'Vielen Dank für Ihr Vertrauen.')) ?></div><div>IBAN: <?= self::e($org['iban']) ?><br>BIC: <?= self::e($org['bic']) ?></div><div>Steuernummer: <?= self::e($org['tax_number']) ?><br>USt-IdNr.: <?= self::e($org['vat_id']) ?></div></div></div></body></html><?php
    }

    private static function serveAsset(): void
    {
        $user=self::user(); if(!$user || !$user['organization_id']) { http_response_code(403); exit; } $org=self::one('SELECT logo_filename FROM organizations WHERE id=?',[(int)$user['organization_id']]); $file=$org ? self::storagePath('logos/' . $org['logo_filename']) : ''; if(!$file || !is_file($file)){http_response_code(404);exit;} header('Content-Type: image/jpeg'); header('Cache-Control: private, max-age=86400'); readfile($file); exit;
    }

    private static function layout(string $title, string $surface, array $user, callable $content): void
    {
        $accent = $surface === 'control' ? '#fa5139' : '#766aff'; ?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="<?= $accent ?>"><title><?= self::e($title) ?></title><style><?= self::styles() ?></style></head><body class="<?= self::e($surface) ?>"><div class="grain"></div><?php $content(); ?><script><?= self::script() ?></script></body></html><?php
    }

    private static function loginPage(string $surface): void
    {
        $title = $surface === 'control' ? 'Pracht Control' : 'Pracht Invoice'; $copy = $surface === 'control' ? 'Steuere Mandanten, Zugänge und Rechnungswerte zentral.' : 'Erstelle, speichere und lade professionelle Rechnungen herunter.'; self::layout($title, $surface, [], function () use ($title,$copy,$surface) { ?>
          <main class="login"><section><p class="eyebrow">Geschützter Bereich</p><h1><?= self::e($title) ?><br><em><?= $surface === 'control' ? 'Zentrale.' : 'Rechnungen.' ?></em></h1><p><?= self::e($copy) ?></p><?= self::flashHtml() ?><form method="post" class="form"><input type="hidden" name="action" value="login"><label>E-Mail<input type="email" name="email" autocomplete="email" required></label><label>Passwort<input type="password" name="password" autocomplete="current-password" required></label><button class="button">Anmelden <b>↗</b></button></form><?php if($surface==='invoice'): ?><small>Deinen Zugang erhältst du von Pracht Performance.</small><?php endif; ?></section></main>
        <?php });
    }

    private static function installPage(array $errors): void
    { ?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pracht Invoice Installation</title><style><?= self::styles() ?></style></head><body class="control"><main class="login"><section><p class="eyebrow">Pracht Invoice / Plesk</p><h1>Installation<br><em>starten.</em></h1><?php if($errors): ?><div class="flash error"><b>Bitte prüfen:</b><ul><?php foreach($errors as $error): ?><li><?= self::e($error) ?></li><?php endforeach; ?></ul></div><?php endif; ?><p>Die Installation legt nur die Datenbankstruktur und deinen ersten Pracht-Control-Admin an.</p><form method="post" class="form"><label>Installationsschlüssel<input type="password" name="install_key" required></label><label>Dein Name<input name="admin_name" required></label><label>Admin-E-Mail<input type="email" name="admin_email" required></label><label>Admin-Passwort <small>mindestens 12 Zeichen</small><input type="password" name="admin_password" minlength="12" required></label><button class="button" <?= $errors ? 'disabled' : '' ?>>Installieren <b>↗</b></button></form></section></main></body></html><?php }

    private static function messagePage(string $title, string $text): void
    { ?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= self::e($title) ?></title><style><?= self::styles() ?></style></head><body class="control"><main class="login"><section><p class="eyebrow">Pracht Invoice</p><h1><?= self::e($title) ?><em>.</em></h1><p><?= self::e($text) ?></p></section></main></body></html><?php }

    private static function one(string $sql, array $params=[]): ?array { $statement=self::db()->prepare($sql);$statement->execute($params);$row=$statement->fetch();return $row ?: null; }
    private static function all(string $sql, array $params=[]): array { $statement=self::db()->prepare($sql);$statement->execute($params);return $statement->fetchAll(); }
    private static function exec(string $sql, array $params=[]): void { $statement=self::db()->prepare($sql);$statement->execute($params); }
    private static function audit(?int $orgId, ?int $userId, string $event, array $context=[]): void { self::exec('INSERT INTO audit_logs (organization_id,user_id,event,context_json,created_at) VALUES (?,?,?,?,NOW())',[$orgId,$userId,$event,json_encode($context,JSON_UNESCAPED_UNICODE)]); }
    private static function csrf(): string { if(empty($_SESSION['suite_csrf'])) $_SESSION['suite_csrf']=bin2hex(random_bytes(32)); return $_SESSION['suite_csrf']; }
    private static function verifyCsrf(): void { if(!hash_equals((string)($_SESSION['suite_csrf']??''),(string)($_POST['csrf']??''))) throw new RuntimeException('Die Sitzung ist abgelaufen. Bitte Seite neu laden.'); }
    private static function flash(string $message, string $type='success'): void { $_SESSION['suite_flash']=[$type,$message]; }
    private static function flashHtml(): string { $flash=$_SESSION['suite_flash']??null;unset($_SESSION['suite_flash']);return $flash?'<div class="flash '.self::e($flash[0]).'">'.self::e($flash[1]).'</div>':''; }
    private static function redirect(string $query): never { $target='?' . ltrim($query,'?'); header('Location: ' . $target, true, 303); exit; }
    private static function e(mixed $value): string { return htmlspecialchars((string)$value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
    private static function money(mixed $value): string { return number_format((float)$value,2,',','.') . ' €'; }
    private static function pdfMoney(mixed $value): string { return number_format((float)$value,2,',','.') . ' EUR'; }
    private static function decimal(mixed $value): string { return rtrim(rtrim(number_format((float)$value,3,',','.'),'0'),','); }
    private static function date(?string $date): string { if(!$date)return '—';try{return (new DateTime($date))->format('d.m.Y');}catch(Throwable){return '—';} }
    private static function validDate(string $value): ?string { $date=DateTime::createFromFormat('Y-m-d',$value);return $date&&$date->format('Y-m-d')===$value?$value:null; }
    private static function limit(string $text,int $length): string { return mb_strlen($text)>$length?mb_substr($text,0,$length-1).'…':$text; }
    private static function hexRgb(string $hex): array { $hex=ltrim($hex,'#');if(!preg_match('/^[0-9a-f]{6}$/i',$hex))$hex='fa5139';return [hexdec(substr($hex,0,2))/255,hexdec(substr($hex,2,2))/255,hexdec(substr($hex,4,2))/255]; }
    private static function storagePath(string $path=''): string { return __DIR__ . '/storage/' . ltrim($path,'/'); }
    private static function ensureStorage(): void { foreach(['','logos','pdf'] as $directory){$path=self::storagePath($directory);if(!is_dir($path))@mkdir($path,0750,true);} }

    private static function script(): string { return <<<'JS'
const rows=document.querySelector('#position-rows'),template=document.querySelector('#position-template'),add=document.querySelector('#add-row');
function money(value){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(value||0)}
function calc(){let net=0,tax=0;document.querySelectorAll('.position-row').forEach(row=>{const q=parseFloat(row.querySelector('.item-qty')?.value)||0,p=parseFloat(row.querySelector('.item-price')?.value)||0,t=parseFloat(row.querySelector('.item-tax')?.value)||0,n=q*p;net+=n;tax+=n*t/100;const output=row.querySelector('output');if(output)output.value=money(n)});const n=document.querySelector('#net-total'),t=document.querySelector('#tax-total'),g=document.querySelector('#gross-total');if(n)n.textContent=money(net);if(t)t.textContent=money(tax);if(g)g.textContent=money(net+tax)}
if(add&&template&&rows)add.addEventListener('click',()=>{rows.append(template.content.cloneNode(true));calc()});document.addEventListener('input',calc);document.addEventListener('change',calc);document.addEventListener('click',event=>{if(event.target.closest('.remove-row')){const row=event.target.closest('.position-row');if(document.querySelectorAll('.position-row').length>1)row.remove();calc()}});calc();
JS; }

    private static function styles(): string { return <<<'CSS'
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');
:root{--ink:#171614;--paper:#f0eee8;--line:#bbb6ac;--muted:#716d65;--accent:#fa5139;--purple:#766aff;font-family:Manrope,Arial,sans-serif;color:var(--ink)}*{box-sizing:border-box}body{margin:0;background:var(--paper);font-size:14px}.invoice{--accent:var(--purple)}button,input,select,textarea{font:inherit}.grain{position:fixed;inset:0;z-index:-1;opacity:.03;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}.eyebrow{margin:0;color:var(--muted);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase}.hero,.invoice-hero,.page-head{display:flex;align-items:end;justify-content:space-between;gap:30px;max-width:1380px;margin:0 auto;padding:58px 34px 36px}.hero h1,.invoice-hero h1,.page-head h1,.login h1{margin:15px 0;font-size:clamp(48px,7vw,100px);line-height:.76;letter-spacing:-.1em}.hero h1 em,.invoice-hero h1 em,.page-head h1 em,.login h1 em,.card h2 em{font-family:'Playfair Display',serif;font-weight:500;color:var(--accent)}.hero>p:last-child,.invoice-hero p{max-width:420px;margin:0;color:#57534c;line-height:1.6}.metrics{display:grid;grid-template-columns:repeat(4,1fr);max-width:1380px;margin:0 auto 18px;padding:0 34px}.metrics article{min-height:152px;padding:18px;border:1px solid var(--ink);border-left:0;background:#f8f7f3}.metrics article:first-child{border-left:1px solid var(--ink)}.metrics span,.metrics small{display:block;font-size:11px}.metrics span{color:#57534c}.metrics strong{display:block;margin:30px 0 7px;font-size:clamp(28px,3vw,48px);line-height:.8;letter-spacing:-.09em}.metrics small{color:#527b62}.grid{display:grid;gap:18px;max-width:1380px;margin:18px auto;padding:0 34px}.grid.two{grid-template-columns:1fr 1fr}.card{border:1px solid var(--ink);background:#f8f7f3;padding:22px}.card.dark{background:var(--ink);color:var(--paper)}.card.dark .eyebrow{color:#aaa59c}.card h2{margin:10px 0 22px;font-size:clamp(25px,3vw,44px);line-height:.84;letter-spacing:-.08em}.card-copy{max-width:400px;color:#57534c;line-height:1.65}.accent{background:var(--accent);color:#171614}.accent .eyebrow{color:#733027}.card-head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin:-22px -22px 20px;padding:20px 22px;border-bottom:1px solid var(--ink)}.card-head h2{margin:8px 0 0;font-size:26px}.button,.ghost,.text-link,.link-button{display:inline-flex;justify-content:space-between;align-items:center;gap:28px;min-height:43px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);padding:0 13px;font-weight:800;font-size:11px;text-decoration:none;cursor:pointer}.button:hover{background:var(--accent);border-color:var(--accent);color:var(--ink)}.button.light{background:transparent;border-color:#171614;color:#171614}.ghost{background:transparent;color:var(--ink);min-height:35px;font-size:10px}.ghost:hover{background:var(--ink);color:var(--paper)}.text-link{padding:0;min-height:0;border:0;background:transparent;color:var(--ink)}.link-button{display:block;min-height:0;border:0;background:transparent;color:var(--ink);padding:5px 0;font-size:10px}.steps{margin:18px 0;padding:0;list-style:none}.steps li{display:flex;gap:11px;padding:11px 0;border-bottom:1px solid color-mix(in srgb,currentColor 20%,transparent);font-size:12px}.steps b{color:var(--accent);font-family:'DM Mono',monospace;font-size:10px}.accent .steps b{color:#733027}.table-card{max-width:1380px;margin:18px auto;padding:0}.table{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:15px 18px;border-bottom:1px solid #d0cbc2;font-size:12px;white-space:nowrap}th{color:var(--muted);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase}td b,td small{display:block}td small{margin-top:4px;color:var(--muted);font-size:10px}.empty{padding:30px!important;color:var(--muted);text-align:center}.status{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;text-transform:uppercase}.status:before{content:'';width:6px;aspect-ratio:1;border-radius:50%;background:currentColor}.status.ok{color:#34815b}.status.off{color:#b53d33}.status.draft{color:#8b6425}.icon-link{display:block;color:var(--ink);font-size:10px;font-weight:800;text-decoration:none;margin:4px 0}.portal-header{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:78px;padding:14px clamp(18px,4vw,60px);border-bottom:1px solid var(--ink);background:#f7f6f2}.portal-brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none}.portal-brand>span{display:grid;place-items:center;width:35px;height:35px;background:var(--accent);color:#171614;font-family:'Playfair Display',serif;font-size:17px}.portal-brand b{font-size:12px}.portal-brand small{display:block;margin-top:2px;color:var(--muted);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.1em;text-transform:uppercase}.portal-header nav{display:flex;gap:5px}.portal-header nav a{padding:9px 11px;color:#514e48;font-size:11px;font-weight:700;text-decoration:none}.portal-header nav a:hover,.portal-header nav a.active{background:var(--ink);color:var(--paper)}.user-menu{position:relative}.user-menu summary{cursor:pointer;font-size:11px;font-weight:800;list-style:none}.user-menu[open]{background:var(--ink);padding:10px;color:var(--paper)}.user-menu a{display:block;margin-top:10px;color:var(--paper);font-size:10px}.portal-main{padding-bottom:55px}.invoice-hero{padding-top:46px}.form{display:grid;gap:13px}.form label{display:grid;gap:6px;color:#514e48;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.04em}.form label small{font-family:Manrope,Arial,sans-serif;font-size:9px;letter-spacing:0}.form input,.form select,.form textarea,.invoice-form input,.invoice-form select,.invoice-form textarea{width:100%;min-height:44px;border:1px solid #9e998f;background:#fff;color:var(--ink);padding:10px;outline:none}.form textarea,.invoice-form textarea{min-height:90px;resize:vertical}.form input:focus,.form select:focus,.form textarea:focus,.invoice-form input:focus,.invoice-form select:focus,.invoice-form textarea:focus{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 18%,transparent)}.hint{margin:0;color:var(--muted);font-size:10px;line-height:1.5}.narrow{max-width:440px}.form-card{max-width:1380px;margin:18px auto}.settings-form{max-width:1380px;margin:0 auto;padding:0 34px}.settings-form>.card,.settings-form>.grid{padding-left:0;padding-right:0}.settings-form>.button{margin:0 0 18px}.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.form-grid.one{grid-template-columns:1fr}.form-grid.split{grid-template-columns:100px 1fr}.form-grid label{display:grid;gap:6px;color:#514e48;font-family:'DM Mono',monospace;font-size:10px}.logo-preview{display:block;max-width:190px;max-height:75px;object-fit:contain;margin:8px 0 16px;padding:8px;background:#fff;border:1px solid #d0cbc2}.page-head{padding-top:44px}.invoice-form{max-width:1380px;margin:0 auto;padding:0 34px}.position-head,.position-row{display:grid;grid-template-columns:minmax(180px,1fr) 85px 135px 75px 110px 28px;gap:8px;align-items:center}.position-head{padding:0 0 8px;color:var(--muted);font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase}.position-row{padding:8px 0;border-top:1px solid #d0cbc2}.position-row input,.position-row select{min-width:0}.position-row output{font-size:11px;font-weight:700;text-align:right}.remove-row{width:26px;height:26px;border:0;background:transparent;color:#8b372f;font-size:20px;cursor:pointer}.totals{display:grid;justify-content:end;gap:8px;margin-top:20px}.totals span,.totals strong{display:flex;justify-content:space-between;gap:50px;min-width:250px;font-size:12px}.totals strong{margin-top:3px;padding:12px;background:var(--accent);color:#171614;font-size:14px}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin:18px 0}.customer-layout{align-items:start}.customer-list{margin:0 -22px -22px}.customer-list article{padding:15px 22px;border-top:1px solid #d0cbc2}.customer-list b{font-size:12px}.customer-list p{margin:5px 0;color:#514e48;font-size:11px;line-height:1.5}.customer-list small{color:var(--muted);font-size:10px}.notice,.flash{max-width:1312px;margin:0 auto 18px;padding:12px 14px;background:#e5e0d6;color:#504c45;font-size:11px}.notice a{color:var(--ink);font-weight:800}.flash.success{background:#dceee2;color:#255d3e}.flash.error{background:#f3d9d4;color:#862c23}.flash ul{margin:7px 0 0;padding-left:17px}.compact{display:flex;gap:8px;align-items:center}.compact input{max-width:160px;min-height:28px;padding:4px;border:1px solid #aaa59c;font-size:10px}.login{display:grid;min-height:100svh;place-items:center;padding:24px;background:var(--ink);color:var(--paper)}.login section{width:min(100%,560px);padding:clamp(30px,6vw,68px);border:1px solid #595650;background:#272622}.login .eyebrow{color:#aaa59c}.login p{max-width:390px;color:#bbb5aa;line-height:1.65}.login h1{font-size:clamp(52px,7vw,85px)}.login .form{margin-top:32px}.login .form label{color:#bbb5aa}.login .form input{background:transparent;border-color:#736f67;color:var(--paper)}.login small{display:block;margin-top:18px;color:#aaa59c;font-size:10px}.login .flash{margin:20px 0 0}.login .button{margin-top:6px}.login .button:hover{background:var(--accent);color:var(--ink)}details summary{font-size:10px;cursor:pointer}.portal-header .user-menu a{font-weight:600;text-decoration:none}@media(max-width:900px){.metrics{grid-template-columns:repeat(2,1fr)}.metrics article:nth-child(3){border-left:1px solid var(--ink)}.grid.two{grid-template-columns:1fr}.portal-header{flex-wrap:wrap}.portal-header nav{order:3;width:100%;overflow:auto}.invoice-hero,.hero,.page-head{padding-left:18px;padding-right:18px}.metrics,.grid,.invoice-form,.settings-form{padding-left:18px;padding-right:18px}.position-head{display:none}.position-row{grid-template-columns:1fr 1fr 1fr 60px 25px}.position-row input:first-child{grid-column:1/-1}.position-row output{display:none}.form-grid{grid-template-columns:1fr}.settings-form>.card,.settings-form>.grid{padding-left:0;padding-right:0}}@media(max-width:540px){.hero,.invoice-hero,.page-head{display:block;padding-top:34px}.hero .button,.invoice-hero .button,.page-head .button{margin-top:12px}.metrics{padding:0 18px}.metrics article{min-height:128px;padding:14px}.metrics strong{margin-top:23px}.card{padding:17px}.card-head{margin:-17px -17px 17px;padding:16px 17px}.table-card{margin-left:18px;margin-right:18px}.grid{gap:14px}.form-actions{display:grid}.form-actions>*{justify-content:space-between}.position-row{grid-template-columns:1fr 1fr 60px 25px}.position-row input:nth-child(2),.position-row input:nth-child(3){grid-column:auto}.position-row select{grid-column:auto}.totals span,.totals strong{min-width:100%}.portal-header nav a{font-size:10px;padding:8px}.portal-brand b{max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
CSS; }
}

final class PrachtInvoicePdf
{
    private array $objects=[]; private array $pages=[]; private ?int $fontId=null; private ?int $imageId=null;
    public function newPage(): int { $this->pages[]=''; return count($this->pages)-1; }
    public function text(int $page,float $x,float $y,float $size,string $text,array $color=[0,0,0],string $weight=''): void { $font=$weight==='bold'?'F2':'F1'; $this->pages[$page].=sprintf("q %.3F %.3F %.3F rg BT /%s %.2F Tf %.2F %.2F Td (%s) Tj ET Q\n",$color[0],$color[1],$color[2],$font,$size,$x,$y,$this->escape($text)); }
    public function line(int $page,float $x1,float $y1,float $x2,float $y2,array $color): void { $this->pages[$page].=sprintf("q %.3F %.3F %.3F RG 0.7 w %.2F %.2F m %.2F %.2F l S Q\n",$color[0],$color[1],$color[2],$x1,$y1,$x2,$y2); }
    public function rect(int $page,float $x,float $y,float $w,float $h,array $color,bool $fill=false): void { $this->pages[$page].=sprintf("q %.3F %.3F %.3F %s %.2F %.2F %.2F %.2F re %s Q\n",$color[0],$color[1],$color[2],$fill?'rg':'RG',$x,$y,$w,$h,$fill?'f':'S'); }
    public function block(int $page,float $x,float $y,array $lines,float $size,array $color): void { foreach($lines as $line){$this->text($page,$x,$y,$size,(string)$line,$color);$y-=($size+4);} }
    public function wrapped(int $page,float $x,float $y,float $width,string $text,float $size,array $color): void { $max=max(15,(int)($width/($size*.52)));foreach(explode("\n",wordwrap($text,$max,"\n",true)) as $line){$this->text($page,$x,$y,$size,$line,$color);$y-=($size+4);} }
    public function image(int $page,string $path,float $x,float $y,float $maxW,float $maxH): void { $info=@getimagesize($path);if(!$info||($info[2]??0)!==IMAGETYPE_JPEG)return;if($this->imageId===null){$data=file_get_contents($path);$this->imageId=$this->add("<< /Type /XObject /Subtype /Image /Width {$info[0]} /Height {$info[1]} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($data)." >>\nstream\n".$data."\nendstream");}$ratio=min($maxW/$info[0],$maxH/$info[1]);$w=$info[0]*$ratio;$h=$info[1]*$ratio;$this->pages[$page].=sprintf("q %.2F 0 0 %.2F %.2F %.2F cm /Im1 Do Q\n",$w,$h,$x,$y); }
    public function output(): string { $pagesId=$this->add('');$fontRegular=$this->add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');$fontBold=$this->add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');$kids=[];foreach($this->pages as $content){$contentId=$this->add('<< /Length '.strlen($content)." >>\nstream\n".$content."endstream");$resources='<< /Font << /F1 '.$fontRegular.' 0 R /F2 '.$fontBold.' 0 R >>';if($this->imageId)$resources.=' /XObject << /Im1 '.$this->imageId.' 0 R >>';$resources.=' >>';$kids[]=$this->add('<< /Type /Page /Parent '.$pagesId.' 0 R /MediaBox [0 0 595 842] /Resources '.$resources.' /Contents '.$contentId.' 0 R >>');}$this->objects[$pagesId-1]='<< /Type /Pages /Kids ['.implode(' 0 R ',$kids).' 0 R] /Count '.count($kids).' >>';$catalog=$this->add('<< /Type /Catalog /Pages '.$pagesId.' 0 R >>');$pdf="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";$offsets=[0];foreach($this->objects as $i=>$object){$offsets[$i+1]=strlen($pdf);$pdf.=($i+1)." 0 obj\n".$object."\nendobj\n";}$xref=strlen($pdf);$pdf.='xref' . "\n0 " . (count($this->objects)+1) . "\n0000000000 65535 f \n";for($i=1;$i<count($offsets);$i++)$pdf.=sprintf('%010d 00000 n ' . "\n",$offsets[$i]);$pdf.='trailer << /Size '.(count($this->objects)+1).' /Root '.$catalog.' 0 R >>' . "\nstartxref\n".$xref."\n%%EOF";return $pdf; }
    private function add(string $object): int { $this->objects[]=$object;return count($this->objects); }
    private function escape(string $value): string { return str_replace(['\\','(',')',"\r","\n"],['\\\\','\\(','\\)','',''],iconv('UTF-8','Windows-1252//TRANSLIT',$value) ?: $value); }
}
