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

Electron-Entwicklung mit Angular Dev Server starten:

```bash
npm run electron:dev
```

Dabei läuft Angular im Entwicklungsmodus auf `http://localhost:4200` und wird
in einem sicher konfigurierten Electron-Fenster geladen. Angular erhält keinen
direkten Zugriff auf Node.js oder Electron; die Renderer-Sicherheitsoptionen
`contextIsolation`, `nodeIntegration` und `sandbox` bleiben aktiviert.

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

Windows-Installer erzeugen:

```bash
npm run electron:dist
```

Der Befehl kompiliert zunächst Angular und den Electron Main-/Preload-Prozess
getrennt und erstellt anschließend einen Windows-NSIS-Installer unter
`release/`. Der Produktionsmodus lädt die Angular-Dateien aus `dist/`, während
`electron:dev` ausschließlich den Dev Server verwendet.

Renderer und Electron-Prozess separat kompilieren:

```bash
npm run electron:build
```

Der Befehl erzeugt den Angular-Renderer unter `dist/turnierplaner/browser/` und
kompiliert den Electron-Main- und Preload-Prozess separat nach `electron-dist/`.
Die relativen Renderer-Pfade stellen sicher, dass auch lazy geladene Angular-
Chunks und Assets aus dem gepackten Electron-Archiv geladen werden.

### Releases über GitHub Actions

Der Workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) baut
die Electron-Windows-Ausgabe und erstellt daraus automatisch ein GitHub Release.
Er startet bei einem Tag im Format `v*` oder manuell über `workflow_dispatch`.

Für die Projektverwaltung muss im Repository die Variable `PROJECT_NUMBER` mit der Nummer des GitHub Projects V2 gesetzt werden. Alternativ kann die Projektnummer beim manuellen Start eingegeben werden. Für ein Projekt, dessen Besitzer nicht dem Repository-Besitzer entspricht, kann zusätzlich `PROJECT_OWNER` gesetzt werden. Der Workflow erstellt für den Release-Namen einen Milestone und verschiebt alle Issues und Pull Requests des Projekts, die den Status `Done` haben, nach `Released` und weist ihnen diesen Milestone zu.

Das ausführende Token benötigt Zugriff auf das Projekt sowie Schreibrechte für die betroffenen Repositories. Da Milestones repositorybezogen sind, wird bei Items aus mehreren Repositories in jedem dieser Repositories ein Milestone mit demselben Release-Namen verwendet. Bei einem organisationsweiten Projekt muss gegebenenfalls ein eigenes Repository-Secret mit einem passenden Token verwendet und im Workflow als `GH_TOKEN` gesetzt werden.

## Projektstruktur

```text
src/app/
├── layout/       dauerhaft sichtbare App-Shell mit Sidebar und Steuerung
├── features/     lazy geladene fachliche Bereiche und deren Komponenten
├── core/
│   ├── datatypes/ Domänenmodelle und Match-Hilfsfunktionen
│   ├── directives/ globale Direktiven
│   └── services/  Spieler-, Turnier-, Dialog- und Exportlogik
└── shared/       wiederverwendbare UI-Bausteine
```

Die Angular-Anwendung verwendet Standalone-Komponenten. Die Aliase `@core/*` und `@shared/*` stehen sowohl im Produktionscode als auch in den Tests zur Verfügung.

## Navigation

Die Anwendung verwendet den Angular Router mit Hash-URLs:

| URL | Ansicht |
| --- | --- |
| `/#/settings` | Turniereinstellungen und Spieler |
| `/#/fields` | Spielfelder und Spielhistorie |
| `/#/table` | Live-Tabelle |

Die drei Ansichten werden als lazy geladene Standalone-Seiten eingebunden. Die gemeinsame App-Shell mit Sidebar, Turniersteuerung und `router-outlet` bleibt beim Navigieren bestehen. `/` und unbekannte URLs leiten auf `/#/settings` weiter.

Die Produktionsausgabe ist für die Lazy-Chunks vollständig vorbereitet. Der
Electron-Build paketiert diese Chunks und die Assets gemeinsam mit dem
Renderer.

## Datenimport und -export

Turnierdaten können als JSON exportiert und wieder importiert werden. Das Exportformat enthält eine Versionskennung, damit spätere Formatänderungen kontrolliert behandelt werden können.
