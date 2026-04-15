# Laboratory Scheduler

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10.2.0-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.8.2-F7B93E?logo=prettier&logoColor=black)
![pnpm](https://img.shields.io/badge/pnpm-8.6.5-F69220?logo=pnpm&logoColor=white)

Système de planification pour un laboratoire médical : répartition d'échantillons entre techniciens et équipements, dans le respect des priorités et contraintes. Le code supporte les versions **simple** et **intermédiaire** de l'énoncé (il réagit à la présence/absence des champs optionnels, sans flag de version).

> **À propos de Next.js.** Une stack Next.js est présente parce que l'idée initiale incluait une interface front-end au-dessus du scheduler. Faute de temps, seule la partie core + CLI a été livrée. Les scripts `dev`/`build`/`start` restent disponibles pour une future passe UI.

## Prérequis

- **Node.js** >= 20
- **pnpm** >= 8

## Installation

```bash
git clone <repo-url>
cd laboratory-scheduler
pnpm install
```

## Scripts

Seuls les scripts réellement utiles au projet aujourd'hui :

- `pnpm schedule --file=<input.json> [--output=<output.json>]` — exécute le scheduler sur un JSON d'entrée et affiche ou écrit le résultat. C'est le point d'entrée de l'exercice.
- `pnpm test` — lance la suite Jest (58 tests / 14 suites).
- `pnpm test:watch` — Jest en mode watch.
- `pnpm lint` — ESLint sur le projet.
- `pnpm format` / `pnpm format:check` — Prettier.

Réservés au futur front-end (non utilisés aujourd'hui) : `pnpm dev`, `pnpm build`, `pnpm start`.

Exemple :

```bash
pnpm schedule --file=data/samples.json --output=data/output.json
```

## Choix de périmètre

Cette implémentation est volontairement un **scheduler greedy data-driven**. Les choix ci-dessous sont assumés, ce ne sont pas des oublis :

- **Greedy sort-then-place, pas time-simulated.** Les samples sont triés globalement par priorité (STAT > URGENT > ROUTINE, puis heure d'arrivée) puis placés un par un en first-fit. Le brief intermédiaire demande explicitement "parallélisme opportuniste, pas optimisation globale" et exclut backtracking, réorganisation post-allocation, métaheuristiques, etc.
- **Ressources en intervalles (réservation prioritaire STAT).** Le `ResourceTracker` stocke des **intervalles occupés** triés par technicien et par slot d'équipement. Comme les STAT sont placés en premier dans la boucle, ils réservent leur créneau sur le timeline à leur `arrivalTime`. Les placements URGENT/ROUTINE qui suivent utilisent un **joint-fit finder** qui cherche le premier trou compatible autour des réservations existantes — un URGENT long peut donc tourner **avant** un STAT arrivant plus tard si le trou le permet. Un STAT n'est ainsi jamais bloqué par une analyse moins prioritaire, sans avoir à préempter une analyse en cours.
- **Pas de préemption d'analyse en cours.** La priorité STAT est garantie par le mécanisme de réservation ci-dessus, pas en interrompant une analyse en vol. Un STAT peut en revanche interrompre une pause déjeuner (ça incrémente `lunchInterruptions` quand la fenêtre du STAT chevauche la pause du technicien).
- **Pas de pause/reprise autour du déjeuner.** Une analyse qui chevaucherait la pause est décalée après la pause (sauf STAT, qui peut traverser). Les analyses sont atomiques une fois démarrées.
- **Compatibilité purement data-driven.** Les décisions de routing s'appuient strictement sur les champs présents dans l'input (`type`, `compatibleTypes`, `specialty`, `efficiency`, etc.). Aucun dictionnaire métier codé en dur — si l'input ne déclare pas de `compatibleTypes` reliant un `analysisType` à un équipement, le code n'invente pas le lien.
- **Les flags de contraintes sont honorés, pas traduits.** `contaminationPrevention: false` désactive les temps de nettoyage ; `parallelProcessing: false` ramène chaque équipement à un seul slot.

## Matching Sample ↔ Equipment

`src/core/scheduler/findCompatibleEquipments.ts` filtre les équipements pour un sample donné, avec une règle principale et un fallback :

1. **Si le sample a un `analysisType` ET l'équipement déclare `compatibleTypes` :** match substring insensible à la casse entre `sample.analysisType` et une entrée de `equipment.compatibleTypes`. Les formes enrichies sont reconnues (`"Caryotype urgent"` matche `"Caryotype"`, `"Sérologie HIV"` matche `"Sérologie"`, etc.).
2. **Fallback — match exact sur le type :** `equipment.type === sample.type`. Il s'active (a) quand le sample n'a pas d'`analysisType` (version simple du brief) ou (b) quand l'équipement n'a pas de `compatibleTypes` déclaré (input partiellement spécifié).

Si aucun équipement ne passe l'un des deux checks, le sample est reporté `unscheduled` avec la raison `No compatible equipment`.

### Pourquoi plus de fallback "par saturation"

Les itérations précédentes incluaient un fallback sur `type` qui se déclenchait quand les équipements `compatibleTypes`-matchés étaient saturés. Risque : router une analyse vers une machine sémantiquement incorrecte. La règle actuelle est plus stricte et purement basée sur l'input : on fait confiance aux déclarations. Si un sample ne peut pas être planifié parce que son équipement cible est occupé, il reste unscheduled — c'est un signal honnête sur la capacité du dataset.

## Matching Sample ↔ Technician

`src/core/scheduler/findCompatibleTechnicians.ts` filtre les techniciens pour un équipement donné :

- Un technicien matche si son tableau `specialty` contient `equipment.type`, **ou** si sa spécialité est `GENERAL` (wildcard — le brief simple indique "GENERAL peut faire tous les types, mais moins efficace").
- La liste est triée de manière à placer **les spécialistes directs avant les GENERAL**. Pour un équipement BLOOD, un technicien BLOOD est préféré à un GENERAL, même si les deux matchent. Au sein des spécialistes directs, ceux qui ont le moins de spécialités passent d'abord (heuristique classique : "utiliser les spécialistes d'abord, garder les polyvalents pour les cas difficiles").
- L'aspect "moins efficace" de GENERAL est exprimé au niveau de l'input via le coefficient `efficiency` optionnel — la version intermédiaire peut baisser le coefficient d'un GENERAL ; le code ne code pas de pénalité en dur.

### Vocabulaire croisé (non implémenté)

Le dataset intermédiaire complet a des vocabulaires asymétriques : `sample.type` ∈ {BLOOD, URINE, TISSUE} alors que `technician.specialty` ∈ {BLOOD, CHEMISTRY, MICROBIOLOGY, IMMUNOLOGY, GENETICS, …}. Seul BLOOD est commun. Le dataset fait le pont via `compatibleTypes` sur les équipements (qui mappe les noms d'analyses longs vers les types d'équipement). Aucun mapping n'est codé en dur dans le scheduler.

## Algorithme de planification

`src/core/scheduler/Scheduler.ts` orchestre trois helpers (`sortSamples`, `findCompatibleEquipments`, `findCompatibleTechnicians`) et délègue le suivi des ressources à `ResourceTracker`.

### Étapes

1. Trier les samples par priorité, puis par heure d'arrivée.
2. Pour chaque sample, récupérer les équipements candidats via `findCompatibleEquipments`.
3. Pour chaque équipement candidat, récupérer les techniciens compatibles (spécialistes d'abord), puis essayer chaque paire (tech, slot) via un **joint-fit finder** :
    - `minStart = max(sample.arrivalTime, technician.startTime, laboratory.openingHours.start)`.
    - `duration = Math.round(sample.analysisTime / technician.efficiency)` si l'efficiency est définie, sinon `sample.analysisTime`.
    - Partant de `candidate = minStart`, on pousse `candidate` vers l'avant à chaque obstacle chevauchant, de manière itérative jusqu'à stabilisation : intervalle occupé du technicien, intervalle occupé du slot, `lunchBreak` (uniquement non-STAT), `maintenanceWindow`. Les STAT peuvent traverser la pause — `lunchInterruptions` est incrémenté si c'est le cas.
    - Rejeter si `candidate + duration` dépasse `technician.endTime` ou la fin de `laboratory.openingHours`.
    - Tester tous les slots de l'équipement, garder celui qui donne le `candidate` le plus tôt.
4. Réserver `[start, end]` sur la liste d'intervalles du technicien et `[start, end + cleaningTime]` sur le slot choisi (cleaning skippé si `contaminationPrevention === false`).
5. Si aucune combinaison (equipment, technician, slot) ne convient, marquer le sample unscheduled.

### Parallélisme

`ResourceTracker` alloue `capacity` slots parallèles par équipement (défaut 1 si `capacity` est absent). Avec `constraints.parallelProcessing: false`, chaque équipement retombe à un seul slot, peu importe la capacité déclarée.

## Format de sortie

La forme de l'output suit celle attendue par le brief. Tous les champs hors `schedule` et `metrics` sont émis uniquement s'ils portent une info :

```jsonc
{
    "laboratory": {
        /* uniquement si input.laboratory est défini */
    },
    "schedule": [
        /* trié par startTime réel */
    ],
    "unscheduled": [
        /* uniquement si non vide */
    ],
    "metrics": {
        /* toujours présent */
    },
    "metadata": {
        "lunchBreaks": [
            /* uniquement si au moins un technicien a un lunchBreak */
        ],
        "constraintsApplied": [
            /* uniquement les labels réellement appliqués */
        ],
    },
}
```

`constraintsApplied` est construit dynamiquement à partir de ce que le scheduler a réellement appliqué sur l'input :

| Label                      | Conditions d'apparition                                              |
| -------------------------- | -------------------------------------------------------------------- |
| `priority_management`      | Toujours                                                             |
| `specialization_matching`  | Toujours                                                             |
| `equipment_compatibility`  | Toujours                                                             |
| `parallelism_optimization` | Uniquement si au moins un équipement a `capacity > 1`                |
| `lunch_breaks`             | Uniquement si au moins un technicien déclare un `lunchBreak`         |
| `maintenance_avoidance`    | Uniquement si au moins un équipement déclare une `maintenanceWindow` |
| `cleaning_delays`          | Uniquement si au moins un équipement déclare un `cleaningTime`       |
| `efficiency_coefficients`  | Uniquement si au moins un technicien déclare une `efficiency`        |

## API publique — `planifyLab`

```ts
import { planifyLab } from '@/core/planifyLab';

const result = planifyLab(input);
```

`planifyLab` instancie les classes d'entités depuis les DTO, lance le `Scheduler`, calcule les métriques via `MetricsCalculator`, puis formate le résultat via `formatOutput`.

## Jeux de données d'exemple

Le dossier `data/` contient les datasets officiels du brief :

- `data/samples.json` — dataset intermédiaire complet (20 samples / 8 techniciens / 5 équipements). Régénérer l'output : `pnpm schedule --file=data/samples.json --output=data/output.json`.
- `data/simple-1.json` / `simple-2.json` / `simple-3.json` — les 3 exemples pédagogiques de la version simple.
- `data/intermediate-1.json` / `intermediate-2.json` / `intermediate-3.json` — les 3 exemples pédagogiques de la version intermédiaire (avec réserves, voir ci-dessous).

### Notes sur les exemples pédagogiques intermédiaires

Les 3 exemples intermédiaires sollicitent des comportements au-delà du périmètre choisi ici. Divergences attendues :

- **Exemple 1** : `compatibleTypes` est absent sur les équipements → le routing retombe sur un match par `type`, ce qui route les deux samples sur EQ001 au lieu de les séparer entre EQ001 et EQ002. Le routing attendu n'est pas reproductible sans enrichir l'input.
- **Exemple 2** : l'output attendu place l'URGENT S002 avant le STAT S003 parce que S002 démarre avant l'arrivée de S003. Notre greedy sort-then-place place le STAT en premier globalement. Différence time-simulated vs sort-then-place.
- **Exemple 3** : nécessite un mapping croisé TISSUE → MICROBIOLOGY (non présent dans les données) et une pause/reprise d'analyse autour du déjeuner (non implémenté).

Ce sont des limites assumées, alignées avec les choix de périmètre ci-dessus.

## Tests

Jest + ts-jest, 58 tests répartis sur 14 suites. La structure miroite `src/core/` :

- `tests/entities/` — getters de `Sample`, `Technician`, `Equipment`, `Laboratory`, `Constraints`.
- `tests/scheduler/` — `sortSamples`, `findCompatibleEquipments`, `findCompatibleTechnicians`, `ResourceTracker`, `Scheduler`.
- `tests/metrics/` — `MetricsCalculator`.
- `tests/output/` — `formatter`.
- `tests/utils/` — helpers de `time`.
- `tests/planifyLab.test.ts` — test d'intégration bout-en-bout sur `data/samples.json`.

`tests/helpers/factories.ts` expose des factories à overrides souples qui élargissent les branded IDs et les unions étroites vers de simples `string | number`, pour que les tests puissent passer `'S042'` sans cast.

## Notes de design

- **Pas de validation runtime des DTO.** L'input est un JSON statique de confiance. Les types TypeScript suffisent ; pas de couche zod/yup.
- **Séparation DTO ↔ entité.** Les DTO dans `src/core/types/` miroitent le JSON d'entrée ; les classes d'entités dans `src/core/entities/` exposent des accesseurs `get x()` au-dessus de champs `private readonly _x`.
- **Enums closed-world via `const object + typeof + keyof`.** Une seule source de vérité pour valeurs et types.
- **Branded IDs.** `SampleId`, `TechnicianId`, `EquipmentId` empêchent les mélanges d'identifiants à la compilation.

## Améliorations possibles

Ce qui mérite d'être fait ensuite, par ordre approximatif de priorité :

- **Interface front-end.** La stack Next.js est scaffoldée pour une UI qui visualiserait le planning (à la Gantt) et permettrait d'expérimenter avec les inputs. Faute de temps ; c'est la suite naturelle.
- **Passe de refacto.** Le code a évolué de façon incrémentale le long de la progression simple → intermédiaire du brief. Une passe de nettoyage permettrait de resserrer les noms, d'extraire quelques helpers (par ex. la logique lunch/maintenance adjust), et de retirer les clés legacy (`speciality` vs `specialty`).
- **Unifier la clé specialty du technicien.** Actuellement `speciality` (simple) et `specialty` (intermédiaire) sont tous deux acceptés. Une seule clé canonique avec normalisation à la lecture serait plus propre.
- **Aligner les vocabulaires `analysisType` et `compatibleTypes`.** Forme longue (`"Numération complète"`) vs forme courte (`"Numération"`), ce qui impose le match substring. Un vocabulaire partagé supprimerait le fallback.
- **Aligner les noms des flags de contraintes.** L'input utilise `contaminationPrevention` / `parallelProcessing`, l'output `cleaning_delays` / `parallelism_optimization`. Un vocabulaire partagé enlèverait la couche de traduction.
- **Validateur d'input.** Un validateur runtime (zod ou similaire) à la frontière du CLI rattraperait les JSON mal formés avant le scheduler. Volontairement écarté ici (input statique de confiance).
- **Scheduling time-simulated (optionnel).** Reproduire l'exemple pédagogique intermédiaire 2 demanderait un algorithme time-simulated au lieu de sort-then-place. Hors périmètre pour cette livraison.
- **Pause / reprise autour du déjeuner (optionnel).** Permettre à une analyse de se suspendre au déjeuner et de reprendre après matcherait l'exemple intermédiaire 3. Nécessite de modéliser les analyses comme des jobs interruptibles.
- **Préemption STAT d'une analyse en cours (optionnel).** Actuellement un STAT interrompt seulement le déjeuner ; la réservation par intervalles garantit qu'il n'est pas bloqué par une analyse non-STAT, mais elle ne coupe pas une analyse en vol. Rangé en "Version Avancée" du brief.
