USE [TradeManagement]
GO
	CREATE TABLE [dbo].[Products] (
		[Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
		[Name] nvarchar(50) NOT NULL,
		[Ppt] DECIMAL (18, 8) NOT NULL,
		[Currency] nvarchar(10) NOT NULL,
		CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY]
	)
GO
INSERT INTO
	[dbo].[Products] (
		[Id],
		[Name],
		[Ppt],
		[Currency]
	)
VALUES(
    'b0000000-0000-4000-8000-000000000001',
    "Share",
    5.9,
    "EUR"
),
(
    'b0000000-0000-4000-8000-000000000002',
    "ETF",
    2.5,
    "EUR"
),
(
    'b0000000-0000-4000-8000-000000000003',
    "Crypto",
    1.9,
    "EUR"
);
GO
