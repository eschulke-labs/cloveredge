# CloverEdge — Data Factory Architecture & Knowledge Acquisition Strategy

> Markdown copy of `CloverEdge Development Strategy.docx` (same folder), written by Edward with ChatGPT and added 2026-11-26. The .docx is the original; this copy exists so the text can be read in GitHub diffs and by coding assistants. If they disagree, the .docx wins — and decisions in `DEVELOPMENT_PLAN.md` still govern until this strategy is adopted there.

**Document Type:**  Foundational Architecture Document  
**Project:**  CloverEdge Gambling Knowledge Graph  
**Status:**  Proposed Architecture and Strategic Direction  
**Version:**  1.0

## 1. Executive Overview

CloverEdge is intended to become an intelligence platform for gambling information and discovery. Its value will come not simply from collecting information, but from connecting information, identifying relationships, deriving insights, and using those insights to help people discover gambling experiences that match their interests.

The Knowledge Graph is the foundation for representing this connected information. The **Data Factory**  is the system responsible for acquiring, processing, validating, enriching, and maintaining the information that populates that graph.

The Data Factory should be designed as a collection of independent, coordinated processes rather than one large import operation.

YouTube videos will be the first major source of information. However, the Data Factory must ultimately support additional sources, including:

- Casinos and gambling venues.
- Online casinos.
- Games and game manufacturers.
- Content creators and gambling personalities.
- Reviews and user-generated information.
- Sports betting.
- Prediction markets.
- Other gambling-related information sources.

The objective is to build a repeatable knowledge acquisition capability that can expand as CloverEdge grows.

#### The central principle

**Acquire information, understand it, validate it, publish what is useful, and continuously improve it.**

The Data Factory should not be considered merely a YouTube importer. It is a core CloverEdge capability.

## 2. Architectural Vision

The Data Factory will operate as a series of independent processes, each responsible for a defined stage in the information lifecycle.

The proposed lifecycle is:

- Discover and acquire information.
- Collect available source metadata.
- Analyze and extract additional information using AI.
- Validate extracted information.
- Identify missing, uncertain, or conflicting information.
- Assign human review tasks where necessary.
- Publish information when minimum requirements are satisfied.
- Continue enriching published information.
- Improve AI extraction through verified human feedback.

The processes should be independently runnable, scalable, restartable, and maintainable.

They should communicate through persistent job records or queues so that one process can finish its work without requiring every other process to run at the same time.

#### Core intelligence loop

**Observe → Connect → Infer → Recommend → Learn**

The Data Factory supplies the information that makes this loop possible.

- **Observe:**  Acquire source information and identify facts.
- **Connect:**  Establish relationships between videos, creators, games, venues, plays, and wins.
- **Infer:**  Identify patterns and derive useful classifications.
- **Recommend:**  Make relevant information available to CloverEdge's discovery and personalization capabilities.
- **Learn:**  Use user behavior and human corrections to improve future results.

## 3. The Six Core Data Factory Processes

The initial architecture consists of six logical processes. These do not necessarily need to be six separate applications. They are independent responsibilities that can initially operate within the same technical environment.

### 3.1 Video Acquisition Agent

**Purpose:**  Discover gambling-related videos and register them for processing.

This process is responsible for finding YouTube videos that may be relevant to CloverEdge.

It should support two complementary acquisition strategies.

#### A. Daily discovery

Identify new videos as they become available.

Potential discovery methods:

- Monitor selected gambling creators and channels.
- Identify new uploads from existing creators.
- Search for videos featuring particular games.
- Search for specific gambling experiences or topics.
- Identify new creators who may be relevant.
- Periodically refresh information about existing videos.

The goal is to build a growing collection of relevant, current content without repeatedly searching the entire YouTube platform.

#### B. Historical archive

Acquire relevant videos that already exist.

Potential methods:

- Backfill historical uploads from selected creators.
- Search for older videos featuring specific games.
- Identify videos associated with particular casinos.
- Discover notable wins, jackpots, and gambling experiences.
- Build historical coverage of important creators and games.

