# Update: Rechnungsportal v2

Dieses Update überarbeitet Pracht Control, das Invoice Portal und die erzeugten PDFs.

## Enthalten

- direkter Kunde im Rechnungsgenerator: eintragen, speichern, beim nächsten Mal auswählen
- neues zweispaltiges Rechnungsformular mit fester Summen- und Abschlussbox
- aufgeräumtes, responsives Design für Control und Invoice
- PDF-Aufbau mit Logo, Empfängerblock, Rechnungsdaten, Positionstabelle, Summen und Fußdaten
- Entwürfe bearbeiten und löschen; für ausgestellte Rechnungen eine bearbeitbare Kopie erstellen
- ausgestellte Rechnungen in den Papierkorb verschieben, innerhalb von 60 Tagen wiederherstellen oder endgültig löschen
- automatische Bereinigung von Papierkorb-Rechnungen nach 60 Tagen inklusive PDF-Datei
- Pracht Control erweitert um Kundenwebsites, Status-Schaltung, Traffic-Kennzahlen, Aufgaben und Aktivitätsprotokoll

## Auf Plesk einspielen

1. Die ZIP im **Basisverzeichnis** des Abonnements hochladen und dort entpacken.
2. Das Überschreiben von `pracht-suite-core/app.php` bestätigen.
3. `pracht-suite-core/config.php` und den Ordner `pracht-suite-core/storage` **nicht** löschen oder ersetzen.
4. Anschließend Control und Invoice einmal mit Strg+F5 öffnen.

Ein erneuter Aufruf von `install.php` ist nicht nötig. Die vorhandenen Mandanten, Nutzer, Kunden und Rechnungen bleiben erhalten.

Beim ersten Aufruf von Control oder Invoice ergänzt das Update die beiden Papierkorb-Felder automatisch in der vorhandenen `invoices`-Tabelle. Dafür ist keine manuelle SQL-Eingabe erforderlich.

Final ausgestellte Rechnungen können in der Dokumentenliste über **In Papierkorb** verschoben werden. Im neuen Bereich **Papierkorb** bleiben sie 60 Tage erhalten. Dort können sie wiederhergestellt oder sofort endgültig gelöscht werden; nach Ablauf der 60 Tage entfernt das Portal Datensatz und zugehörige PDF automatisch.
