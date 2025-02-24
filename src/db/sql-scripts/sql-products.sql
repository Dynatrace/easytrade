USE [TradeManagement]
GO
	CREATE TABLE [dbo].[Products] (
		[Id] INT IDENTITY(1, 1) NOT NULL,
		[Name] nvarchar(50) NOT NULL,
		[Ppt] DECIMAL (18, 8) NOT NULL,
		[Currency] nvarchar(10) NOT NULL,
		CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY]
	)
GO
	SET IDENTITY_INSERT [dbo].[Products] ON
GO
INSERT INTO
	[dbo].[Products] (
		[Id],
		[Name],
		[Ppt],
		[Currency]
	)
VALUES(
    1,
    "Share",
    5.9,
    "EUR"
),
(
    2,
    "ETF",
    2.5,
    "EUR"
),
(
    3,
    "Crypto",
    1.9,
    "EUR"
);
GO