Daily discovery and historical acquisition should use the same underlying acquisition pipeline, but they should have different scheduling and prioritization rules.

#### Initial acquisition proof of concept

A practical starting approach:

- Create a curated list of gambling creators.
- Collect their recent uploads.
- Begin historical backfilling in manageable batches.
- Add targeted searches for selected games and experiences.
- Deduplicate discovered videos.
- Prioritize videos based on relevance and potential value.

The objective is not to collect every gambling video on YouTube. It is to build a useful, relevant, high-quality collection.

### 3.2 YouTube Metadata Collector

**Purpose:**  Gather all available official YouTube metadata for each acquired video.

This process runs independently after a video has been acquired.

Potential metadata includes:

- YouTube video ID.
- Video URL.
- Title.
- Description.
- Creator/channel name.
- Creator/channel ID.
- Creator-provided tags, where available.
- Thumbnail.
- Duration.
- Publication date.
- View count.
- Like count, where available.
- YouTube category.
- Other available source metadata.

The collector should preserve the distinction between information supplied by YouTube and information inferred later by CloverEdge.

For example, a video title is source metadata. A classification such as "low-stakes slot gameplay" is a CloverEdge interpretation.

#### Collection principles

- Cache previously collected information.
- Avoid unnecessary repeated API calls.
- Track when metadata was last collected.
- Support incremental updates.
- Preserve source information and collection history.
- Handle missing or unavailable metadata without inventing values.

YouTube Data API quota must be managed carefully. The initial proof of concept should use efficient collection strategies, including channel uploads feeds and incremental polling where appropriate.

### 3.3 AI Video Intelligence Agent

**Purpose:**  Analyze acquired videos and their available information to extract meaningful gambling knowledge.

This process is responsible for understanding what is happening in a video.

It should use available information such as:

- Video title.
- Description.
- Creator-provided tags.
- Thumbnail.
- Duration.
- Other collected metadata.
- Authorized video imagery or footage when available and appropriate.

The AI agent should identify individual gambling activities and extract structured information.

#### A. Game identification

- Game name.
- Game provider/manufacturer.
- Game type.
- Game features and mechanics.
- Bonus rounds.
- Free spins.
- Special features.

#### B. Betting behavior

- Minimum bet observed.
- Maximum bet observed.
- Typical bet.
- Changes in bet size.
- Number of spins or hands observed.
- Bet escalation or de-escalation.
- Approximate total wagered, when observable.

#### C. Winning characteristics

- Individual wins.
- Biggest win.
- Win multiplier.
- Average observed multiplier, when meaningful.
- Significant wins.
- Progressive jackpots.
- Handpays.
- Bonus-round wins.

#### D. Playing style

- Casual or high-limit play.
- Low-stakes or high-stakes play.
- Short highlight or extended session.
- Single-game or multiple-game focus.
- Solo or group play.
- Demonstration, tutorial, or entertainment.

#### E. Content characteristics

- Gameplay versus commentary.
- Live versus edited highlights.
- Educational versus entertainment.
- Creator presentation style.
- Promotional or sponsored content, where identifiable.

#### F. Venue information

- Land-based casino.
- Online casino.
- Cruise ship casino.
- Other gambling venue.
- Specific venue name, if identifiable.
- Recording location, if available.

#### Important distinction: observed facts versus inferred classifications

The AI agent must distinguish what it can directly observe from what it is interpreting.

For example:

- A visible $2 bet is an observed fact if the screen clearly shows it.
- "Low-stakes player" is a classification.
- A casino name inferred from visual clues is an uncertain identification unless supported by sufficient evidence.

Each extracted fact should retain evidence, confidence, source, and processing history.

The AI agent must never fabricate information simply to populate a field.

### 3.4 Metadata Validation Agent

**Purpose:**  Evaluate the quality, completeness, consistency, and reliability of extracted information.

This process receives the results from the metadata collector and AI intelligence agent.

It determines:

