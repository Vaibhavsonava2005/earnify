
import { supabase } from '@/lib/supabase';
import { User, Ad, Withdrawal } from './mockData'; // Reuse types for now

export const DbService = {
    // USERS
    // SECURE RPC METHODS
    // Replaces direct 'getUser' to prevent Public Data Leaks
    login: async (mobile: string, pin: string): Promise<User | null> => {
        const { data, error } = await supabase.rpc('secure_login', { p_mobile: mobile, p_pin: pin });
        if (error || !data || data.length === 0) return null;
        return data[0] as User;
    },

    getUserProfile: async (userId: string): Promise<User | null> => {
        const { data, error } = await supabase.rpc('get_user_by_id', { p_user_id: userId });
        if (error || !data || data.length === 0) return null;
        return data[0] as User;
    },

    // Helper to check if user exists (for smart login redirect)
    checkUserExists: async (mobile: string): Promise<boolean> => {
        const { data, error } = await supabase.rpc('check_referrer', { p_mobile: mobile });
        if (error || !data || data.length === 0) return false;
        return true;
    },

    // Legacy support (Deprecated) - Warns if used
    getUser: async (mobile: string): Promise<User | null> => {
        console.warn('Deprecated: getUser called. Use login() or getUserProfile() instead.');
        return null;
    },

    // createUser moved to bottom with referral logic

    updateBalance: async (userId: string, amount: number, type: string = 'GENERIC', description: string = 'Balance Update', isCommission = false) => {
        const { data: user } = await supabase.from('users').select('balance, referred_by').eq('id', userId).single();
        if (!user) return;

        const newBalance = (user.balance || 0) + amount;
        const { error } = await supabase.from('users').update({ balance: newBalance }).eq('id', userId);

        // LOG TRANSACTION
        if (!error && amount !== 0) {
            await supabase.from('transactions').insert([{
                user_id: userId,
                amount,
                type,
                description
            }]);
        }

        // RECURSIVE COMMISSION LOGIC (Universal)
        // Only if earning positive amount, not a commission itself, and user has referrer
        if (!error && amount > 0 && !isCommission && user.referred_by) {
            const commission = Math.floor(amount * 0.10); // 10%
            if (commission > 0) {
                console.log(`Processing Commission: ${commission} pts to ${user.referred_by}`);
                // Recursive call with isCommission = true to prevent loops
                await DbService.updateBalance(
                    user.referred_by,
                    commission,
                    'REFERRAL_COMMISSION',
                    `Commission from ${user.referred_by} activity`,
                    true
                );
            }
        }
    },

    // ADS
    // ADS
    // ADS
    getAds: async (userId?: string): Promise<(Ad & { locked?: boolean, tasksNeeded?: number })[]> => {
        // PERFORMANCE FIX: Parallel Fetching
        // Fetch Ads, Task Count, and Views simultaneously instead of sequentially

        const adsPromise = supabase
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });

        const tasksPromise = userId
            ? supabase.from('user_apps').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'APPROVED')
            : Promise.resolve({ count: 0 });

        const viewsPromise = userId
            ? supabase.from('ad_views').select('ad_id').eq('user_id', userId)
            : Promise.resolve({ data: [] });

        const [{ data: ads, error }, { count: approvedTasksCount }, { data: views }] = await Promise.all([
            adsPromise,
            tasksPromise,
            viewsPromise
        ]);

        if (error || !ads) {
            console.error('Error fetching ads:', error);
            return [];
        }

        // 2. Parse "No-SQL" Metadata from video_url
        // Format: "REAL_URL|CONF|{"minTasks":2,"isActive":true}"
        let parsedAds = ads.map((d: any) => {
            let realUrl = d.video_url;
            let config = { minTasks: 0, isActive: true };

            if (realUrl && realUrl.includes('|CONF|')) {
                const parts = realUrl.split('|CONF|');
                realUrl = parts[0];
                try {
                    const parsedConfig = JSON.parse(parts[1]);
                    config = { ...config, ...parsedConfig };
                } catch (e) {
                    console.error('Failed to parse ad config', e);
                }
            }

            return {
                id: d.id,
                title: d.title,
                videoUrl: realUrl,
                reward: d.reward,
                duration: d.duration,
                minTasks: config.minTasks,
                isActive: config.isActive
            };
        });

        // 3. Filter Active Ads (User View Only)
        let finalAds = parsedAds;
        if (userId) {
            // Default to true if undefined, but explicit check for false is better
            finalAds = parsedAds.filter(a => a.isActive !== false);
        }

        const approvedTasks = approvedTasksCount || 0;

        // 4. Calculate Locked Status & Filter Watched
        const watchedAdIds = new Set(views?.map((v: any) => v.ad_id) || []);

        finalAds = finalAds
            .filter(ad => !watchedAdIds.has(ad.id)) // Filter watched
            .map(ad => {
                const isLocked = (userId ? ((ad.minTasks || 0) > approvedTasks) : false);
                return {
                    ...ad,
                    locked: isLocked,
                    tasksNeeded: isLocked ? (ad.minTasks! - approvedTasks) : 0
                };
            })
            .sort((a, b) => {
                // Priority 1: Premium (minTasks > 0) comes first
                const isAPremium = (a.minTasks || 0) > 0;
                const isBPremium = (b.minTasks || 0) > 0;

                if (isAPremium && !isBPremium) return -1;
                if (!isAPremium && isBPremium) return 1;

                // Priority 2: Higher Reward comes first
                return b.reward - a.reward;
            });

        return finalAds;
    },

    claimAdReward: async (userId: string, adId: string, clientReward: number): Promise<{ success: boolean, message?: string }> => {
        // 1. Fetch Ad Details for Validation
        const { data: ad, error: adError } = await supabase.from('ads').select('*').eq('id', adId).single();
        if (adError || !ad) return { success: false, message: 'Ad not found' };

        // 2. Check if already watched
        const { data: existing } = await supabase.from('ad_views').select('id').eq('user_id', userId).eq('ad_id', adId).single();
        if (existing) return { success: false, message: 'Ad already watched' };

        // 3. Parse Config & Validate Requirements
        let config = { minTasks: 0, isActive: true };
        try {
            if (ad.video_url && ad.video_url.includes('|CONF|')) {
                config = JSON.parse(ad.video_url.split('|CONF|')[1]);
            }
        } catch (e) { }

        if (config.minTasks > 0) {
            const { count } = await supabase
                .from('user_apps')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('status', 'APPROVED');

            const approvedTasks = count || 0;
            if (approvedTasks < config.minTasks) {
                return { success: false, message: `Requirement not met: Need ${config.minTasks} completed tasks.` };
            }
        }

        // 4. Record View
        const { error: viewError } = await supabase.from('ad_views').insert([{ user_id: userId, ad_id: adId }]);
        if (viewError) return { success: false, message: 'Failed to record view' };

        // 5. Add Balance
        // Use server-side reward if possible, falling back to client but DB is source of truth above
        const finalReward = ad.reward || clientReward;
        await DbService.updateBalance(userId, finalReward, 'AD_REWARD', `Watched Ad: ${ad.title}`);

        return { success: true };
    },

    addAd: async (ad: Omit<Ad, 'id'>) => {
        // Pack config
        const config = { minTasks: ad.minTasks || 0, isActive: ad.isActive ?? true };
        const packedUrl = `${ad.videoUrl}|CONF|${JSON.stringify(config)}`;

        await supabase.from('ads').insert([{
            title: ad.title,
            video_url: packedUrl,
            reward: ad.reward,
            duration: ad.duration
        }]);
    },

    updateAd: async (id: string, ad: Omit<Ad, 'id'>) => {
        // Pack config
        const config = { minTasks: ad.minTasks || 0, isActive: ad.isActive ?? true };
        const packedUrl = `${ad.videoUrl}|CONF|${JSON.stringify(config)}`;

        await supabase.from('ads').update({
            title: ad.title,
            video_url: packedUrl,
            reward: ad.reward,
            duration: ad.duration
        }).eq('id', id);
    },

    removeAd: async (id: string) => {
        await supabase.from('ads').delete().eq('id', id);
    },

    // WITHDRAWALS
    // WITHDRAWALS
    // WITHDRAWALS
    getWithdrawals: async (userId?: string): Promise<Withdrawal[]> => {
        // ADMIN MODE: Use Secure RPC
        if (!userId) {
            const { data, error } = await supabase.rpc('admin_get_withdrawals', { p_secret: 'EARNIFY_ADMIN_SECURED_2026' });
            if (error) {
                console.error('Error fetching withdrawals (RPC):', error);
                return [];
            }
            return data.map((d: any) => ({
                id: d.id,
                userId: d.user_id,
                userName: d.user_name || 'Unknown',
                userMobile: d.user_mobile || '',
                amount: d.amount,
                points: d.points,
                upiId: d.upi_id,
                method: d.method,
                accountNo: d.account_no,
                ifsc: d.ifsc,
                accountHolderName: d.account_holder,
                status: d.status,
                date: d.created_at
            }));
        }

        // USER MODE: Standard Select (RLS "View Own" still needed? 
        // Logic: if public select is disabled, user can't see own!
        // So we need an RPC for "get_my_withdrawals" too? 
        // Or we rely on client-side filter? Users can't see OTHERS.
        // For now, let's assume RLS "View Own" is replaced by RPC "get_user_by_id". 
        // But withdrawals table is still RLS capable.
        // If we disabled users select, withdrawals select might still work if it doesn't JOIN users?
        // But the query below joins users!
        // Users viewing their own withdrawals don't need to join "users" (they know who they are).

        // Optimized User Query (No Join needed)
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            userName: 'You',
            userMobile: 'You',
            amount: d.amount,
            points: d.points,
            upiId: d.upi_id,
            method: d.method,
            accountNo: d.account_no,
            ifsc: d.ifsc,
            accountHolderName: d.name,
            status: d.status,
            date: d.created_at
        }));
    },

    requestWithdrawal: async (userId: string, points: number, details: { method: 'UPI' | 'BANK', name: string, upiId?: string, accountNo?: string, ifsc?: string }) => {
        // 1. Calculate Payout & TDS (Server Authoritative)
        // Rate: 100 Points = 1 Rupee
        // TDS: 20%
        const grossAmount = points / 100;
        const tdsAmount = grossAmount * 0.20;
        const netPayout = grossAmount - tdsAmount;

        // 2. Deduct Balance FIRST
        const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (!user || (user.balance || 0) < points) {
            throw new Error('Insufficient balance');
        }

        const newBalance = user.balance - points;
        const { error: balanceError } = await supabase.from('users').update({ balance: newBalance }).eq('id', userId);

        if (balanceError) throw new Error('Failed to update balance');

        // 3. Create Withdrawal Record
        const { error: withdrawalError } = await supabase.from('withdrawals').insert([{
            user_id: userId,
            points,
            amount: netPayout, // Store NET amount for Admin to Pay
            method: details.method,
            name: details.name,            // INSERT NAME
            upi_id: details.upiId || null,
            account_no: details.accountNo || null,
            ifsc: details.ifsc || null,
            status: 'PENDING'
        }]);

        if (withdrawalError) {
            console.error('Withdrawal Insert Error:', withdrawalError);
            // Rollback balance
            await supabase.from('users').update({ balance: user.balance }).eq('id', userId);
            throw new Error('Failed to create withdrawal request: ' + withdrawalError.message);
        }
    },

    updateWithdrawalStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        // If REJECTED, refund the points!
        if (status === 'REJECTED') {
            const { data: withdrawal } = await supabase.from('withdrawals').select('user_id, points').eq('id', id).single();
            if (withdrawal) {
                await DbService.updateBalance(
                    withdrawal.user_id,
                    withdrawal.points,
                    'REFUND',
                    'Withdrawal Rejected Refund',
                    true // No commission on refund
                );
            }
        }
        await supabase.from('withdrawals').update({ status }).eq('id', id);
    },

    // ADMIN STATS
    getAllUsers: async (): Promise<any[]> => {
        // USE SECURE RPC
        const { data: users, error } = await supabase.rpc('admin_get_users', { p_secret: 'EARNIFY_ADMIN_SECURED_2026' });

        if (error) {
            console.error('Error fetching users (RPC):', error);
            return [];
        }

        // Calculate referral counts in memory
        const referralCounts = new Map<string, number>();
        const taskCounts = new Map<string, number>();

        try {
            // Referrals (Scan loaded users)
            if (users) {
                users.forEach((u: any) => {
                    if (u.referred_by) {
                        const current = referralCounts.get(u.referred_by) || 0;
                        referralCounts.set(u.referred_by, current + 1);
                    }
                });
            }

            // Tasks (Still standard select? 'user_apps' doesn't have restrictive policy yet)
            const { data: tasks } = await supabase.from('user_apps').select('user_id').eq('status', 'APPROVED');
            if (tasks) {
                tasks.forEach((t: any) => {
                    const current = taskCounts.get(t.user_id) || 0;
                    taskCounts.set(t.user_id, current + 1);
                });
            }

        } catch (e) {
            console.error('Error calculating counts', e);
        }

        return (users || []).map((u: any) => ({
            ...u,
            referralCount: referralCounts.get(u.id) || 0,
            taskCount: taskCounts.get(u.id) || 0
        }));
    },

    createUser: async (user: Omit<User, 'id'> & { referralCode?: string }): Promise<User | string | null> => {
        // 1. Referral Code is simply the Mobile Number
        const myReferralCode = user.mobile;

        let referredBy = null;
        let initialBalance = 500; // Default Welcome Bonus for EVERYONE
        let bonusDescription = 'Welcome Bonus';

        // 2. Check Referral Code (Lookup by Mobile now)
        if (user.referralCode && user.referralCode.length >= 10) {
            console.log('Checking referral mobile:', user.referralCode);
            // CHECK REFERRER via RPC
            const { data: referrer, error: refError } = await supabase.rpc('check_referrer', { p_mobile: user.referralCode });

            if (refError) console.error('Referrer lookup error:', refError);

            if (referrer && referrer.length > 0) {
                console.log('Referrer found:', referrer[0].id);
                referredBy = referrer[0].id; // RPC returns array of {id}
                // initialBalance is already 500. We don't add more.
                bonusDescription = 'Welcome Bonus for using Referral Code';
            } else {
                console.log('Invalid Referral Code (No user found with this mobile)');
            }
        }

        const { data, error } = await supabase
            .from('users')
            .insert([{
                name: user.name,
                mobile: user.mobile,
                pin: user.pin,
                role: user.role,
                balance: initialBalance,
                referral_code: myReferralCode, // Store mobile as ref code too
                referred_by: referredBy
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return error.message; // Return exact error
        }

        // Log Signup Bonus Transaction if applicable
        if (initialBalance > 0) {
            await supabase.from('transactions').insert([{
                user_id: data.id,
                amount: initialBalance,
                type: 'SIGNUP_BONUS',
                description: bonusDescription
            }]);
        }

        return data as User;
    },

    // ... (rest of methods) ...

    // APPS
    getApps: async (userId?: string): Promise<any[]> => {
        const { data: apps, error } = await supabase
            .from('apps')
            .select('*')
            .neq('category', 'LUCKY_DRAW')
            .neq('category', 'QUIZ')
            .order('created_at', { ascending: false });
        if (error || !apps) return [];

        let availableApps = apps;

        // If user is provided, add 'status' to the app object if they have interacted with it
        if (userId) {
            const { data: userApps } = await supabase.from('user_apps').select('app_id, status, rejection_reason').eq('user_id', userId);
            const statusMap = new Map(userApps?.map((ua: any) => [ua.app_id, ua])); // Store full object

            return apps.map((app: any) => {
                const ua = statusMap.get(app.id);
                return {
                    ...app,
                    status: ua?.status || null,
                    rejectionReason: ua?.rejection_reason || null
                };
            });
        }

        return apps;
    },

    addApp: async (app: { title: string, description: string, link: string, reward: number, category: string }) => {
        const { error } = await supabase.from('apps').insert([app]);
        if (error) {
            console.error('Error adding app:', error);
            alert('Error adding app: ' + error.message);
        }
    },

    updateApp: async (id: string, app: { title: string, description: string, link: string, reward: number, category: string }) => {
        const { error } = await supabase.from('apps').update(app).eq('id', id);
        if (error) {
            console.error('Error updating app:', error);
            alert('Error updating app: ' + error.message);
        }
    },

    deleteApp: async (id: string) => {
        await supabase.from('apps').delete().eq('id', id);
    },

    // USER APPS (Tasks)
    submitAppTask: async (userId: string, appId: string) => {
        // Check if exists first
        const { data: existing } = await supabase.from('user_apps').select('id, status').eq('user_id', userId).eq('app_id', appId).single();

        if (existing) {
            if (existing.status === 'REJECTED') {
                // Resubmit: Reset to PENDING and clear reason
                await supabase.from('user_apps').update({ status: 'PENDING', rejection_reason: null }).eq('id', existing.id);
            }
            // If already PENDING or APPROVED, do nothing (or maybe check logic elsewhere)
        } else {
            // New Submission
            const { error } = await supabase.from('user_apps').insert([{
                user_id: userId,
                app_id: appId,
                status: 'PENDING'
            }]);
            if (error) console.error('Error submitting task:', error);
        }
    },

    getPendingAppTasks: async (): Promise<any[]> => {
        // Fetch pending tasks with user and app details
        const { data, error } = await supabase
            .from('user_apps')
            .select(`
                *,
                users (name, mobile),
                apps (title, reward)
            `)
            .eq('status', 'PENDING');

        if (error) {
            console.error('Error fetching pending tasks:', error);
            return [];
        }
        return data || [];
    },

    processAppTask: async (taskId: string, userId: string, reward: number, status: 'APPROVED' | 'REJECTED', reason: string = '') => {
        // 1. Update task status and reason
        await supabase.from('user_apps').update({ status, rejection_reason: reason }).eq('id', taskId);

        // 2. If approved, add balance (Commission is handled by updateBalance internally now)
        if (status === 'APPROVED') {
            await DbService.updateBalance(userId, reward, 'APP_REWARD', 'App Task Completed');
        }
    },

    getTransactions: async (userId: string): Promise<any[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data;
    },

    // SPIN WHEEL (Transaction Based - No new tables)
    getSpinStatus: async (userId: string) => {
        // 1. Get ALL Users to check for referrals (Safe for < 10k users)
        // We filter for users who were referred by ME AND have earned at least something (Active)
        const { data: referrals, error } = await supabase
            .from('users')
            .select('balance')
            .eq('referred_by', userId);

        let activeReferralCount = 0;
        if (referrals) {
            // "Active" means they have earned at least 10 points (watched 1 ad approx)
            activeReferralCount = referrals.filter(u => u.balance >= 10).length;
        }

        // 2. Check Claims in Transactions
        const { data: claims } = await supabase
            .from('transactions')
            .select('type')
            .eq('user_id', userId)
            .in('type', ['SPIN_BONUS_3', 'SPIN_BONUS_10']);

        const claimed3 = claims?.some(c => c.type === 'SPIN_BONUS_3') || false;
        const claimed10 = claims?.some(c => c.type === 'SPIN_BONUS_10') || false;

        return {
            referralCount: activeReferralCount,
            canSpin3: activeReferralCount >= 3 && !claimed3,
            canSpin10: activeReferralCount >= 10 && !claimed10,
            claimed3,
            claimed10
        };
    },

    claimSpinReward: async (userId: string, milestone: 3 | 10) => {
        // Double check status server-side (optional but good)
        // For now, trust the caller validated, but the unique insert check is hard with just logic.
        // We will just do the insert. If frontend checks pass, it's fine.

        const reward = milestone === 3 ? 100 : 400;
        await DbService.updateBalance(
            userId,
            reward,
            `SPIN_BONUS_${milestone}`,
            `Referral Milestone ${milestone} Spin Reward`
        );
    },

    // ADMIN USER MANAGEMENT
    adminBanUser: async (userId: string) => {
        await supabase.from('users').update({ role: 'BANNED' }).eq('id', userId);
    },

    adminUnbanUser: async (userId: string) => {
        await supabase.from('users').update({ role: 'USER' }).eq('id', userId);
    },

    adminWarnUser: async (userId: string, message: string) => {
        await supabase.from('transactions').insert([{
            user_id: userId,
            amount: 0,
            type: 'ADMIN_WARNING',
            description: `SYSTEM DETECTED: ${message}`
        }]);
    },

    adminTaskReminder: async (userId: string, message: string) => {
        await supabase.from('transactions').insert([{
            user_id: userId,
            amount: 0,
            type: 'TASK_REMINDER',
            description: `TASK ACTION: ${message}`
        }]);
    },

    broadcastReminder: async (message: string) => {
        // 1. Fetch all users (ID only)
        const { data: users } = await supabase.from('users').select('id');
        if (!users || users.length === 0) return;

        // 2. Prepare Batch Insert Data
        const notifications = users.map(u => ({
            user_id: u.id,
            amount: 0,
            type: 'TASK_REMINDER',
            description: `TASK ACTION: ${message}`
        }));

        // 3. Batch Insert
        const { error } = await supabase.from('transactions').insert(notifications);
        if (error) {
            console.error('Broadcast Error:', error);
            throw new Error(error.message);
        }
    },

    claimScratchCard: async (userId: string) => {
        // 1. Check if already claimed
        const { data: existing } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'SCRATCH_CARD');

        if (existing && existing.length > 0) {
            return { success: false, message: 'Already claimed' };
        }

        // 2. Generate Random Reward Server-Side (Safe)
        // Range: 10 to 50 Points
        const serverPoints = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

        // 3. Update Balance
        await DbService.updateBalance(userId, serverPoints, 'SCRATCH_CARD', 'Welcome Scratch Card Reward');
        return { success: true, points: serverPoints };
    },

    adminDeleteUser: async (userId: string) => {
        // Cascade delete should handle related data if set up, but let's be careful.
        // Supabase usually needs explicit cascades or manual cleanups.
        // For now, just delete the user record.
        await supabase.from('users').delete().eq('id', userId);
    },

    adminRevokeBalance: async (userId: string) => {
        await supabase.from('users').update({ balance: 0 }).eq('id', userId);
    },

    // OFFERS (Dynamic System)
    getOffers: async (userId?: string): Promise<any[]> => {
        const { data: offers, error } = await supabase
            .from('apps')
            .select('*')
            .eq('category', 'OFFER')
            .order('created_at', { ascending: false });

        if (error || !offers) return [];

        // Parse Config and Check Status
        const parsedOffers = offers.map((o: any) => {
            let config = {};
            try {
                config = JSON.parse(o.description);
            } catch (e) {
                console.error('Error parsing offer config', e);
            }
            return {
                ...o,
                config // { type, minBalance, isActive, target }
            };
        });

        if (userId) {
            // Check which ones are claimed
            // claimOffer records transaction with type='OFFER_CLAIM' and description='Claimed Offer #{ID}'
            // We need to fetch all OFFER_CLAIM transactions for this user
            const { data: claims } = await supabase
                .from('transactions')
                .select('description')
                .eq('user_id', userId)
                .eq('type', 'OFFER_CLAIM');

            const claimedIds = new Set<string>();
            if (claims) {
                claims.forEach((c: any) => {
                    // Extract ID from "Claimed Offer #ID" or "Claimed Offer #{ID} - Title"
                    // Simplified: just check if description contains the ID. 
                    // To be robust: claimed description format: "CLAIMED_OFFER:{ID}"
                    const parts = c.description.split(':');
                    if (parts.length > 1) {
                        claimedIds.add(parts[1]);
                    }
                });
            }

            return parsedOffers.map((o: any) => ({
                ...o,
                isClaimed: claimedIds.has(o.id)
            }));
        }

        return parsedOffers;
    },

    createOffer: async (offer: { title: string, reward: number, config: any }) => {
        const { error } = await supabase.from('apps').insert([{
            title: offer.title,
            reward: offer.reward,
            category: 'OFFER',
            link: 'OFFER', // Placeholder
            description: JSON.stringify(offer.config)
        }]);
        if (error) console.error('Error creating offer:', error);
    },

    updateOffer: async (id: string, offer: { title: string, reward: number, config: any }) => {
        const { error } = await supabase.from('apps').update({
            title: offer.title,
            reward: offer.reward,
            description: JSON.stringify(offer.config)
        }).eq('id', id);
        if (error) console.error('Error updating offer:', error);
    },

    toggleOfferStatus: async (id: string, currentConfig: any, isActive: boolean) => {
        const newConfig = { ...currentConfig, isActive };
        await supabase.from('apps').update({
            description: JSON.stringify(newConfig)
        }).eq('id', id);
    },

    deleteOffer: async (id: string) => {
        await supabase.from('apps').delete().eq('id', id);
    },

    claimOffer: async (userId: string, offerId: string) => {
        // 1. Fetch Offer Reward from Server (Source of Truth)
        const { data: offer } = await supabase.from('apps').select('reward, title').eq('id', offerId).single();
        if (!offer) return { success: false, message: 'Invalid Offer' };

        const serverReward = offer.reward || 0;

        // 2. Double check redundancy
        const claimDesc = `CLAIMED_OFFER:${offerId}`;

        const { data: existing } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'OFFER_CLAIM')
            .ilike('description', `%${offerId}%`)
            .single();

        if (existing) return { success: false, message: 'Already claimed' };

        // 3. Update Balance (Server Authoritative)
        await DbService.updateBalance(userId, serverReward, 'OFFER_CLAIM', claimDesc);

        return { success: true };
    },

    // UTILS
    deleteTransaction: async (id: string) => {
        await supabase.from('transactions').delete().eq('id', id);
    },

    // DAILY LOGIN
    claimDailyLogin: async (userId: string): Promise<boolean> => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if already claimed today
        const { data: existing } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'DAILY_LOGIN')
            .ilike('created_at', `${today}%`) // Check if created_at starts with today
            .single();

        if (existing) return false; // Already claimed

        // Award 50 Points
        await DbService.updateBalance(userId, 50, 'DAILY_LOGIN', 'Daily Login Bonus');
        return true;
    },

    // LUCKY DRAW (New Feature)
    getLuckyDraws: async (userId?: string): Promise<any[]> => {
        const { data: draws, error } = await supabase
            .from('apps')
            .select('*')
            .eq('category', 'LUCKY_DRAW')
            .order('created_at', { ascending: false });

        if (error || !draws) return [];

        let parsedDraws = draws.map((d: any) => {
            let config = { entryFee: 0, endTime: '', prize: 0, announced: false };
            try {
                config = JSON.parse(d.description);
            } catch (e) { }
            return { ...d, ...config };
        });

        if (userId) {
            // Check participation
            const { data: participation } = await supabase
                .from('user_apps')
                .select('app_id')
                .eq('user_id', userId)
                .in('app_id', draws.map((d: any) => d.id));

            const participatedIds = new Set(participation?.map((p: any) => p.app_id));

            parsedDraws = parsedDraws.map(d => ({
                ...d,
                hasEntered: participatedIds.has(d.id)
            }));
        }

        return parsedDraws;
    },

    createLuckyDraw: async (data: { title: string, entryFee: number, endTime: string, prize: number }) => {
        const config = {
            entryFee: data.entryFee,
            endTime: data.endTime,
            prize: data.prize,
            announced: false
        };

        await supabase.from('apps').insert([{
            title: data.title,
            reward: data.prize, // Visual only
            category: 'LUCKY_DRAW',
            link: 'LUCKY_DRAW',
            description: JSON.stringify(config)
        }]);
    },

    deleteLuckyDraw: async (id: string) => {
        await supabase.from('apps').delete().eq('id', id);
    },

    enterLuckyDraw: async (userId: string, drawId: string, clientEntryFee: number) => {
        // 1. Fetch Draw Config (SOURCE OF TRUTH)
        const { data: draw } = await supabase.from('apps').select('description, category').eq('id', drawId).single();
        if (!draw || draw.category !== 'LUCKY_DRAW') {
            return { success: false, message: 'Invalid Draw' };
        }

        let config = { entryFee: 0 };
        try {
            config = JSON.parse(draw.description);
        } catch (e) {
            return { success: false, message: 'Draw Config Error' };
        }

        const realEntryFee = Number(config.entryFee);

        // 2. ENTRY CHECK (First!)
        const { data: existing } = await supabase.from('user_apps').select('id').eq('user_id', userId).eq('app_id', drawId).single();
        if (existing) {
            return { success: false, message: 'Already Entered' };
        }

        // 3. BALANCE CHECK (Fresh Fetch)
        const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
        const currentBalance = Number(user?.balance || 0);

        if (!user || currentBalance < realEntryFee) {
            return { success: false, message: `Insufficient Balance (Need ${realEntryFee} pts)` };
        }

        // 4. ATOMIC UPDATE (Deduct Balance + Insert Entry)
        // We do this manually to ensure both happen or fail together if possible, 
        // OR we use our reliable updateBalance method but we MUST Insert Entry FIRST to prevent double claiming?
        // NO. If we insert entry first, and balance fails, free entry.
        // If we deduct balance first, and entry fails, lost money.

        // BEST APPROACH: Deduct Balance FIRST (Money is harder to earn).
        // If entry fails, REFUND.

        const newBalance = currentBalance - realEntryFee;
        const { error: balError } = await supabase.from('users').update({ balance: newBalance }).eq('id', userId);

        if (balError) {
            console.error("Balance Update Error", balError);
            return { success: false, message: 'Transaction Failed' };
        }

        // 5. Record Entry
        const { error: entryError } = await supabase.from('user_apps').insert([{
            user_id: userId,
            app_id: drawId,
            status: 'PARTICIPATED'
        }]);

        if (entryError) {
            console.error('Entry Insert Failed:', entryError);
            // CRITICAL: REFUND
            await supabase.from('users').update({ balance: currentBalance }).eq('id', userId);

            // Check if it failed because it already exists (Race Condition)
            if (entryError.code === '23505') { // Unique violation
                return { success: false, message: 'Already Entered (Refunded)' };
            }
            return { success: false, message: 'Entry Failed (Refunded)' };
        }

        // 6. Log Transaction (Only if success)
        await supabase.from('transactions').insert([{
            user_id: userId,
            amount: -realEntryFee,
            type: 'LUCKY_DRAW_ENTRY',
            description: `Entry for Draw: #${drawId.split('-')[0]}`
        }]);

        return { success: true };
    },

    getDrawParticipants: async (drawId: string) => {
        const { data, error } = await supabase
            .from('user_apps')
            .select('user_id, users(name, mobile)')
            .eq('app_id', drawId);

        if (error) return [];
        return data.map((d: any) => ({
            userId: d.user_id,
            name: d.users?.name,
            mobile: d.users?.mobile
        }));
    },

    pickDrawWinner: async (drawId: string, userId: string, amount: number) => {
        // 1. Credit Winner
        await DbService.updateBalance(userId, amount, 'LUCKY_DRAW_WIN', 'Won Lucky Draw!');

        // 2. Mark Draw as Announced (Optional: update description config)
        const { data: draw } = await supabase.from('apps').select('description').eq('id', drawId).single();
        if (draw) {
            let config = JSON.parse(draw.description);
            config.announced = true;
            config.winnerId = userId;
            await supabase.from('apps').update({ description: JSON.stringify(config) }).eq('id', drawId);
        }
    },

    // --- QUIZ / PREDICTION FEATURE ---

    createQuiz: async (title: string, question: string, options: string[], entryFee: number, endTime: string) => {
        const config = {
            question,
            options,
            entryFee,
            endTime,
            result: null, // "Option A"
            totalPool: 0 // Track pool separately or use 'reward' column
        };

        // We use 'reward' column to store current Pool Size for easy fetching
        const { error } = await supabase.from('apps').insert([{
            title: title || 'Prediction',
            description: JSON.stringify(config),
            category: 'QUIZ',
            reward: 0, // Initial Pool
            link: 'quiz' // Placeholder
        }]);

        if (error) throw error;
    },

    enterQuiz: async (userId: string, quizId: string, selectedOption: string) => {
        // 1. Fetch Quiz & Config
        const { data: quiz } = await supabase.from('apps').select('*').eq('id', quizId).single();
        if (!quiz) return { success: false, message: 'Quiz not found' };

        let config: any = {};
        try { config = JSON.parse(quiz.description); } catch (e) { return { success: false, message: 'Config Error' }; }

        // Check Time
        if (new Date() > new Date(config.endTime)) return { success: false, message: 'Betting Closed' };

        // 2. Check Balance
        const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (!user || user.balance < config.entryFee) return { success: false, message: 'Insufficient Balance' };

        // 3. Check Double Entry & Validate Option
        if (!config.options.includes(selectedOption)) return { success: false, message: 'Invalid Option' };

        const { data: existing } = await supabase.from('user_apps').select('id').eq('user_id', userId).eq('app_id', quizId).single();
        if (existing) return { success: false, message: 'Already Participated' };

        // 4. Deduct Balance
        const newBal = user.balance - config.entryFee;
        const { error: balErr } = await supabase.from('users').update({ balance: newBal }).eq('id', userId);
        if (balErr) return { success: false, message: 'Transaction Failed' };

        // 5. Insert Entry (Use rejection_reason to store OPTION)
        const { error: entryErr } = await supabase.from('user_apps').insert([{
            user_id: userId,
            app_id: quizId,
            status: 'PARTICIPATED',
            rejection_reason: selectedOption // <--- KEY: Storing Selection Here
        }]);

        if (entryErr) {
            // Rollback
            await supabase.from('users').update({ balance: user.balance }).eq('id', userId);
            return { success: false, message: 'Entry Error' };
        }

        // 6. Update Pool (Atomic increment logic is better, but simple update for now)
        // We fetch fresh to be safe or just increment
        const newPool = (quiz.reward || 0) + config.entryFee;
        await supabase.from('apps').update({ reward: newPool }).eq('id', quizId);

        // 7. Log Transaction
        await supabase.from('transactions').insert([{
            user_id: userId,
            amount: -config.entryFee,
            type: 'QUIZ_ENTRY',
            description: `Bet on: ${selectedOption} (${quiz.title})`
        }]);

        return { success: true };
    },

    resolveQuiz: async (quizId: string, winningOption: string) => {
        // 1. Fetch Quiz
        const { data: quiz } = await supabase.from('apps').select('*').eq('id', quizId).single();
        if (!quiz) return { success: false, message: 'Quiz not found' };

        let config: any = {};
        try { config = JSON.parse(quiz.description); } catch (e) { }

        if (config.result) return { success: false, message: 'Already Resolved' };

        const totalPool = quiz.reward || 0;

        // 2. Fetch Winners
        // We look for 'PARTICIPATED' status and rejection_reason == winningOption
        const { data: participants } = await supabase.from('user_apps')
            .select('user_id, id, rejection_reason')
            .eq('app_id', quizId)
            .eq('status', 'PARTICIPATED');

        if (!participants) return { success: false, message: 'No participants' };

        const winners = participants.filter(p => p.rejection_reason === winningOption);
        const losers = participants.filter(p => p.rejection_reason !== winningOption);

        // 3. Calculate Prize
        let winAmount = 0;
        if (winners.length > 0) {
            winAmount = Math.floor(totalPool / winners.length);
        }

        // 4. Update Winners
        for (const w of winners) {
            // Add Balance
            await DbService.updateBalance(w.user_id, winAmount, 'QUIZ_WIN', `Won Quiz: ${quiz.title}`);
            // Mark task as APPROVED/COMPLETED
            await supabase.from('user_apps').update({ status: 'APPROVED' }).eq('id', w.id);
        }

        // 5. Update Losers
        for (const l of losers) {
            await supabase.from('user_apps').update({ status: 'REJECTED' }).eq('id', l.id);
        }

        // 6. Close Quiz in Config
        config.result = winningOption;
        await supabase.from('apps').update({ description: JSON.stringify(config) }).eq('id', quizId);

        return { success: true, winners: winners.length, prize: winAmount };
    },

    getQuizParticipants: async (quizId: string) => {
        const { data, error } = await supabase
            .from('user_apps')
            .select('user_id, rejection_reason, created_at, users(name, mobile)')
            .eq('app_id', quizId);

        if (error) return [];
        return data.map((d: any) => ({
            userId: d.user_id,
            name: d.users?.name || 'Unknown',
            mobile: d.users?.mobile || 'N/A',
            option: d.rejection_reason,
            date: d.created_at
        }));
    },

    manualQuizPayout: async (userId: string, amount: number, quizId: string) => {
        // 1. Credit User & Log Transaction (handled by updateBalance)
        await DbService.updateBalance(
            userId,
            amount,
            'WIN',
            `Quiz Win (Manual): ${quizId.slice(0, 8)}`
        );

        // 3. Mark as Winner (Optional, but good for tracking)
        await supabase.from('user_apps')
            .update({ status: 'COMPLETED' })
            .eq('user_id', userId)
            .eq('app_id', quizId);

        return { success: true };
    }
};
