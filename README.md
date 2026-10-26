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

Im Release-Workflow wird die Paketversion aus `package.json` des Branches
`release` übernommen. Die Versionsänderung muss daher vor dem Release in
`package.json` und `package-lock.json` committed werden. Ein Commit oder Merge
auf den Branch `release` mit der Version `1.2.3` erzeugt anschließend ein
GitHub Release mit dem Tag `v1.2.3`; die Versionsdateien bleiben dadurch
dauerhaft im Repository erhalten.

Die Builder-Konfiguration liegt in [`electron-builder.yml`](electron-builder.yml).
Die stabile App-ID `de.timhab.turnierplaner` darf bei späteren Releases nicht
geändert werden, damit bestehende Installationen aktualisiert werden können.
Der NSIS-Installer installiert per Maschine, legt eine Verknüpfung im
Startmenü und auf dem Desktop an und verwendet [`public/favicon.ico`](public/favicon.ico)
als Browser-Favicon sowie [`build/icon.svg`](build/icon.svg) als Windows-App-Icon.
Über die benutzerdefinierte Installation kann der
Installationsordner gewählt werden. Deinstallation und Updates werden durch
NSIS anhand derselben App-ID und der jeweiligen Versionsnummer verwaltet.

Renderer und Electron-Prozess separat kompilieren:

```bash
npm run electron:build
```

Der Befehl erzeugt den Angular-Renderer unter `dist/turnierplaner/browser/` und
kompiliert den Electron-Main- und Preload-Prozess separat nach `electron-dist/`.
Die relativen Renderer-Pfade stellen sicher, dass auch lazy geladene Angular-
Chunks und Assets aus dem gepackten Electron-Archiv geladen werden.

### Offline-Betrieb

Die Desktop-App benötigt nach der Installation keine Netzwerkverbindung:

- Schriftarten und Material Icons werden lokal aus dem Renderer-Bundle geladen.
- Navigation, Turnierberechnung sowie JSON-Import und -Export laufen vollständig
  lokal.
- Der aktuelle Turnierstand wird in einer lokalen SQLite-Datenbank gespeichert
  und beim nächsten Start wiederhergestellt.
- In der Electron-App liegt die Datenbank ausschließlich im Electron-
  Benutzerverzeichnis (`app.getPath('userData')`), niemals im
  Installationsverzeichnis. Das Schema wird über versionierte, transaktionale
  Migrationen aktualisiert. Integritäts-, Lese- und Schreibfehler werden
  sichtbar gemeldet; ein beschädigter Speicher wird nicht stillschweigend
  durch einen leeren Turnierstand überschrieben.
- Die Datenbank ist normalisiert und führt eigene Tabellen für `tournaments`,
  `players`, `clubs` und `matches`. Spieler und Spiele sind jeweils einem
  Turnier zugeordnet, sodass mehrere Turniere in derselben Datenbank gespeichert
  werden können.
- Es gibt keine verpflichtenden CDN- oder API-Aufrufe. Eine optionale
  Updateprüfung darf Netzwerk verwenden, blockiert den App-Start aber nicht.

### Releases über GitHub Actions

Der Workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) wird
bei jedem Push auf den dedizierten Branch `release` ausgelöst. Er liest die
SemVer-Version aus `package.json`, baut die Electron-Windows-Ausgabe und
erstellt daraus ein GitHub Release mit dem Tag `v<version>`. Der Installer
wird direkt als Asset an dieses Release angehängt; ein separater Tag-Push ist
nicht erforderlich.

Für die Projektverwaltung muss im Repository die Variable `PROJECT_NUMBER` mit
der Nummer des GitHub Projects V2 gesetzt werden. Für ein Projekt, dessen
Besitzer nicht dem Repository-Besitzer entspricht, kann zusätzlich
`PROJECT_OWNER` gesetzt werden. Der Workflow erstellt für den Release-Namen
einen Milestone und verschiebt alle Issues und Pull Requests des Projekts, die
den Status `Done` haben, nach `Released` und weist ihnen diesen Milestone zu.

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

Turnierdaten werden in der Electron-Desktop-App über native Datei-Dialoge als JSON exportiert und wieder importiert. Das Exportformat enthält eine Versionskennung, damit spätere Formatänderungen kontrolliert behandelt werden können.

Die Angular-Fachlogik verwendet dafür `TournamentRepository` statt direkt auf
Dateien oder Electron zuzugreifen. In der Desktop-App verwendet die
Implementierung SQLite im Electron-Main-Prozess; im Browser bleibt
`localStorage` als Entwicklungs-Fallback aktiv. Der bestehende JSON-Import und
-Export bleibt als versionsbehaftetes Backup- und Austauschformat unabhängig
von der Datenbank erhalten.