- What information is present?
- What information is missing?
- What information is uncertain?
- What information conflicts with other information?
- What information needs further investigation?
- What information is sufficiently reliable for publication?

#### Validation dimensions

#### Completeness

Are the applicable metadata fields populated?

#### Consistency

Do related facts agree with one another?

#### Confidence

How reliable is each extracted fact?

#### Provenance

Where did the information originate?

#### Evidence

Is there sufficient supporting evidence for the extracted fact?

#### Applicability

Is the field actually relevant and observable for this video?

#### Missing information categories

The system should distinguish:

- **Required:**  Needed for a particular publication or processing stage.
- **Optional:**  Useful but not necessary.
- **Unknown:**  Not currently known.
- **Not observable:**  Cannot reasonably be determined from available evidence.
- **Needs investigation:**  Could potentially be established through further analysis or human review.
- **Conflicting:**  Different sources or extraction processes disagree.

This distinction is critical. CloverEdge must not treat every missing value as a problem that must be solved.

Some information simply cannot be determined from a video.

#### Validation output

The validation process should produce a structured assessment that identifies:

- Validated facts.
- Facts requiring further analysis.
- Missing applicable information.
- Conflicting values.
- Low-confidence values.
- Human review requirements.
- Publication eligibility.

### 3.5 Human Review and AI Learning Process

**Purpose:**  Allow people to complete, correct, and verify information while creating a feedback loop that improves AI performance.

Human review is an important part of the initial Data Factory architecture.

AI extraction will not be perfect at the beginning. Human review provides the mechanism to establish reliable data and improve extraction quality over time.

#### Human review tasks

Examples include:

- Confirming the game name.
- Correcting a game or provider identification.
- Confirming a bet amount.
- Verifying a win amount.
- Correcting a multiplier.
- Identifying a casino or venue.
- Confirming a recording date.
- Resolving conflicting classifications.
- Reviewing uncertain playing-style classifications.

#### Human feedback loop

The intended process is:

- AI extracts information.
- Validation identifies gaps or uncertainty.
- The system creates review tasks.
- A human reviews and corrects the information.
- The verified result is retained.
- The correction becomes a training or evaluation example.
- Prompts, rules, and extraction methods are improved.
- The improved process is tested against verified examples.

Human corrections should not simply overwrite the original AI output. The original result and the correction should remain available for audit and evaluation.

#### Initial gold-standard dataset

The existing development plan identifies the first approximately 50 videos as a manually reviewed gold-standard dataset.

These videos should be carefully tagged and verified.

The gold-standard dataset will provide a baseline for measuring AI performance across individual attributes.

Suggested measurements include:

- Game identification accuracy.
- Game provider identification accuracy.
- Bet amount accuracy.
- Bet denomination accuracy.
- Win amount accuracy.
- Multiplier accuracy.
- Venue identification accuracy.
- Playing-style classification accuracy.
- Content-type classification accuracy.

A single overall accuracy score is not sufficient. Accuracy should be measured separately for each important metadata attribute.

### 3.6 Publishing and Continuous Enrichment Agent

**Purpose:**  Make useful video information available to CloverEdge clients as soon as minimum publication requirements are met, then continue enriching it.

A video should not need to be fully enriched before it can be useful.

The architecture should support incremental publication.

#### Publication stage 1 — Publishable

A video can be made available to clients when it has the minimum required information:

- Valid YouTube URL and video ID.
- Title.
- Thumbnail.
- Identifiable creator, or creator explicitly marked as unknown.
- Confirmed gambling relevance.
- Broad content classification.
- Publication status.
- Source provenance.

This creates a useful initial record without requiring every possible detail.

#### Publication stage 2 — Enriched

Additional information becomes available as processing continues.

Examples:

- Specific game.
- Game provider.
- Bet characteristics.
- Win characteristics.
- Playing style.
- Venue.
- Recording location.
- Content type.
- Additional game features and mechanics.

#### Publication stage 3 — Complete

The record has reached the applicable metadata completion standard.

