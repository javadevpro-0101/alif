import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("school.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- admin, teacher, student, parent
    full_name TEXT,
    school_id INTEGER,
    class_id INTEGER,
    parent_id INTEGER -- for students to link to parents
  );

  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    school_id INTEGER,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    teacher_id INTEGER,
    class_id INTEGER,
    FOREIGN KEY(teacher_id) REFERENCES users(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject_id INTEGER,
    score INTEGER,
    comment TEXT,
    date TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("javohir0101", 10);
  db.prepare("INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)").run(
    "javadevpro.0101",
    hashedPassword,
    "admin",
    "System Administrator"
  );
} else if ((adminExists as any).username === 'admin') {
  // Update old admin to new credentials
  const hashedPassword = bcrypt.hashSync("javohir0101", 10);
  db.prepare("UPDATE users SET username = ?, password = ? WHERE id = ?").run(
    "javadevpro.0101",
    hashedPassword,
    (adminExists as any).id
  );
}

const app = express();
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
  } else {
    res.status(401).json({ message: "Noto'g'ri login yoki parol" });
  }
});

// Admin Routes
app.get("/api/admin/schools", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const schools = db.prepare("SELECT * FROM schools").all();
  res.json(schools);
});

app.post("/api/admin/schools", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name } = req.body;
  try {
    db.prepare("INSERT INTO schools (name) VALUES (?)").run(name);
    res.status(201).json({ message: "Maktab yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Maktab nomi band" });
  }
});

app.delete("/api/admin/schools/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare("DELETE FROM schools WHERE id = ?").run(req.params.id);
  res.json({ message: "Maktab o'chirildi" });
});

app.get("/api/admin/classes", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const classes = db.prepare(`
    SELECT classes.*, schools.name as school_name 
    FROM classes 
    JOIN schools ON classes.school_id = schools.id
  `).all();
  res.json(classes);
});

app.post("/api/admin/classes", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name, school_id } = req.body;
  db.prepare("INSERT INTO classes (name, school_id) VALUES (?, ?)").run(name, school_id);
  res.status(201).json({ message: "Sinf yaratildi" });
});

app.delete("/api/admin/classes/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
  res.json({ message: "Sinf o'chirildi" });
});

app.get("/api/admin/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const users = db.prepare("SELECT id, username, role, full_name, school_id, class_id, parent_id FROM users").all();
  res.json(users);
});

