USE [TradeManagement]
GO
CREATE TABLE [dbo].[Packages] (
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [Name] nvarchar(50) NOT NULL,
    [Price] DECIMAL (18, 8) NOT NULL,
    [Support] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Packages] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY]
)
GO
INSERT INTO [dbo].[Packages](
    [Id],
    [Name],
    [Price],
    [Support]
)
VALUES
(
    'a0000000-0000-4000-8000-000000000001',
    'Starter',
    0.0,
    "['Email']"
),
(
    'a0000000-0000-4000-8000-000000000002',
    'Light',
    24.99,
    "['Email','Hotline']"
),
(
    'a0000000-0000-4000-8000-000000000003',
    'Pro',
    49.99,
    "['Email','Hotline','AccountManager']"
);
GO
