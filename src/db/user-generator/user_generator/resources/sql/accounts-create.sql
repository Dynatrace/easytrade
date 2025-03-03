USE [TradeManagement]
GO
CREATE TABLE [dbo].[Accounts] (
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [PackageId] INT NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [Username] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [HashedPassword] nvarchar(255) NOT NULL,
    [Origin] nvarchar(255) NOT NULL,
    [CreationDate] datetimeoffset(0) NOT NULL,
    [PackageActivationDate] datetimeoffset(0) NOT NULL,
    [AccountActive] BIT,
    [Address] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Accounts] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
    CONSTRAINT [FK_Accounts_Packages] FOREIGN KEY ([PackageId]) REFERENCES [Packages]([Id])
)
GO
