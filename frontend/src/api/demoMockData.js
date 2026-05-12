export const demoMockData = {
  "/modules/": [
    {
      id: "module-1",
      title: "Vocales",
      slug: "vocales",
      description: "Aprende las 5 vocales básicas.",
      icon_name: "A",
      difficulty: "Básico",
      duration: "10 min",
      is_locked: false,
      is_published: true,
      progress: 80,
      elements: [
        { id: "e-1", name: "A", is_command: false },
        { id: "e-2", name: "E", is_command: false },
        { id: "e-3", name: "I", is_command: false },
        { id: "e-4", name: "O", is_command: false },
        { id: "e-5", name: "U", is_command: false }
      ]
    },
    {
      id: "module-2",
      title: "Saludos Básicos",
      slug: "saludos-basicos",
      description: "Aprende a decir Hola, Gracias y más.",
      icon_name: "👋",
      difficulty: "Básico",
      duration: "15 min",
      is_locked: false,
      is_published: true,
      progress: 20,
      elements: [
        { id: "e-6", name: "Hola", is_command: false },
        { id: "e-7", name: "Gracias", is_command: false }
      ]
    }
  ],
  "/progress/stats": {
    total_xp: 1250,
    current_streak: 5,
    global_accuracy: 92.5,
    modules_completed: 1,
    rank: "Principiante Avanzado"
  },
  "/progress/ranking": [
    { id: "u-1", full_name: "Demo User", avatar_initials: "DU", xp: 1250 },
    { id: "u-2", full_name: "Ana García", avatar_initials: "AG", xp: 1100 },
    { id: "u-3", full_name: "Carlos López", avatar_initials: "CL", xp: 950 }
  ],
  "/progress/history": [
    { id: "s-1", module_title: "Vocales", score: 50, accuracy: 95, created_at: new Date().toISOString() },
    { id: "s-2", module_title: "Saludos Básicos", score: 20, accuracy: 80, created_at: new Date(Date.now() - 86400000).toISOString() }
  ],
  "/users/": [
    {
      id: "user-1",
      full_name: "Demo Admin",
      email: "admin@demo.com",
      role: "super_admin",
      status: "active",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: "user-2",
      full_name: "Demo User",
      email: "user@demo.com",
      role: "user",
      status: "active",
      created_at: "2024-01-15T00:00:00Z"
    }
  ],
  "/admin-tools/analytics/general-stats": {
    total_users: 152,
    active_users_7d: 45,
    total_captures: 5200,
    total_modules: 12,
    avg_accuracy: 85.5
  },
  "/admin-tools/analytics/data-distribution": [
    { label: "A", count: 500 },
    { label: "E", count: 450 },
    { label: "Hola", count: 200 }
  ],
  "/admin-tools/analytics/module-distribution": [
    { name: "Vocales", value: 40 },
    { name: "Saludos", value: 30 },
    { name: "Números", value: 30 }
  ],
  "/admin-tools/analytics/recent-activity": [
    { action: "login", user: "Ana García", time: "Hace 5 min" },
    { action: "practice", user: "Carlos López", time: "Hace 15 min", detail: "Vocales - 95%" }
  ],
  "/admin-tools/analytics/top-students": [
    { id: "u-1", name: "Demo User", level: 5, xp: 1250, streak: 5 },
    { id: "u-2", name: "Ana García", level: 4, xp: 1100, streak: 3 },
    { id: "u-3", name: "Carlos López", level: 3, xp: 950, streak: 2 }
  ],
  "/admin-tools/analytics/weekly-progress": [
    { day: 'Lun', sessions: 12 },
    { day: 'Mar', sessions: 19 },
    { day: 'Mié', sessions: 15 },
    { day: 'Jue', sessions: 22 },
    { day: 'Vie', sessions: 30 },
    { day: 'Sáb', sessions: 10 },
    { day: 'Dom', sessions: 8 }
  ],
  "/settings/": [
    { key: "maintenance_mode", value: "false", category: "system", description: "Modo mantenimiento" },
    { key: "allow_registration", value: "true", category: "auth", description: "Permitir registro" },
    { key: "site_name", value: "Lenguaje de Señas IA", category: "branding", description: "Nombre del sitio" }
  ],
  "/settings/public": {
    maintenance_mode: "false",
    site_name: "Lenguaje de Señas IA"
  },
  "/notifications/": [
    {
      id: "n-1",
      title: "¡Bienvenido al Modo Demo!",
      message: "Estás explorando la plataforma en modo de solo lectura.",
      type: "info",
      category: "system",
      read: false,
      created_at: new Date().toISOString()
    }
  ],
  "/admin-tools/database/stats": {
    total_size_mb: 24.5,
    tables: [
      { name: "users", records: 4500, health: "Optimized" },
      { name: "modules", records: 32, health: "Healthy" },
      { name: "user_progress", records: 12500, health: "Optimized" },
      { name: "captured_data", records: 45000, health: "Healthy" }
    ]
  },
  "/admin-tools/database/backups": [
    { name: "backup_2024-05-10.db", date: "2024-05-10 03:00:00", size: "24.5 MB" },
    { name: "backup_2024-05-09.db", date: "2024-05-09 03:00:00", size: "24.2 MB" },
    { name: "backup_2024-05-08.db", date: "2024-05-08 03:00:00", size: "23.9 MB" }
  ]
};

export const getMockData = (url) => {
  if (url.includes('/auth/me')) {
    const userStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userStr ? JSON.parse(userStr) : { is_demo: true };
  }
  
  // Encontrar la clave que coincida con la URL parcial
  const key = Object.keys(demoMockData).find(k => url.includes(k));
  if (key) return demoMockData[key];
  return { success: true, mocked: true };
};
