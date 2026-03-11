# Earnify App - The Ultimate Technical Deep Dive 🎓

This document allows you to explain **Earnify** at a "Senior Developer" level. It covers Architecture, Code Decisions, and Interview Answers.

---

## 1. High-Level Architecture 🏗️

Earnify follows a **Client-Server Architecture** using the **Next.js App Router**.

### The Stack
*   **Frontend**: Next.js 14+ (React 18), TypeScript, CSS Modules.
*   **Backend/Database**: Supabase (PostgreSQL). We don't have a custom Node.js server; we talk directly to the DB from the client (using Supabase's secure client).
*   **State Management**: React Context API (`AuthContext`) + Local State (`useState`).
*   **Deployment**: Vercel Edge Network (Global CDN).

### Data Flow
1.  **User Action**: User clicks "Withdraw" button.
2.  **Service Layer**: `DbService.requestWithdrawal()` is called.
3.  **Supabase Call**: The app sends a HTTPS request to Supabase.
4.  **Database Logic**: Supabase checks the API Key and performs the `INSERT` into the `withdrawals` table.
5.  **UI Update**: The App waits for the response. If successful, it updates the `StatCard` using local state.

---

## 2. Key Technical Concepts Implemented 🧠

When an interviewer asks "What difficult techniques did you use?", answer with these:

### A. Authentication & Context Pattern
*   **Problem**: How do we verify the user on *every* page without passing data manually?
*   **Solution**: We used the **Context API** (`createContext`).
*   **How it works**:
    1.  We wrap the entire app in `<AuthProvider>`.
    2.  This provider checks `localStorage` or Supabase for a session on load.
    3.  It exposes `user`, `login`, and `logout` to the whole app.
    4.  Any component can just do `const { user } = useAuth()` to access data instantly.

### B. Real-Time Data (Polling vs Sockets)
*   **Our Approach**: We implemented **Polling** (`setInterval`).
*   **Why**: simpler than WebSockets for this scale.
*   **Code Evidence**:
    ```typescript
    useEffect(() => {
        const interval = setInterval(refreshUser, 3000); // Check DB every 3s
        return () => clearInterval(interval); // Cleanup to prevent memory leaks!
    }, []);
    ```
*   **Interview Win**: "I implemented a polling mechanism with cleanup functions to ensure the Dashboard is always in sync with the database, handling 1000s of balance updates efficiently."

### C. Responsive Design (Mobile-First)
*   **Technique**: CSS Gradients & Flexbox.
*   **Specifics**: We didn't use Bootstrap. We wrote custom CSS (`globals.css`) using `:root` variables for colors (`--primary: #10b981`). This keeps the app fast and lightweight (no heavy framework downloads).

### D. Optimistic UI Updates
*   **Concept**: When a user clicks "Spin", we show the animation immediately *before* the server confirms the win.
*   **Why**: Makes the app feel incredibly fast.
*   **Risk**: If the internet cuts out, we revert the state. (Basic implementation in our app).

---

## 3. Code Walkthrough (The "How does this specific thing work?" Section) 🕵️

### The "Rigged" Spin Wheel 🎡
*   **File**: `src/app/(dashboard)/refer/page.tsx`
*   **The Trick**:
    1.  **Visual**: The wheel has visual segments [100, 200, 400...].
    2.  **Logic**: When you click "Spin", we check: `milestone === 3 ? 100 : 400`. We *force* the target to be 100 or 400.
    3.  **Math**: We calculate how many degrees to rotate so the pointer lands *exactly* on that number.
    ```typescript
    const stopAngle = 360 - (targetIndex * 45); // Calculate exact stop angle
    const totalRotation = 360 * 5 + stopAngle; // Spin 5 times then stop there
    ```

### The Dynamic "Forgot PIN" Link 🔗
*   **File**: `src/app/(auth)/login/page.tsx`
*   **Concept**: Deep Linking.
*   **Explanation**: Instead of a "Form" that needs a backend to send emails, we rely on **URL Schemes**.
    *   `https://t.me/...` opens the Telegram App directly.
    *   `?text=Hello...` pre-fills the message box.
*   **Benefit**: Zero backend cost for support tickets.

---

## 4. Common Interview Questions & Answers 🎤

**Q: Why did you choose Next.js?**
**A:** "Next.js provides the best Developer Experience. It gives me Server-Side Rendering capabilities (better SEO), automatic routing, and fast builds. For an earning app where trust is key, a professional, fast-loading framework is essential."

**Q: How do you handle database security?**
**A:** "In this MVP, we use Supabase. While I handled most logic on the client-side for speed, in a production V2, I would implement **Row Level Security (RLS)** in PostgreSQL to ensure users can ONLY read their own `balance` and `transactions` fields."

**Q: What was the hardest bug you fixed?**
**A:** "The **Infinite Loop in the Spin Wheel**. Initially, checking the database for 'Spin Status' caused a re-render, which triggered the check again. I fixed this by using `useEffect` properly with a dependency array `[user]` so it only runs once when the user loads."

**Q: How does the Daily Popup work?**
**A:** "I used `localStorage`. When the dashboard loads, I check `Date.now()`. If the stored timestamp is older than 24 hours (86400000 ms), I show the popup and update the timestamp. This avoids database calls for simple UI logic."

---

## 5. Deployment Guide (DevOps) ☁️

1.  **Build**: `npm run build` compiles TypeScript to JavaScript.
2.  **Linting**: Checks for code errors (missing semicolons, unused variables).
3.  **Vercel**: We connected the GitHub repo to Vercel. Every time I pushed code (`git push`), Vercel automatically:
    *   Detects Next.js.
    *   Runs the build.
    *   Assigns a domain (`earnify.site`).
    *   Propagates changes globally in ~30 seconds.

---

## 6. What's Next? (Future Improvements) 🔮

If asked "What would you add next?", say:
1.  **UPI API Integration**: Currently, withdrawals are manual. I would add Razorpay/Cashfree Payouts API to automate transfers.
2.  **Server Actions**: Move `DbService` logic to Next.js Server Actions to hide database logic from the browser (Security).
3.  **Notifications**: Use Firebase Cloud Messaging (FCM) to send push notifications when new ads arrive.
