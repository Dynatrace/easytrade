USE [TradeManagement]
GO
CREATE TABLE [dbo].[Packages] (
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [Name] nvarchar(50) NOT NULL,
    [Price] DECIMAL (18, 8) NOT NULL,
    [Support] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Packages] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY]
)
GO
    SET IDENTITY_INSERT [dbo].[Packages] ON
GO
INSERT INTO [dbo].[Packages](
    [Id],
    [Name],
    [Price],
    [Support]
)
VALUES
(
    1,
    'Starter',
    0.0,
    "['Email']"
),
(
    2,
    'Light',
    24.99,
    "['Email','Hotline']"
),
(
    3,
    'Pro',
    49.99,
    "['Email','Hotline','AccountManager']"
);
GO