app.post("/api/admin/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.sendStatus(403);
  const { username, password, role, full_name, school_id, class_id, parent_id } = req.body;
  
  // If teacher is creating, force role to student
  const finalRole = req.user.role === 'teacher' ? 'student' : role;
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    db.prepare(`
      INSERT INTO users (username, password, role, full_name, school_id, class_id, parent_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(username, hashedPassword, finalRole, full_name, school_id, class_id, parent_id);
    res.status(201).json({ message: "Foydalanuvchi yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Username band" });
  }
});

app.post("/api/admin/clear-data", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    const deleteGrades = db.prepare("DELETE FROM grades");
    const deleteSubjects = db.prepare("DELETE FROM subjects");
    const deleteUsers = db.prepare("DELETE FROM users WHERE role IN ('student', 'teacher')");
    
    const transaction = db.transaction(() => {
      deleteGrades.run();
      deleteSubjects.run();
      deleteUsers.run();
    });
    
    transaction();
    res.json({ message: "O'quvchi va o'qituvchi ma'lumotlari muvaffaqiyatli tozalandi" });
  } catch (e) {
    res.status(500).json({ message: "Ma'lumotlarni tozalashda xatolik yuz berdi" });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.sendStatus(403);
  
  if (req.user.id === parseInt(req.params.id)) {
    return res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });
  }

  // If teacher is deleting, they can only delete students
  if (req.user.role === 'teacher') {
    const targetUser: any = db.prepare("SELECT role FROM users WHERE id = ?").get(req.params.id);
    if (!targetUser || targetUser.role !== 'student') {
      return res.status(403).json({ message: "O'qituvchilar faqat o'quvchilarni o'chira oladi" });
    }
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ message: "Foydalanuvchi o'chirildi" });
});

app.put("/api/admin/users/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.sendStatus(403);
  const { full_name, class_id, parent_id, username } = req.body;
  
  // If teacher is editing, they can only edit students
  if (req.user.role === 'teacher') {
    const targetUser: any = db.prepare("SELECT role FROM users WHERE id = ?").get(req.params.id);
    if (!targetUser || targetUser.role !== 'student') {
      return res.status(403).json({ message: "O'qituvchilar faqat o'quvchilarni tahrirlashi mumkin" });
    }
  }

  try {
    db.prepare(`
      UPDATE users 
      SET full_name = ?, class_id = ?, parent_id = ?, username = ?
      WHERE id = ?
    `).run(full_name, class_id, parent_id, username, req.params.id);
    res.json({ message: "Ma'lumotlar yangilandi" });
  } catch (e) {
    res.status(400).json({ message: "Xatolik yuz berdi (ehtimol username band)" });
  }
});

app.get("/api/common/parents", authenticateToken, (req: any, res) => {
  const parents = db.prepare("SELECT id, full_name FROM users WHERE role = 'parent'").all();
  res.json(parents);
});

app.get("/api/common/schools", authenticateToken, (req: any, res) => {
  const schools = db.prepare("SELECT * FROM schools").all();
  res.json(schools);
});

app.get("/api/common/classes", authenticateToken, (req: any, res) => {
  const classes = db.prepare("SELECT * FROM classes").all();
  res.json(classes);
});

app.get("/api/admin/subjects", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const subjects = db.prepare(`
    SELECT subjects.*, users.full_name as teacher_name, classes.name as class_name 
    FROM subjects 
    JOIN users ON subjects.teacher_id = users.id 
    JOIN classes ON subjects.class_id = classes.id
  `).all();
  res.json(subjects);
});

app.post("/api/admin/subjects", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name, teacher_id, class_id } = req.body;
  db.prepare("INSERT INTO subjects (name, teacher_id, class_id) VALUES (?, ?, ?)").run(name, teacher_id, class_id);
  res.status(201).json({ message: "Fan yaratildi" });
});

app.put("/api/admin/subjects/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { teacher_id } = req.body;
  db.prepare("UPDATE subjects SET teacher_id = ? WHERE id = ?").run(teacher_id, req.params.id);
  res.json({ message: "O'qituvchi muvaffaqiyatli biriktirildi" });
});

app.delete("/api/admin/subjects/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
  res.json({ message: "Fan o'chirildi" });
});

app.get("/api/common/teachers", authenticateToken, (req: any, res) => {
  const teachers = db.prepare("SELECT id, full_name FROM users WHERE role = 'teacher'").all();
  res.json(teachers);
});

// Teacher Routes
app.get("/api/teacher/subjects", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);
  const subjects = db.prepare(`
    SELECT subjects.*, classes.name as class_name 
    FROM subjects 
    JOIN classes ON subjects.class_id = classes.id 
    WHERE teacher_id = ?
  `).all(req.user.id);
  res.json(subjects);
});

app.get("/api/teacher/students/:classId", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);
  const students = db.prepare("SELECT id, full_name, username, class_id, parent_id FROM users WHERE role = 'student' AND class_id = ?").all(req.params.classId);
  res.json(students);
});

app.post("/api/teacher/grades", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);
  const { student_id, subject_id, score, comment } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.prepare("INSERT INTO grades (student_id, subject_id, score, comment, date) VALUES (?, ?, ?, ?, ?)").run(
    student_id, subject_id, score, comment, date
  );
  res.status(201).json({ message: "Baho qo'yildi" });
});

// Student/Parent Routes
app.get("/api/student/data", authenticateToken, (req: any, res) => {
  let studentId = req.user.id;
  if (req.user.role === 'parent') {
    const child = db.prepare("SELECT id FROM users WHERE parent_id = ?").get(req.user.id);
    if (!child) return res.status(404).json({ message: "Farzand topilmadi" });
    studentId = (child as any).id;
  } else if (req.user.role !== 'student') {
    return res.sendStatus(403);
  }

  const grades = db.prepare(`
    SELECT grades.*, subjects.name as subject_name 
    FROM grades 
    JOIN subjects ON grades.subject_id = subjects.id 
    WHERE student_id = ?
  `).all(studentId);

  res.json({ grades });
});

app.delete("/api/teacher/grades/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);
  
  // Ensure the teacher owns the subject for this grade
  const grade: any = db.prepare(`
    SELECT g.id FROM grades g
    JOIN subjects s ON g.subject_id = s.id
    WHERE g.id = ? AND s.teacher_id = ?
  `).get(req.params.id, req.user.id);

  if (!grade) return res.status(403).json({ message: "Siz faqat o'zingiz qo'ygan baholarni o'chira olasiz" });

  db.prepare("DELETE FROM grades WHERE id = ?").run(req.params.id);
  res.json({ message: "Baho o'chirildi" });
});

app.get("/api/teacher/recent-grades", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);
  
  const grades = db.prepare(`
    SELECT g.*, u.full_name as student_name, s.name as subject_name
    FROM grades g
    JOIN users u ON g.student_id = u.id
    JOIN subjects s ON g.subject_id = s.id
    WHERE s.teacher_id = ?
    ORDER BY g.created_at DESC
    LIMIT 20
  `).all(req.user.id);
  
  res.json(grades);
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
