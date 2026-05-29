# DocuVault

## ✨ Overview
DocuVault is a full‑stack document management system that lets users upload PDFs, stores the files on disk, tracks metadata in PostgreSQL, and provides real‑time notifications for bulk uploads via Server‑Sent Events (SSE). The project demonstrates clean architecture using Spring Boot (Java 21) on the backend and React 18 + Vite on the frontend.

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide‑React icons, Zustand for state, Google Font *Livvic* |
| Backend | Java 21, Spring Boot 3.x, Spring Data JPA, Maven, Lombok |
| Database | PostgreSQL |
| File Storage | Local disk (`./uploads/`), UUID‑prefixed filenames |
| Real‑time | Server‑Sent Events (SSE) |
| Build/Run | `npm run dev` (frontend), `mvn spring-boot:run` (backend) |

---

## 📦 Core Models (Beginner → Advanced)
### 1️⃣ `UploadedFile` – File Metadata Model (Beginner)
- **Location:** `backend/src/main/java/com/docuvault/model/UploadedFile.java`
- **Purpose:** Represents a single uploaded document. Stores filename, size, MIME type, storage path, upload timestamp, and processing status.
- **Implementation Highlights:**
  ```java
  @Entity
  @Table(name = "uploaded_files")
  public class UploadedFile {
      @Id @GeneratedValue @Column(name = "id") private Long id;
      @Column(name = "file_name") private String fileName;
      @Column(name = "file_size") private Long fileSize;
      @Column(name = "file_type") private String fileType;
      @Column(name = "storage_path") private String storagePath;
      @Column(name = "upload_date") private LocalDateTime uploadDate;
      @Column(name = "status") @Enumerated(EnumType.STRING) private FileStatus status;
  }
  ```
- **Usage Flow:** Persisted by `FileStorageService` after a file is saved to `./uploads/`. The repository `UploadedFileRepository` provides CRUD operations.

### 2️⃣ `Notification` – Real‑time Notification Model (Intermediate)
- **Location:** `backend/src/main/java/com/docuvault/model/Notification.java`
- **Purpose:** Stores a notification generated when a bulk upload finishes. Fields include message, type, timestamp, read flag, and a reference to related files.
- **Implementation Highlights:**
  ```java
  @Entity
  @Table(name = "notifications")
  public class Notification {
      @Id @GeneratedValue private Long id;
      private String message;
      private String type; // e.g., "BULK_UPLOAD_COMPLETE"
      private LocalDateTime timestamp;
      private boolean isRead = false;
      @ElementCollection
      @CollectionTable(name = "notification_files", joinColumns = @JoinColumn(name = "notification_id"))
      @Column(name = "file_id")
      private Set<Long> relatedFileIds = new HashSet<>();
  }
  ```
- **Advanced Aspects:**
  - Uses `@ElementCollection` to keep a list of related file IDs.
  - Integrated with `NotificationService` to broadcast via SSE.
  - Indexed for fast queries (e.g., unread count).

### 3️⃣ `NotificationDTO` – Data‑Transfer Object (Advanced)
- **Location:** `backend/src/main/java/com/docuvault/dto/NotificationDTO.java`
- **Purpose:** Decouples the internal JPA entity from the JSON payload sent to the frontend. It contains only the fields required by the UI (`id`, `message`, `type`, `timestamp`, `isRead`).
- **Implementation Highlights:**
  ```java
  public class NotificationDTO {
      private Long id;
      private String message;
      private String type;
      private LocalDateTime timestamp;
      private boolean isRead;
      // Constructors, getters, setters omitted for brevity
  }
  ```
- **Why DTO?** Enables version‑tolerant APIs and prevents exposing internal JPA annotations or lazy‑loaded relationships.

---

## 🔧 How the Models Fit Together (Workflow)
1. **Upload Request** – `POST /api/files/upload` receives multipart files.
2. **File Storage Service** stores each file on disk (`./uploads/{uuid}_{originalName}`) and creates an `UploadedFile` entity persisted via `UploadedFileRepository`.
3. **Bulk Detection** – If more than three files are uploaded, the service marks the request as *asynchronous* and immediately returns `{status: "PROCESSING"}`.
4. **Async Completion** – After background processing finishes, `NotificationService` creates a `Notification` entity and a matching `NotificationDTO`.
5. **SSE Broadcast** – All open clients subscribed to `GET /api/sse/subscribe` receive an SSE event containing the DTO. The frontend stores it in a Zustand store and shows a toast/badge.
6. **Read/Mark‑All** – UI actions call `NotificationController` endpoints to update `isRead` or delete notifications, which are persisted back to PostgreSQL.

---

## 📚 Beginner → Advanced Learning Path
| Level | What to Focus On |
|-------|-------------------|
| **Beginner** | Understanding JPA annotations, basic CRUD repositories, file I/O in Java, basic React component structure. |
| **Intermediate** | Spring `@Async`, SSE (`SseEmitter`), mapping entities to DTOs, Zustand for global state, Tailwind theming, handling UUID filenames. |
| **Advanced** | Optimizing bulk processing with thread pools, designing idempotent notification flows, security (CSRF, CORS), Dockerising the app, CI/CD pipelines, performance testing of SSE under load. |

---

## 📖 Updating the README
The file `README.md` now contains the full technical overview, tech‑stack table, model descriptions, and a learning roadmap. Feel free to modify any section to match your teaching style.

---

*Happy coding! 🚀*