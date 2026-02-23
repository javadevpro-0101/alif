import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  School, 
  GraduationCap, 
  LogOut, 
  Plus, 
  MessageSquare,
  ChevronRight,
  UserPlus,
  Award,
  Calendar,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Components ---

const Navbar = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth?.user) return null;

  return (
    <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
          E
        </div>
        <span className="font-bold text-zinc-900 text-lg tracking-tight">eMaktab</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-zinc-900">{auth.user.full_name}</p>
          <p className="text-xs text-zinc-500 capitalize">{auth.user.role}</p>
        </div>
        <button 
          onClick={() => auth.logout()}
          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const auth = useContext(AuthContext);
  if (!auth?.user) return null;

  const links = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: School, label: 'Maktablar', path: '/admin/schools' },
      { icon: Users, label: 'Sinflar', path: '/admin/classes' },
      { icon: BookOpen, label: 'Fanlar', path: '/admin/subjects' },
      { icon: UserPlus, label: 'Foydalanuvchilar', path: '/admin/users' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
      { icon: BookOpen, label: 'Fanlarim', path: '/teacher/subjects' },
      { icon: UserPlus, label: 'O\'quvchi qo\'shish', path: '/teacher/register-student' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
    ],
    parent: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/parent' },
    ],
  };

  const currentLinks = links[auth.user.role] || [];

  return (
    <aside className="w-64 bg-zinc-50 border-r border-zinc-200 h-[calc(100vh-57px)] sticky top-[57px] hidden md:block p-4">
      <div className="space-y-1">
        {currentLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all group"
          >
            <link.icon size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

// --- Pages ---

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        auth?.login(data.token, data.user);
        navigate(`/${data.user.role}`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server bilan bog\'lanishda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Xush kelibsiz</h1>
          <p className="text-zinc-500 mt-2">Tizimga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Login</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Parol</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Admin Pages ---

const AdminDashboard = () => {
  const [stats, setStats] = useState({ schools: 0, classes: 0, users: 0 });
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${auth?.token}` };
      const [s, c, u] = await Promise.all([
        fetch('/api/admin/schools', { headers }).then(r => r.json()),
        fetch('/api/admin/classes', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
      ]);
      setStats({ schools: s.length, classes: c.length, users: u.length });
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Admin Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <School size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Maktablar</p>
              <p className="text-2xl font-bold text-zinc-900">{stats.schools}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Sinflar</p>
              <p className="text-2xl font-bold text-zinc-900">{stats.classes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Foydalanuvchilar</p>
              <p className="text-2xl font-bold text-zinc-900">{stats.users}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-red-50 border border-red-100 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-1">Xavfli hudud</h3>
            <p className="text-sm text-red-700">Barcha o'quvchilar, o'qituvchilar, baholar va fanlar ma'lumotlarini butunlay o'chirib tashlash.</p>
          </div>
          <button 
            onClick={async () => {
              if (confirm("Haqiqatan ham barcha o'quvchi va o'qituvchi ma'lumotlarini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) {
                const res = await fetch('/api/admin/clear-data', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${auth?.token}` }
                });
                const data = await res.json();
                alert(data.message);
                window.location.reload();
              }
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2"
          >
            <Trash2 size={20} /> Ma'lumotlarni tozalash
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSchools = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const auth = useContext(AuthContext);

  const fetchSchools = async () => {
    const res = await fetch('/api/admin/schools', {
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    setSchools(await res.json());
  };

  useEffect(() => { fetchSchools(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/schools', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ name }),
    });
    setName('');
    fetchSchools();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await fetch(`/api/admin/schools/${deletingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    fetchSchools();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Maktablar boshqaruvi</h2>
      </div>
      
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Maktab nomi"
          className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
          <Plus size={18} /> Qo'shish
        </button>
      </form>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nomi</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {schools.map(s => (
              <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-500">#{s.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{s.name}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setDeletingId(s.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all ml-auto"
                  >
                    <Trash2 size={14} /> O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Maktabni o'chirish"
        message="Haqiqatan ham ushbu maktabni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
      />
    </div>
  );
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    school_id: '',
    class_id: '',
    parent_id: ''
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${auth?.token}` };
      const [s, c, p] = await Promise.all([
        fetch('/api/common/schools', { headers }).then(r => r.json()),
        fetch('/api/common/classes', { headers }).then(r => r.json()),
        fetch('/api/common/parents', { headers }).then(r => r.json()),
      ]);
      setSchools(s);
      setClasses(c);
      setParents(p);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ ...formData, role: 'student' }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setFormData({ username: '', password: '', full_name: '', school_id: '', class_id: '', parent_id: '' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">O'quvchi ro'yxatdan o'tkazish</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">F.I.SH</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Parol</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Maktab</label>
            <select
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.school_id}
              onChange={(e) => setFormData({...formData, school_id: e.target.value})}
              required
            >
              <option value="">Tanlang</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Sinf</label>
            <select
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.class_id}
              onChange={(e) => setFormData({...formData, class_id: e.target.value})}
              required
            >
              <option value="">Tanlang</option>
              {classes.filter(c => c.school_id == formData.school_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Ota-ona (Ixtiyoriy)</label>
            <select
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.parent_id}
              onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
            >
              <option value="">Tanlang</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
        </div>
        {message && <p className={cn("text-sm font-medium", message.includes('xato') ? "text-red-500" : "text-emerald-600")}>{message}</p>}
        <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
          Ro'yxatdan o'tkazish
        </button>
      </form>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-in zoom-in duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
          <p className="text-zinc-500 text-sm">{message}</p>
        </div>
        <div className="flex border-t border-zinc-100">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors border-r border-zinc-100"
          >
            Bekor qilish
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-6 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave, classes, parents }: any) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    username: user.username,
    class_id: user.class_id || '',
    parent_id: user.parent_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100">
          <h3 className="text-xl font-bold text-zinc-900">Tahrirlash</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">F.I.SH</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          {user.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Sinf</label>
                <select
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.class_id}
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                  required
                >
                  <option value="">Tanlang</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Ota-ona</label>
                <select
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                >
                  <option value="">Tanlang</option>
                  {parents.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const auth = useContext(AuthContext);

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${auth?.token}` };
    const [uRes, cRes, pRes] = await Promise.all([
      fetch('/api/admin/users', { headers }),
      fetch('/api/common/classes', { headers }),
      fetch('/api/common/parents', { headers })
    ]);
    setUsers(await uRes.json());
    setClasses(await cRes.json());
    setParents(await pRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await fetch(`/api/admin/users/${deletingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleUpdate = async (formData: any) => {
    const res = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setEditingUser(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Foydalanuvchilar</h2>
          <p className="text-sm text-zinc-500">Tizimdagi barcha foydalanuvchilarni boshqarish</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Barcha rollar</option>
            <option value="admin">Adminlar</option>
            <option value="teacher">O'qituvchilar</option>
            <option value="student">O'quvchilar</option>
            <option value="parent">Ota-onalar</option>
          </select>
          <Link to="/admin/register-teacher" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            O'qituvchi qo'shish
          </Link>
          <Link to="/admin/register-student" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
            O'quvchi qo'shish
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">F.I.SH</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Username</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{u.full_name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{u.username}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                    u.role === 'admin' ? "bg-red-100 text-red-700" :
                    u.role === 'teacher' ? "bg-blue-100 text-blue-700" :
                    u.role === 'student' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                      <Edit size={14} /> Tahrirlash
                    </button>
                    <button 
                      onClick={() => setDeletingId(u.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                      <Trash2 size={14} /> O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Foydalanuvchilar topilmadi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdate}
          classes={classes}
          parents={parents}
        />
      )}
      <ConfirmationModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Foydalanuvchini o'chirish"
        message="Haqiqatan ham ushbu foydalanuvchini o'chirmoqchimisiz? Barcha bog'liq ma'lumotlar ham o'chib ketishi mumkin."
      />
    </div>
  );
};

const TeacherRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    school_id: '',
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${auth?.token}` };
      const s = await fetch('/api/common/schools', { headers }).then(r => r.json());
      setSchools(s);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ ...formData, role: 'teacher' }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setFormData({ username: '', password: '', full_name: '', school_id: '' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">O'qituvchi ro'yxatdan o'tkazish</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">F.I.SH</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Parol</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Maktab</label>
            <select
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.school_id}
              onChange={(e) => setFormData({...formData, school_id: e.target.value})}
              required
            >
              <option value="">Tanlang</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        {message && <p className={cn("text-sm font-medium", message.includes('xato') ? "text-red-500" : "text-emerald-600")}>{message}</p>}
        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          O'qituvchini qo'shish
        </button>
      </form>
    </div>
  );
};

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const auth = useContext(AuthContext);

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${auth?.token}` };
    const [cRes, sRes] = await Promise.all([
      fetch('/api/admin/classes', { headers }),
      fetch('/api/admin/schools', { headers })
    ]);
    setClasses(await cRes.json());
    setSchools(await sRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ name, school_id: parseInt(schoolId) }),
    });
    setName('');
    setSchoolId('');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await fetch(`/api/admin/classes/${deletingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Sinflar boshqaruvi</h2>
      
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Sinf nomi (masalan: 9-A)"
          className="px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          required
        >
          <option value="">Maktabni tanlang</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold">
          <Plus size={18} /> Sinf qo'shish
        </button>
      </form>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sinf nomi</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Maktab</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {classes.map(c => (
              <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-500">#{c.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{c.school_name}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setDeletingId(c.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all ml-auto"
                  >
                    <Trash2 size={14} /> O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Sinfni o'chirish"
        message="Haqiqatan ham ushbu sinfni o'chirmoqchimisiz? Bu sinfdagi barcha o'quvchilar ma'lumotlariga ta'sir qilishi mumkin."
      />
    </div>
  );
};

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const auth = useContext(AuthContext);

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${auth?.token}` };
    const [subRes, tRes, cRes] = await Promise.all([
      fetch('/api/admin/subjects', { headers }),
      fetch('/api/common/teachers', { headers }),
      fetch('/api/common/classes', { headers })
    ]);
    setSubjects(await subRes.json());
    setTeachers(await tRes.json());
    setClasses(await cRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ name, teacher_id: parseInt(teacherId), class_id: parseInt(classId) }),
    });
    setName('');
    setTeacherId('');
    setClassId('');
    fetchData();
  };

  const handleUpdateTeacher = async (subjectId: number) => {
    if (!newTeacherId) return;
    await fetch(`/api/admin/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ teacher_id: parseInt(newTeacherId) }),
    });
    setEditingSubject(null);
    setNewTeacherId('');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await fetch(`/api/admin/subjects/${deletingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Fanlar boshqaruvi</h2>
      
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Fan nomi"
          className="px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        >
          <option value="">O'qituvchini tanlang</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
        <select
          className="px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          required
        >
          <option value="">Sinfni tanlang</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold">
          <Plus size={18} /> Fan qo'shish
        </button>
      </form>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Fan</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">O'qituvchi</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Sinf</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {subjects.map(s => (
              <tr key={s.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{s.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {editingSubject === s.id ? (
                    <select
                      className="px-2 py-1 border border-zinc-300 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newTeacherId}
                      onChange={(e) => setNewTeacherId(e.target.value)}
                    >
                      <option value="">Tanlang</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  ) : (
                    s.teacher_name
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{s.class_name}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingSubject === s.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdateTeacher(s.id)}
                          className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                        >
                          Saqlash
                        </button>
                        <button 
                          onClick={() => setEditingSubject(null)}
                          className="text-zinc-400 hover:text-zinc-500 font-bold text-xs"
                        >
                          Bekor qilish
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setEditingSubject(s.id);
                            setNewTeacherId(s.teacher_id.toString());
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Users size={14} /> Biriktirish
                        </button>
                        <button 
                          onClick={() => setDeletingId(s.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                        >
                          <Trash2 size={14} /> O'chirish
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Fanni o'chirish"
        message="Haqiqatan ham ushbu fanni o'chirmoqchimisiz? Bu fanga tegishli barcha baholar ham o'chib ketishi mumkin."
      />
    </div>
  );
};

// --- Teacher Pages ---

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [gradingStudentId, setGradingStudentId] = useState<number | null>(null);
  const [successStudentId, setSuccessStudentId] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingGradeId, setDeletingGradeId] = useState<number | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const auth = useContext(AuthContext);

  const fetchInitialData = async () => {
    const headers = { 'Authorization': `Bearer ${auth?.token}` };
    const [subRes, cRes, pRes, gRes] = await Promise.all([
      fetch('/api/teacher/subjects', { headers }),
      fetch('/api/common/classes', { headers }),
      fetch('/api/common/parents', { headers }),
      fetch('/api/teacher/recent-grades', { headers })
    ]);
    setSubjects(await subRes.json());
    setClasses(await cRes.json());
    setParents(await pRes.json());
    setRecentGrades(await gRes.json());
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectSubject = async (sub: any) => {
    setSelectedSubject(sub);
    const headers = { 'Authorization': `Bearer ${auth?.token}` };
    const res = await fetch(`/api/teacher/students/${sub.class_id}`, { headers });
    setStudents(await res.json());
  };

  const handleUpdateStudent = async (formData: any) => {
    const res = await fetch(`/api/admin/users/${editingStudent.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setEditingStudent(null);
      handleSelectSubject(selectedSubject);
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingId) return;
    const res = await fetch(`/api/admin/users/${deletingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    if (res.ok) {
      handleSelectSubject(selectedSubject);
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleDeleteGrade = async () => {
    if (!deletingGradeId) return;
    const res = await fetch(`/api/teacher/grades/${deletingGradeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth?.token}` }
    });
    if (res.ok) {
      fetchInitialData();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleGrade = async (studentId: number) => {
    if (!score) return alert('Baho kiriting');
    const res = await fetch('/api/teacher/grades', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
      },
      body: JSON.stringify({ 
        student_id: studentId, 
        subject_id: selectedSubject.id, 
        score: parseInt(score), 
        comment 
      }),
    });
    
    if (res.ok) {
      setSuccessStudentId(studentId);
      setTimeout(() => setSuccessStudentId(null), 3000);
      setScore('');
      setComment('');
      setGradingStudentId(null);
      fetchInitialData(); // Refresh recent grades
    } else {
      alert('Xatolik yuz berdi');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">O'qituvchi paneli</h2>
        {selectedSubject && (
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setSelectedSubject(null);
                setGradingStudentId(null);
              }}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              ← Barcha fanlar
            </button>
          </div>
        )}
      </div>
      
      {!selectedSubject ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <p className="text-sm text-zinc-500 mb-1">Biriktirilgan fanlar</p>
              <p className="text-3xl font-bold text-zinc-900">{subjects.length}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Mening fanlarim</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSelectSubject(sub)}
                className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="font-bold text-zinc-900 text-lg">{sub.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">{sub.class_name} sinfi</p>
              </button>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-zinc-300 text-center">
                <p className="text-zinc-500">Sizga hali fanlar biriktirilmagan.</p>
              </div>
            )}
          </div>

          {recentGrades.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Oxirgi qo'yilgan baholar</h3>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">O'quvchi</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Fan</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Baho</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {recentGrades.map(g => (
                      <tr key={g.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">{g.student_name}</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">{g.subject_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold text-xs">
                            {g.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setDeletingGradeId(g.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Bahoni o'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900">{selectedSubject.name}</h3>
            <p className="text-zinc-500">{selectedSubject.class_name} sinfi o'quvchilari</p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">O'quvchi F.I.SH</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {students.map(s => (
                  <React.Fragment key={s.id}>
                    <tr className="hover:bg-zinc-50 transition-colors relative">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                        <div className="flex items-center gap-2">
                          {s.full_name}
                          <AnimatePresence>
                            {successStudentId === s.id && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-emerald-600"
                              >
                                <CheckCircle2 size={16} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <AnimatePresence>
                          {successStudentId === s.id && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="absolute right-0 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-2 rounded-l-lg shadow-lg z-10 flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} />
                              <span className="text-xs font-bold">Baho saqlandi!</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingStudent(s)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <Edit size={14} /> Tahrirlash
                          </button>
                          <button 
                            onClick={() => setDeletingId(s.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                          <div className="h-6 w-px bg-zinc-200 mx-1" />
                          <button 
                            onClick={() => {
                              if (gradingStudentId === s.id) {
                                setGradingStudentId(null);
                              } else {
                                setGradingStudentId(s.id);
                                setScore('');
                                setComment('');
                              }
                            }}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm",
                              gradingStudentId === s.id 
                                ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {gradingStudentId === s.id ? 'Bekor qilish' : 'Baho qo\'yish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {gradingStudentId === s.id && (
                      <tr className="bg-emerald-50/30">
                        <td colSpan={2} className="px-6 py-4">
                          <div className="flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col">
                              <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 ml-1">Baho (1-5 yoki 1-100)</label>
                              <input 
                                type="number" 
                                min="1"
                                max="100"
                                placeholder="Baho" 
                                className="w-24 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <div className="flex flex-col flex-1 min-w-[200px]">
                              <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 ml-1">Izoh</label>
                              <input 
                                type="text" 
                                placeholder="Darsdagi faolligi haqida..." 
                                className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>
                            <button 
                              onClick={() => handleGrade(s.id)}
                              className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Saqlash
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                Bu sinfda o'quvchilar topilmadi.
              </div>
            )}
          </div>
        </div>
      )}
      {editingStudent && (
        <EditUserModal 
          user={{...editingStudent, role: 'student'}} 
          onClose={() => setEditingStudent(null)} 
          onSave={handleUpdateStudent}
          classes={classes}
          parents={parents}
        />
      )}
      <ConfirmationModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteStudent}
        title="O'quvchini o'chirish"
        message="Haqiqatan ham ushbu o'quvchini o'chirmoqchimisiz? Barcha baholar va davomat ma'lumotlari ham o'chib ketadi."
      />
      <ConfirmationModal 
        isOpen={!!deletingGradeId}
        onClose={() => setDeletingGradeId(null)}
        onConfirm={handleDeleteGrade}
        title="Bahoni o'chirish"
        message="Haqiqatan ham ushbu bahoni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
      />
    </div>
  );
};

// --- Student/Parent Pages ---

const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/student/data', {
        headers: { 'Authorization': `Bearer ${auth?.token}` }
      });
      setData(await res.json());
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-6 text-zinc-500">Yuklanmoqda...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          {auth?.user?.role === 'parent' ? 'Farzand ma\'lumotlari' : 'O\'quvchi paneli'}
        </h2>
        <div className="text-sm text-zinc-500">Xush kelibsiz, <span className="font-bold text-zinc-900">{auth?.user?.full_name}</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-500 mb-1">O'rtacha baho</p>
          <p className="text-3xl font-bold text-zinc-900">
            {data.grades.length > 0 
              ? (data.grades.reduce((acc: number, g: any) => acc + g.score, 0) / data.grades.length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-500 mb-1">Jami baholar</p>
          <p className="text-3xl font-bold text-zinc-900">{data.grades.length}</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Award size={20} className="text-emerald-600" /> Oxirgi baholar
          </h3>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Fan</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Baho</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.grades.map((g: any) => (
                  <tr key={g.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{g.subject_name}</div>
                      {g.comment && <div className="text-xs text-zinc-400 italic flex items-center gap-1 mt-1"><MessageSquare size={12} /> {g.comment}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm",
                        g.score >= 4 ? "bg-emerald-100 text-emerald-700" : g.score >= 3 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {g.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{g.date}</td>
                  </tr>
                ))}
                {data.grades.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">Baholar hali mavjud emas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Router>
        <div className="min-h-screen bg-zinc-50 font-sans">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
                <Route path="/admin/schools" element={user?.role === 'admin' ? <AdminSchools /> : <Navigate to="/login" />} />
                <Route path="/admin/classes" element={user?.role === 'admin' ? <AdminClasses /> : <Navigate to="/login" />} />
                <Route path="/admin/subjects" element={user?.role === 'admin' ? <AdminSubjects /> : <Navigate to="/login" />} />
                <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} />
                <Route path="/admin/register-student" element={user?.role === 'admin' ? <StudentRegistration /> : <Navigate to="/login" />} />
                <Route path="/admin/register-teacher" element={user?.role === 'admin' ? <TeacherRegistration /> : <Navigate to="/login" />} />
                
                {/* Teacher Routes */}
                <Route path="/teacher" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
                <Route path="/teacher/subjects" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
                <Route path="/teacher/register-student" element={user?.role === 'teacher' ? <StudentRegistration /> : <Navigate to="/login" />} />
                
                {/* Student/Parent Routes */}
                <Route path="/student" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
                <Route path="/parent" element={user?.role === 'parent' ? <StudentDashboard /> : <Navigate to="/login" />} />
                
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
