# Pracht Control – Netlify Aktivierung

Die statische Website und das Control-Backend werden zusammen aus diesem Projekt bei Netlify bereitgestellt.

## Einmalige Aktivierung

1. Dieses Projekt als Git-Repository mit einem Netlify-Projekt verbinden. Ein manuell hochgeladener `dist`-Ordner kann die serverseitigen Control-Funktionen nicht ausliefern.
2. In Netlify unter **Project configuration → Environment variables** zwei Werte mit dem Scope **Functions** anlegen:
   - `CONTROL_ADMIN_PASSWORD`: langes, eindeutiges Passwort fuer das Dashboard.
   - `CONTROL_SESSION_SECRET`: zufaelliger geheimer Wert mit mindestens 32 Zeichen.
3. Production-Deploy ausloesen.
4. `https://deine-domain.de/control` aufrufen und mit dem gesetzten Passwort anmelden.

## Was danach bereits funktioniert

- geschuetzter Zugang zum Control-Dashboard
- zentrale, dauerhaft gespeicherte Kundenliste
- zentrale Statusaenderung (Aktiv, Wartung, 404)
- Audit-Log der Statusaenderungen
- Vorlage fuer das Pracht Control Kit unter `/control-kit/`

## Naechste Ausbaustufe

Die erste Kundenwebsite bekommt den Netlify Edge Adapter. Der Adapter fragt den zentral gespeicherten Status ab und liefert bei Wartung oder 404 die passende Kundenansicht aus.