This means:

- Applicable requirements have been addressed.
- Important facts have supporting evidence.
- Provenance is recorded.
- Confidence thresholds are satisfied.
- Contradictions have been resolved or explicitly documented.
- Human verification has occurred where required, or AI extraction has met the appropriate validation standard.

"Complete" does not mean that every possible field must contain a value. It means that the system has adequately processed every applicable field and documented what cannot be established.

#### Continuous enrichment

Publication is not the end of processing.

After a video is published, additional processes can:

- Identify new information.
- Reprocess low-confidence fields.
- Add newly recognized games.
- Improve venue identification.
- Resolve previously conflicting information.
- Update derived classifications.
- Incorporate improved extraction models.

The published record should evolve as CloverEdge's knowledge improves.

## 4. Rich Video Metadata Foundation

The objective is to create a metadata foundation that supports more than basic video discovery.

CloverEdge should be able to distinguish between different gambling experiences, even when videos feature the same game.

For example:

- Video A: A player makes a $2 bet and wins $1,000 — a 500× multiplier.
- Video B: A player makes a $500 bet and wins $10,000 — a 20× multiplier.

Both videos feature substantial wins, but they represent very different experiences.

A user interested in turning small bets into large payouts may prefer the first video. A user interested in high-limit play may prefer the second.

This distinction is central to CloverEdge's future recommendation capabilities.

#### Metadata dimensions

| Dimension | Examples |
|---|---|
| Game | Game name, provider, game type |
| Betting behavior | Minimum, maximum, typical bet, bet changes |
| Winning characteristics | Win amount, multiplier, jackpot, handpay |
| Playing style | Casual, high-limit, low-stakes, extended session |
| Content type | Gameplay, commentary, tutorial, entertainment |
| Session type | Short clip, full session, edited highlights |
| Venue | Casino, online casino, cruise ship, location |
| Creator | Channel, personality, presentation style |
| Game features | Bonus rounds, free spins, mechanics |
| Evidence | Source, confidence, supporting information |

#### Derived versus directly stored information

Some information should be derived from the underlying facts rather than independently entered and maintained.

For example:

- Video-level net result can be computed from Plays and Wins where the necessary information exists.
- Biggest win can be derived from individual Win records.
- Biggest multiplier can be derived from individual Win records.
- Bet categories can be derived from observed bet amounts and denomination.
- Payout categories can be derived from win multipliers.

This reduces redundant data and avoids inconsistencies between summary fields and underlying records.

## 5. Knowledge Graph Integration

The Data Factory and Knowledge Graph have different responsibilities.

#### Data Factory records

These represent operational processing information:

- Acquisition jobs.
- Processing jobs.
- Metadata collection status.
- AI extraction results.
- Validation results.
- Review tasks.
- Processing history.
- Publication status.
- Retry and failure information.

#### Knowledge Graph records

These represent the actual gambling knowledge:

- Videos.
- Creators.
- Games.
- Game providers.
- Casinos and other venues.
- Plays.
- Wins.
- Game features and mechanics.
- Relationships between these entities.

The Data Factory produces and enriches the information that becomes part of the Knowledge Graph.

#### Existing CloverEdge foundation

The current development plan describes a PostgreSQL and Prisma implementation with an initial graph-oriented schema.

Existing entities and models include:

- VideoEmbed
- Creator
- Game
- GameProvider
- Casino (currently serving as a venue representation)
- Play
- Win
- ExtractionRun
- Alias

The existing design already supports an important relationship chain:

#### Video → Play → Game → Game Provider → Win → Venue

The first-pass tagging exercise on five videos produced:

- 7 Plays.
- 5 Wins.
- 2 venues.
- 2 recording dates.

The initial records still require human review and correction.

The existing development plan also identifies provenance information such as source, confidence, and extraction-run relationships.

#### Important architecture direction

The Data Factory should build on the existing PostgreSQL and Prisma foundation.

A separate graph database is not currently necessary. PostgreSQL can support the initial knowledge graph and its relationships.

