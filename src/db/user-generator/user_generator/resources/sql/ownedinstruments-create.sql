USE [TradeManagement]
GO
CREATE TABLE [dbo].[Ownedinstruments](
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [AccountId] INT NOT NULL,
    [InstrumentId] INT NOT NULL,
    [Quantity] DECIMAL (18, 8) NOT NULL,
    [LastModificationDate] datetimeoffset(0),
    CONSTRAINT [PK_Ownedinstruments] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
    CONSTRAINT [FK_Ownedinstruments_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Ownedinstruments_Instruments] FOREIGN KEY ([InstrumentId]) REFERENCES [Instruments]([Id])
)
GO
