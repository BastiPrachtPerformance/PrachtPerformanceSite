# Pracht Invoice – Installation auf Plesk

## Was dieses Paket enthält

- `control.pracht-performance.de/` – Pracht Control für Mandanten, Zugänge und Rechnungskennzahlen
- `invoice.pracht-performance.de/` – Rechnungsportal für deine Kunden
- `pracht-suite-core/` – gemeinsame, nicht öffentlich erreichbare Serverlogik, Datenbankzugang sowie PDF- und Logo-Speicher

Es werden **keine** Rechnungen per E-Mail gesendet und keine Mahnungen erstellt. Rechnungen werden final ausgestellt, gespeichert und als PDF heruntergeladen.

## Vor der Installation

1. In Plesk bei beiden Subdomains PHP 8.3 aktivieren.
2. Die Datenbank muss bereits angelegt sein.
3. Im Plesk-Dateimanager das **Basisverzeichnis** öffnen – dort, wo die Ordner `control.pracht-performance.de` und `invoice.pracht-performance.de` nebeneinander liegen.

## Installation

1. `Pracht-Invoice-Plesk-Upload.zip` in das Basisverzeichnis hochladen und dort entpacken.
   Die vorhandenen Dateien in den beiden Subdomain-Ordnern dürfen überschrieben bzw. ergänzt werden.
2. In `pracht-suite-core` die Datei `config.sample.php` kopieren und die Kopie in `config.php` umbenennen.
3. `config.php` bearbeiten:
   - Datenbankname, Datenbanknutzer und Datenbankpasswort aus Plesk eintragen
   - `install_key` durch einen langen eigenen Zufallswert ersetzen
4. Im Browser öffnen: `https://control.pracht-performance.de/install.php`
5. Installationsschlüssel, deinen Namen, Admin-E-Mail und ein starkes Passwort eingeben.
6. Nach der Erfolgsmeldung beide Dateien löschen:
   - `control.pracht-performance.de/install.php`
   - `invoice.pracht-performance.de/install.php`
7. Anschließend unter `https://control.pracht-performance.de` anmelden, Mandanten und deren erste Zugänge anlegen.

## Wichtige Hinweise

- `pracht-suite-core/config.php` enthält Geheimnisse und darf niemals in Git geladen oder öffentlich verlinkt werden.
- Das Paket erstellt PDFs und Logos unter `pracht-suite-core/storage/`. Dieser Ordner muss für PHP beschreibbar sein. Wenn Plesk beim ersten Upload einen Fehler zeigt, im Dateimanager für `pracht-suite-core/storage` Schreibrechte für den Hosting-Benutzer aktivieren.
- PNG-Logos werden für PDF-Rechnungen in JPG umgewandelt. Falls das nicht klappt, bitte in Plesk die PHP-Erweiterung **GD** aktivieren oder ein JPG-Logo hochladen.
- Final ausgestellte Rechnungen lassen sich im Portal nicht mehr ändern. Eine falsche Rechnung sollte nicht gelöscht, sondern später über einen eigenen Korrekturprozess ausgeglichen werden.