The architecture should remain flexible enough to introduce additional graph infrastructure later if actual query requirements justify it.

#### Potential additional operational models

The Data Factory architecture may require additional models over time, such as:

- AcquisitionBatch.
- ProcessingJob.
- MetadataCollectionRun.
- ValidationResult.
- ReviewTask.
- PublicationState.
- ProcessingEvent.

These are proposed additions, not a claim that they already exist.

The exact schema should be designed after reviewing the current Prisma implementation and the requirements of each process.

## 6. Provenance, Confidence, and Auditability

Every important extracted fact should be traceable.

CloverEdge needs to know not only what a fact says, but also how it was obtained.

Potential provenance attributes include:

- Source type: AI, HUMAN, YOUTUBE_API, or another source.
- Confidence score.
- Evidence supporting the fact.
- Extraction run ID.
- Model used.
- Prompt version.
- Input types used, such as text, thumbnail, or authorized footage.
- Processing date.
- Human reviewer, where applicable.

The existing development plan also identifies the importance of retaining the raw AI extraction output.

Human corrections should create an audit record containing the previous and updated values.

This allows CloverEdge to:

- Understand why a fact exists.
- Evaluate AI extraction quality.
- Reconstruct earlier decisions.
- Identify recurring extraction errors.
- Improve prompts and models.
- Preserve trust in the underlying information.

#### Data integrity principles

- Do not guess amounts or denominations.
- Use dollars only when the denomination is known.
- Otherwise retain credits or an unknown denomination.
- Do not invent venue names or recording dates.
- Preserve uncertainty rather than forcing a definitive classification.
- Retain the original AI result when a human corrects it.

## 7. Acquisition and Processing Architecture

The Data Factory should be designed around persistent processing records.

A video may pass through several processes at different times. The system must be able to resume work without duplicating information.

#### Proposed processing sequence

**Acquisition** 
→ Register video
→ Collect YouTube metadata
→ Run AI intelligence extraction
→ Validate metadata
→ Create human review tasks where necessary
→ Determine publication eligibility
→ Publish
→ Continue enrichment

Each process should be able to operate independently.

For example, the YouTube Metadata Collector should not need to wait for the AI agent to finish analyzing another video.

Likewise, human review should not prevent other videos from moving through the pipeline.

#### Operational design principles

#### Independence

Each process has a clear responsibility and can be run independently.

#### Persistence

Jobs and their results are stored so processing can resume after interruptions.

#### Idempotency

Running a process more than once should not create duplicate videos, Plays, Wins, or other graph records.

#### Retry management

Temporary failures should be retried according to controlled rules.

#### Prioritization

Videos can be prioritized based on relevance, value, processing cost, and publication needs.

#### Provenance

Every important fact retains its origin and processing history.

#### Versioning

Prompts, models, extraction methods, and validation rules should be versioned.

#### Human feedback

Human review should improve the system rather than function only as a manual correction step.

## 8. AI Processing Strategy and Cost Management

The initial proof of concept should demonstrate the architecture without introducing unnecessary operating costs.

Not every video requires expensive analysis.

The Data Factory should use the least expensive reliable method capable of answering the question.

#### Proposed cost-conscious approach

| Process | Initial approach |
|---|---|
| Video discovery | YouTube Data API |
| Metadata collection | YouTube Data API |
| Initial classification | Rules and lightweight AI |
| Image analysis | Selected thumbnails |
| Detailed video analysis | Targeted when justified |
| Human review | Controlled workload |
| AI improvement | Verified examples and prompt refinement |

#### Progressive analysis

The AI agent should first assess the available metadata.

If the title, description, tags, and thumbnail provide sufficient evidence, detailed video analysis may not be necessary.

If an important field remains uncertain, the system can escalate that particular video for deeper analysis.

This avoids spending money analyzing information that can already be established.

#### YouTube access and limitations

The current development plan recognizes several important constraints:

