USE [TradeManagement]
GO
CREATE TABLE [dbo].[Trades] (
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [AccountId] INT NOT NULL,
    [InstrumentId] INT NOT NULL,
    [Direction] varchar(8) NOT NULL CHECK(Direction IN("buy", "sell", "longbuy", "longsell")),
    [Quantity] DECIMAL (18, 8) NOT NULL,
    [EntryPrice] DECIMAL (18, 8) NOT NULL,
    [TimestampOpen] datetimeoffset(0) NOT NULL,
    [TimestampClose] datetimeoffset(0),
    [TradeClosed] BIT,
    [TransactionHappened] BIT,
    [Status] nvarchar(255) NOT NULL
    CONSTRAINT [PK_Trades] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
    CONSTRAINT [FK_Trades_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Trades_Instruments] FOREIGN KEY ([InstrumentId]) REFERENCES [Instruments]([Id])
)
GO
