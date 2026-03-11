export type User = {
    id: string;
    mobile: string;
    name: string;
    pin: string;
    role: 'USER' | 'ADMIN' | 'BANNED';
    referralCode?: string; // New
    balance: number; // Points
    is_banned?: boolean; // New
    warning_message?: string; // New
    created_at?: string;
};

export type Ad = {
    id: string;
    title: string;
    videoUrl: string; // Simulate video
    reward: number; // Points e.g., 50
    duration: number; // Seconds
    minCards?: number; // New
    minTasks?: number; // New
    isActive?: boolean; // New
    created_at?: string;
};

export type Withdrawal = {
    id: string;
    userId: string;
    user_id?: string; // DB
    userName?: string;
    userMobile?: string;
    amount: number;
    points: number;
    upiId?: string;
    upi_id?: string; // DB
    accountHolderName?: string; // New field
    name?: string; // DB
    method?: 'UPI' | 'BANK';
    accountNo?: string;
    ifsc?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    date: string;
    created_at?: string; // DB
};

export type Transaction = {
    id: string;
    userId?: string;
    amount: number;
    type: 'SIGNUP_BONUS' | 'REFERRAL_COMMISSION' | 'AD_REWARD' | 'APP_REWARD' | 'WITHDRAWAL' | 'REFUND' | 'ADMIN_WARNING' | 'DAILY_LOGIN' | 'ADMIN_ADJUSTMENT' | 'TASK_REMINDER' | 'SCRATCH_CARD' | 'OFFER_CLAIM';
    description: string;
    created_at: string;
};

// Start with standard mock data
const INITIAL_ADS: Ad[] = [
    { id: '1', title: 'Nike - Just Do It', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', reward: 100, duration: 10 },
    { id: '2', title: 'Coca Cola - Refresh', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', reward: 50, duration: 5 },
    { id: '3', title: 'Samsung Galaxy S24', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', reward: 200, duration: 15 },
];

const MOCK_STORAGE_KEYS = {
    USERS: 'earnify_users',
    ADS: 'earnify_ads',
    WITHDRAWALS: 'earnify_withdrawals',
    CURRENT_USER: 'earnify_session',
};

// Helper for local storage
const getStorage = <T>(key: string, initial: T): T => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
};

const setStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
};

export const DataService = {
    // ADS
    getAds: (): Ad[] => getStorage(MOCK_STORAGE_KEYS.ADS, INITIAL_ADS),
    addAd: (ad: Ad) => {
        const ads = DataService.getAds();
        setStorage(MOCK_STORAGE_KEYS.ADS, [...ads, ad]);
    },
    removeAd: (id: string) => {
        const ads = DataService.getAds().filter(a => a.id !== id);
        setStorage(MOCK_STORAGE_KEYS.ADS, ads);
    },

    // USERS
    getUsers: (): User[] => getStorage(MOCK_STORAGE_KEYS.USERS, []),

    // Register simple
    register: (name: string, mobile: string, pin: string): User | null => {
        const users = DataService.getUsers();
        if (users.find(u => u.mobile === mobile)) return null; // Exists

        // Check if admin (hardcoded for simplicity)
        // Check if admin (Hardcoded REMOVED)
        const role = 'USER';

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            mobile,
            pin,
            role,
            balance: 0,
        };
        setStorage(MOCK_STORAGE_KEYS.USERS, [...users, newUser]);
        return newUser;
    },

    login: (mobile: string, pin: string): User | null => {
        const users = DataService.getUsers();
        // Regular user login only (Admin uses separate flow)
        const user = users.find(u => u.mobile === mobile && u.pin === pin);
        return user || null;
    },

    updateBalance: (userId: string, points: number) => {
        const users = DataService.getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx].balance += points;
            setStorage(MOCK_STORAGE_KEYS.USERS, users);
            // Update session if it's the current user
            const currentUser = getStorage<User | null>(MOCK_STORAGE_KEYS.CURRENT_USER, null);
            if (currentUser && currentUser.id === userId) {
                currentUser.balance += points;
                setStorage(MOCK_STORAGE_KEYS.CURRENT_USER, currentUser);
            }
        }
    },

    // WITHIN
    getWithdrawals: (): Withdrawal[] => getStorage(MOCK_STORAGE_KEYS.WITHDRAWALS, []),

    requestWithdrawal: (userId: string, points: number, upiId: string) => {
        const withdrawals = DataService.getWithdrawals();
        const rupees = points / 100; // 100 points = 1 Rs (Example conversion: User said 10k points = 100rs -> 100 points = 1rs)

        // Deduct points first
        DataService.updateBalance(userId, -points);

        const newRequest: Withdrawal = {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            amount: rupees,
            points,
            upiId,
            status: 'PENDING',
            date: new Date().toISOString(),
        };
        setStorage(MOCK_STORAGE_KEYS.WITHDRAWALS, [newRequest, ...withdrawals]);
    },

    updateWithdrawalStatus: (id: string, status: 'APPROVED' | 'REJECTED') => {
        const withdrawals = DataService.getWithdrawals();
        const idx = withdrawals.findIndex(w => w.id === id);
        if (idx !== -1) {
            // If rejected, refund points? For now, keep simple.
            withdrawals[idx].status = status;
            setStorage(MOCK_STORAGE_KEYS.WITHDRAWALS, withdrawals);
        }
    }
};