- YouTube Data API provides useful official metadata.
- Creator-provided tags are not consistently reliable.
- Titles are often the most useful available text signal.
- YouTube category IDs are too broad to establish gambling content reliably.
- Search results can include false positives such as game trailers.
- Official transcript access is not generally available for arbitrary third-party videos through the normal captions download mechanism.
- Captions download requires appropriate OAuth authorization and ownership.
- Unauthorized scraping of YouTube's internal timed-text endpoints is not part of the proposed approach.

Thumbnail analysis can be useful when other metadata is sparse.

More detailed video understanding should use authorized footage or a properly licensed and permitted method. Any service claiming it can analyze arbitrary YouTube URLs should be evaluated against applicable terms and rights before adoption.

## 9. AI Accuracy and the Path Toward 100% Processing Coverage

The long-term objective is for AI to process all applicable metadata across the CloverEdge collection.

However, it is important to define what 100% means.

It should mean:

**100% of applicable metadata fields have been processed, assessed, and assigned an appropriate status.**

It should not mean that AI has successfully identified every possible fact.

Some facts may be impossible to observe.

For example, a video may show a winning amount but not reveal the denomination of the credits. The correct outcome is to preserve the win amount and mark the denomination as unknown.

#### Recommended improvement strategy

- Establish the first 50 manually verified videos.
- Use them as a gold-standard evaluation dataset.
- Run AI extraction against the dataset.
- Compare results attribute by attribute.
- Identify recurring errors.
- Improve prompts, rules, and extraction methods.
- Test again against the same verified examples.
- Expand the dataset as additional videos are reviewed.
- Introduce automation only when accuracy is measurable and acceptable.

AI should be evaluated on its ability to identify specific facts, not simply its ability to produce populated metadata.

A useful future capability would be to track extraction accuracy by:

- Game.
- Provider.
- Bet amount.
- Denomination.
- Win amount.
- Multiplier.
- Venue.
- Playing style.
- Content type.

This creates a measurable path toward increasingly automated metadata enrichment.

## 10. Data Factory Operational Dashboard

A future CloverEdge Studio dashboard should provide visibility into the entire acquisition and enrichment operation.

Suggested dashboard measures:

#### Processing pipeline

- Videos discovered today.
- Videos awaiting metadata collection.
- Videos awaiting AI analysis.
- Videos awaiting validation.
- Videos awaiting human review.
- Published but incomplete videos.
- Fully enriched videos.

#### Data quality

- AI accuracy by metadata attribute.
- Percentage of facts with evidence.
- Percentage of facts with confidence scores.
- Number of unresolved conflicts.
- Number of records with unknown or unobservable fields.
- Human correction rate.

#### Operational performance

- Processing jobs completed.
- Failed jobs.
- Retry counts.
- Average processing time.
- Acquisition volume.
- API quota consumption.
- AI processing costs.
- Cost per processed video.

The dashboard should make it easy to identify bottlenecks and understand where human effort or additional automation would provide the greatest benefit.

## 11. Initial Proof of Concept Roadmap

The first implementation should be deliberately controlled.

The objective is to prove the Data Factory architecture before expanding the volume of acquired information.

#### Phase 1 — Establish the acquisition pipeline

- Define the initial creator/channel list.
- Implement video acquisition.
- Register and deduplicate video records.
- Collect official YouTube metadata.
- Track acquisition history.

#### Phase 2 — Establish the metadata foundation

- Confirm the required video metadata fields.
- Define the structured extraction format.
- Map extracted facts to existing Prisma models.
- Confirm how evidence, confidence, and provenance will be retained.

#### Phase 3 — Establish the AI intelligence process

- Implement initial text-based extraction.
- Add thumbnail analysis where useful.
- Extract games, Plays, Wins, betting behavior, and content classifications.
- Preserve raw extraction results.

#### Phase 4 — Establish validation

- Define completeness and confidence rules.
- Identify missing and conflicting information.
- Create validation results.
- Determine minimum publication requirements.

#### Phase 5 — Establish human review

