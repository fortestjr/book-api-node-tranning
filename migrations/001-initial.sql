
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'migrations' AND xtype = 'u')
BEGIN
    CREATE TABLE [migrations] (
        [id] INT PRIMARY KEY IDENTITY(1,1),
        [migrationname] VARCHAR(255) NOT NULL,
        [applaiedat] DATETIME DEFAULT GETDATE()
    );
END

-- Check if the migration script has already been applied
IF NOT EXISTS (SELECT * FROM [migrations] WHERE [migrationname] = '001-book-collection.sql')
BEGIN
    -- Create tables for user authentication and book collection
    CREATE TABLE [users] (
        [userid] INT PRIMARY KEY IDENTITY(1,1),
        [username] NVARCHAR(255) NOT NULL,
        [password] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [handle] NVARCHAR(255) NOT NULL UNIQUE,
        [role] NVARCHAR(50) DEFAULT 'user' CHECK ([role] IN ('user', 'admin')), -- Role limited to 'user' and 'admin'
        [createdat] DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE [books] (
        [bookid] INT PRIMARY KEY IDENTITY(1,1),
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]), -- The user who owns this book
        [title] NVARCHAR(255) NOT NULL,
        [author] NVARCHAR(255) NOT NULL,
        [genre] NVARCHAR(100),
        [description] NVARCHAR(MAX),
        [createdat] DATETIME DEFAULT GETDATE(),
        [updatedat] DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE [user_books] (
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [bookid] INT FOREIGN KEY REFERENCES [books]([bookid]),
        PRIMARY KEY ([userid], [bookid]) -- This ensures no duplicate books for the same user
    );

    -- Insert the applied migration record
    INSERT INTO [migrations] ([migrationname]) VALUES ('001-book-collection.sql');
END

