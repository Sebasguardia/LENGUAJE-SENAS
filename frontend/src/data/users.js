// Sistema de rangos basado en XP
export const getRankByXP = (xp) => {
    if (xp >= 10000) return { name: 'Maestro de Señas', tier: 'Diamante', color: '#60A5FA' };
    if (xp >= 7000) return { name: 'Experto Avanzado', tier: 'Platino', color: '#A78BFA' };
    if (xp >= 5000) return { name: 'Comunicador Experto', tier: 'Oro', color: '#FBBF24' };
    if (xp >= 3000) return { name: 'Intérprete', tier: 'Plata', color: '#94A3B8' };
    if (xp >= 1500) return { name: 'Aprendiz Avanzado', tier: 'Bronce', color: '#FB923C' };
    if (xp >= 500) return { name: 'Estudiante', tier: 'Hierro', color: '#71717A' };
    return { name: 'Novato', tier: 'Sin Rango', color: '#52525B' };
};

// Usuarios del sistema (SOLO datos de perfil)
export const usersData = [
    {
        id: 1,
        name: 'María González',
        email: 'maria@email.com',
        password: 'password123', // En producción esto estará hasheado
        dni: '12345678',
        phone: '+51 987 654 321',
        role: 'usuario', // Solo 'usuario' o 'admin'
        avatar: 'MG',
        xp: 3450,
        status: 'active', // 'active' | 'inactive' | 'suspended'
        joinDate: '2024-01-15',
        lastLogin: '2024-01-25T14:30:00',
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        password: 'admin123',
        dni: '87654321',
        phone: '+51 912 345 678',
        role: 'superadmin', // Súper administrador con acceso total
        avatar: 'CR',
        xp: 0, // Super admin no tiene progreso
        status: 'active',
        joinDate: '2023-11-20',
        lastLogin: '2024-01-25T16:00:00',
    },
    {
        id: 3,
        name: 'Ana López',
        email: 'ana@email.com',
        password: 'password123',
        dni: '45678912',
        phone: '+51 923 456 789',
        role: 'usuario',
        avatar: 'AL',
        xp: 450,
        status: 'active',
        joinDate: '2024-02-01',
        lastLogin: '2024-02-06T10:15:00',
    },
    {
        id: 4,
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        password: 'password123',
        dni: '78912345',
        phone: '+51 934 567 890',
        role: 'usuario',
        avatar: 'JP',
        xp: 4850,
        status: 'active',
        joinDate: '2023-08-10',
        lastLogin: '2024-01-25T15:45:00',
    },
    {
        id: 5,
        name: 'Lucía Méndez',
        email: 'lucia.m@email.com',
        password: 'password123',
        dni: '32165498',
        phone: '+51 945 678 901',
        role: 'usuario',
        avatar: 'LM',
        xp: 0,
        status: 'active',
        joinDate: '2024-02-10',
        lastLogin: '2024-02-10T09:00:00',
    },
    {
        id: 6,
        name: 'Roberto Sánchez',
        email: 'roberto.s@email.com',
        password: 'password123',
        dni: '95175346',
        phone: '+51 956 789 012',
        role: 'usuario',
        avatar: 'RS',
        xp: 6500,
        status: 'active',
        joinDate: '2023-06-12',
        lastLogin: '2024-02-01T11:00:00',
    },
    {
        id: 7,
        name: 'Elena Torres',
        email: 'elena.t@email.com',
        password: 'password123',
        dni: '15926348',
        phone: '+51 967 890 123',
        role: 'usuario',
        avatar: 'ET',
        xp: 5800,
        status: 'active',
        joinDate: '2023-09-25',
        lastLogin: '2024-02-02T15:30:00',
    },
    {
        id: 8,
        name: 'David Castro',
        email: 'david.c@email.com',
        password: 'password123',
        dni: '75395146',
        phone: '+51 978 901 234',
        role: 'usuario',
        avatar: 'DC',
        xp: 2100,
        status: 'active',
        joinDate: '2024-01-05',
        lastLogin: '2024-02-03T18:45:00',
    },
    {
        id: 9,
        name: 'Sofia Ruiz',
        email: 'sofia.r@email.com',
        password: 'password123',
        dni: '25845613',
        phone: '+51 989 012 345',
        role: 'usuario',
        avatar: 'SR',
        xp: 4200,
        status: 'active',
        joinDate: '2023-12-01',
        lastLogin: '2024-02-04T09:15:00',
    },
    {
        id: 10,
        name: 'Javier Lima',
        email: 'javier.l@email.com',
        password: 'password123',
        dni: '36914725',
        phone: '+51 990 123 456',
        role: 'usuario',
        avatar: 'JL',
        xp: 8900,
        status: 'active',
        joinDate: '2023-05-20',
        lastLogin: '2024-02-05T20:00:00',
    },
    {
        id: 11,
        name: 'Patricia Vega',
        email: 'patricia.v@email.com',
        password: 'admin123',
        dni: '48527163',
        phone: '+51 901 234 567',
        role: 'admin', // Administrador sin acceso a configuración
        avatar: 'PV',
        xp: 0, // Admin no tiene progreso
        status: 'active',
        joinDate: '2024-01-10',
        lastLogin: '2024-02-05T14:00:00',
    }
];

export const userRoles = ['usuario', 'admin', 'superadmin'];

// Función helper para obtener usuario con su rango calculado
export const getUserWithRank = (userId) => {
    const user = usersData.find(u => u.id === userId);
    if (!user) return null;

    return {
        ...user,
        rank: getRankByXP(user.xp)
    };
};
