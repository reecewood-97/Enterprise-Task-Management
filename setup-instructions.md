# Enterprise Task Management System Setup Instructions

## Database Setup

### Option 1: Install MongoDB Locally

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Follow the installation instructions for Windows
3. Create a data directory: `mkdir -p C:\data\db`
4. Start MongoDB server: `mongod --dbpath C:\data\db`

### Option 2: Use MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Set up database access (create a user with password)
4. Set up network access (allow access from your IP address)
5. Get your connection string and update the `.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

## Running the Application

### Start the Backend

```bash
cd c:\Dev\Enterpise-SE-project\backend
npm run dev
```

### Start the Frontend

```bash
cd c:\Dev\Enterpise-SE-project\frontend
npm start
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

Username: admin@example.com
Password: Admin123!

## Testing the Application

1. Open your browser and navigate to http://localhost:3000
2. Log in with the default admin account
3. Explore the dashboard, projects, and tasks
4. Create new projects and tasks to test functionality