- Manually review the first approximately 50 videos.
- Create a verified gold-standard dataset.
- Record corrections and audit history.
- Measure AI accuracy by attribute.

#### Phase 6 — Establish publishing and enrichment

- Publish records that meet minimum requirements.
- Continue processing incomplete records.
- Track publication and enrichment states.
- Make updated metadata available to CloverEdge.

#### Phase 7 — Expand acquisition

- Add more creators.
- Introduce historical backfilling.
- Add targeted game searches.
- Improve prioritization and processing efficiency.

## 12. Relationship to CloverEdge's Broader Architecture

The Data Factory is one of the foundational capabilities of CloverEdge.

It directly supports several other major architectural areas.

#### Knowledge Graph Architecture

Defines how acquired information is represented, connected, and queried.

#### Video Metadata Specification

Defines the specific information the Data Factory must collect and extract.

#### AI, Inference, and Personalization Strategy

Defines how the resulting information is interpreted to identify patterns, interests, and recommendations.

#### Technical Architecture

Defines the technology, orchestration, data storage, job processing, and integration mechanisms used to implement the Data Factory.

#### Governance and Data Quality

Defines confidence, provenance, evidence, validation, auditability, and human review requirements.

#### Development Roadmap

Defines the sequence in which the capabilities should be implemented.

The Data Factory architecture should therefore be treated as a central input into these other documents.

## 13. Long-Term Strategic Direction

YouTube is the first acquisition source, not the ultimate boundary of the Data Factory.

The same architecture should eventually support multiple types of gambling information.

Potential future sources include:

- Casino websites and gaming information.
- Game manufacturer information.
- Online casino information.
- Creator profiles and content.
- Casino reviews.
- User reviews and experiences.
- Sports betting information.
- Prediction markets.
- Other gambling-related sources.

Each source will have its own collection and validation requirements, but the underlying principles should remain consistent.

Acquire information, establish provenance, extract structured facts, validate quality, connect the information to the Knowledge Graph, and continuously enrich it.

Over time, this will create a connected body of gambling knowledge that can support discovery, comparison, personalization, and recommendations.

## 14. Guiding Architectural Decisions

The following decisions capture the direction established in this discussion.

- The Data Factory is a core CloverEdge capability, not simply a YouTube importer.
- Data acquisition and enrichment will be organized as independent processes.
- YouTube will be the first major source of information.
- Daily discovery and historical archive acquisition will operate as complementary strategies.
- Official source metadata and AI-inferred metadata must remain distinguishable.
- AI extraction will produce structured information with evidence, confidence, and provenance.
- Validation will explicitly identify missing, uncertain, conflicting, and unobservable information.
- Human review will be part of the initial architecture and will contribute to AI improvement.
- Videos can be published when minimum requirements are satisfied.
- Published videos will continue to be enriched after publication.
- The first approximately 50 videos will form a manually verified gold-standard dataset.
- AI performance will be measured by metadata attribute.
- The architecture will prioritize cost-effective processing and avoid unnecessary expensive analysis.
- The Data Factory will populate and enrich the existing Knowledge Graph.
- PostgreSQL and Prisma remain the initial data foundation; a separate graph database is not currently required.
- Processing must be persistent, retryable, idempotent, and auditable.
- Unknown information must remain unknown rather than being fabricated.
- The architecture must support additional gambling information sources as CloverEdge expands.

## 15. Conclusion

The Data Factory is the mechanism through which CloverEdge turns scattered gambling information into structured, connected, and increasingly intelligent knowledge.

Its purpose is not simply to collect videos. It is to understand the information contained within those videos, identify the gambling experiences they represent, connect those experiences to games, creators, venues, and other knowledge, and continuously improve the quality of that information.

The most important architectural principle is that the system should not stop when a video is discovered or published.

It should continue processing, validating, learning, and enriching the information throughout its lifecycle.

This creates the foundation for CloverEdge's larger ambition:

**A gambling intelligence platform that understands relationships across gambling information and uses those relationships to help people discover experiences that genuinely match their interests.**

