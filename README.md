# 🎤 Idol Guessr

**Idol Guessr** is a fun web game where K-pop fans test their knowledge by guessing idols from blurred photos.  
Each round starts with a heavily blurred image — as the blur fades, you race against time to identify the idol before the reveal!

## Installation

### 1. Clone the repository:
   ```bash
   git clone https://github.com/jarvin-s/idolguessr
   cd idolguessr
   ```
### 2. Install dependencies
  ```bash
  npm install
  ```

### 3. Environment variables
Create a .env.local file in the project root and add your Supabase credentials:
  ```bash
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
### 4. Start the development server
  ```bash
  npm run dev
  ```
Your app will be available at:
http://localhost:3000
