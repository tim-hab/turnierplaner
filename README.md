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

Electron-Main-/Preload-, SQLite-Migrations- und IPC-Bridge-Tests ausführen:

```bash
npm run test:electron
```

Der Angular-Testlauf umfasst die Renderer- und Fachlogik; die Electron-Schicht
wird mit `npm run test:electron` separat geprüft.

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

Für einen signierten Produktionsinstaller müssen `CSC_LINK` und
`CSC_KEY_PASSWORD` in der Windows-Build-Umgebung gesetzt sein. Ohne diese
Variablen meldet electron-builder den Build zwar als erfolgreich paketiert,
überspringt aber die Codesignatur; ein solcher Installer darf nicht als
Release-Artefakt veröffentlicht werden. Der vollständige Installer-,
Upgrade-, Wiederherstellungs- und Offline-Test muss auf einem sauberen
Windows-System ausgeführt werden. Dabei sind insbesondere die stabile App-ID,
die Datenbank im Benutzerverzeichnis, JSON-Import/-Export ohne Netzwerk und
der Erhalt bestehender Turniere nach dem Upgrade zu prüfen.

Die Electron-App stellt ein natives Datei- und Hilfe-Menü mit Neu, Import,
Export, Beenden, Updateprüfung und einem Über-Dialog bereit. Fenstergröße und
-position werden pro Benutzer gespeichert. Beim Beenden erkennt die App
ungespeicherte Änderungen und bietet Speichern, Verwerfen oder Abbrechen an.
Entwicklerwerkzeuge sind ausschließlich im Entwicklungsmodus verfügbar;
externe Links werden kontrolliert im Standardbrowser geöffnet.

Im Release-Workflow wird ein Push eines Tags im Format `v1.2.3` verarbeitet. Die
Tag-Version muss mit der Version in `package.json` und `package-lock.json`
übereinstimmen. Der Workflow baut die Electron-Windows-Anwendung und erstellt
daraus das GitHub Release; die Versionsdateien bleiben dauerhaft im Repository
erhalten.

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
bei jedem Push eines Tags im Format `v<version>` ausgelöst. Die Tag-Version muss
der SemVer-Version in `package.json` entsprechen. Tags mit einem
Prerelease-Suffix wie `v1.2.3-beta.1` werden automatisch als GitHub-Prerelease
markiert. Der Workflow verwendet Electron Builder für die Windows-NSIS-Ausgabe
und hängt den Installer direkt als Asset an dieses Release an. Bei Prereleases
wird die Projektverwaltung übersprungen; Issues und Pull Requests bleiben dort
unverändert. Erst ein reguläres Release verschiebt erledigte Items nach
`Released`.

Für die Projektverwaltung muss im Repository die Variable `PROJECT_NUMBER` mit
der Nummer des GitHub Projects V2 gesetzt werden. Für ein Projekt, dessen
Besitzer nicht dem Repository-Besitzer entspricht, kann zusätzlich
`PROJECT_OWNER` gesetzt werden. Der Workflow erstellt für den Release-Namen
einen Milestone und verschiebt alle Issues und Pull Requests des Projekts, die
den Status `Done` haben, nach `Released` und weist ihnen diesen Milestone zu.

Für die Projektverwaltung muss zusätzlich das Repository-Secret
`PROJECT_TOKEN` (alternativ `RELEASE_TOKEN`) gesetzt werden. Es muss Zugriff auf
das Projekt und Schreibrechte für die betroffenen Repositories besitzen. Der
automatische `GITHUB_TOKEN` hat keinen Zugriff auf benutzerbezogene Projects-V2
und ist deshalb kein gültiger Ersatz. Bei einem klassischen Personal Access
Token werden dafür mindestens die Scopes `project` und `repo` benötigt; bei
feingranularen Tokens müssen das Projekt sowie die betroffenen Repositories mit
Schreibrechten freigegeben sein. Da Milestones repositorybezogen sind, wird bei
Items aus mehreren Repositories in jedem dieser Repositories ein Milestone mit
demselben Release-Namen verwendet.

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

| URL           | Ansicht                          |
| ------------- | -------------------------------- |
| `/#/settings` | Turniereinstellungen und Spieler |
| `/#/fields`   | Spielfelder und Spielhistorie    |
| `/#/table`    | Live-Tabelle                     |

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
