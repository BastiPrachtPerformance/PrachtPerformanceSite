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
- zentrale, dauerhaft gespeicherte Kundenliste inklusive Kundenanlage
- zentrale Statusaenderung (Aktiv, Wartung, 404)
- echte Traffic- und Kontakt-Events fuer verbundene Websites
- Audit-Log der Statusaenderungen und ersten Live-Verbindungen
- Pracht Control Kit unter `/control-kit/`, inklusive Netlify Edge Adapter und Tracker

## Naechste Ausbaustufe

1. Im Dashboard die Kundenwebsite auswaehlen und **Control-Variablen kopieren**.
2. Diese ausschliesslich als Netlify Environment Variables der Kundenwebsite setzen.
3. `netlify-edge-adapter.ts` als Netlify Edge Function und `pracht-control-tracker.js` in die Kundenwebsite uebernehmen.
4. Kundenseite deployen. Der erste Aufruf markiert die Website im Panel automatisch als verbunden.
