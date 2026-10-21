# Turnierplaner

Eine Angular-Anwendung zur Organisation von Badminton-Juxturnieren.

## Voraussetzungen

- Node.js mit npm
- Die im `package.json` festgelegte npm-Version

## Entwicklung

Abhängigkeiten installieren:

```bash
npm install
```

Entwicklungsserver starten:

```bash
npm start
```

Danach ist die Anwendung unter <http://localhost:4200/> erreichbar.

## Qualitätssicherung

Linting ausführen:

```bash
npm run lint
```

Unit-Tests einmalig ausführen:

```bash
npm test -- --watch=false
```

Der Testbestand enthält derzeit noch einige ältere Fixture-Tests, die vor einem vollständig grünen Lauf aktualisiert werden müssen.

## Builds

Produktions-Build erzeugen:

```bash
npm run build
```

Ein einzelnes, inline eingebettetes HTML-Dokument erzeugen:

```bash
npm run build-single
```

Die Build-Ausgabe liegt unter `dist/`; die Single-File-Ausgabe unter `dist-single/`.

## Projektstruktur

```text
src/app/
├── components/   turnierspezifische Ansichten und Steuerungen
├── core/
│   ├── datatypes/ Domänenmodelle und Match-Hilfsfunktionen
│   ├── directives/ globale Direktiven
│   └── services/  Spieler-, Turnier-, Dialog- und Exportlogik
└── shared/       wiederverwendbare UI-Bausteine
```

Die Angular-Anwendung verwendet Standalone-Komponenten. Die Aliase `@core/*` und `@shared/*` stehen sowohl im Produktionscode als auch in den Tests zur Verfügung.

## Datenimport und -export

Turnierdaten können als JSON exportiert und wieder importiert werden. Das Exportformat enthält eine Versionskennung, damit spätere Formatänderungen kontrolliert behandelt werden können.
