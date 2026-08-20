# Update: Rechnungsportal v2

Dieses Update überarbeitet Pracht Control, das Invoice Portal und die erzeugten PDFs.

## Enthalten

- direkter Kunde im Rechnungsgenerator: eintragen, speichern, beim nächsten Mal auswählen
- neues zweispaltiges Rechnungsformular mit fester Summen- und Abschlussbox
- aufgeräumtes, responsives Design für Control und Invoice
- PDF-Aufbau mit Logo, Empfängerblock, Rechnungsdaten, Positionstabelle, Summen und Fußdaten
- Entwürfe bearbeiten und löschen; für ausgestellte Rechnungen eine bearbeitbare Kopie erstellen
- Pracht Control erweitert um Kundenwebsites, Status-Schaltung, Traffic-Kennzahlen, Aufgaben und Aktivitätsprotokoll

## Auf Plesk einspielen

1. Die ZIP im **Basisverzeichnis** des Abonnements hochladen und dort entpacken.
2. Das Überschreiben von `pracht-suite-core/app.php` bestätigen.
3. `pracht-suite-core/config.php` und den Ordner `pracht-suite-core/storage` **nicht** löschen oder ersetzen.
4. Anschließend Control und Invoice einmal mit Strg+F5 öffnen.

Ein erneuter Aufruf von `install.php` ist nicht nötig. Die vorhandenen Mandanten, Nutzer, Kunden und Rechnungen bleiben erhalten.

Final ausgestellte Rechnungen werden nicht gelöscht oder direkt überschrieben. Für Korrekturen erzeugt das Portal einen neuen, bearbeitbaren Entwurf.
