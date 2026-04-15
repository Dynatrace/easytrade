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
-- INTERNAL accounts start with 0; PRESET accounts get a random quantity in [1, 100]
INSERT INTO [dbo].[Ownedinstruments] ([AccountId], [InstrumentId], [Quantity], [LastModificationDate])
SELECT
    a.[Id],
    i.[Id],
    CASE
        WHEN a.[Origin] = 'INTERNAL' THEN 0
        ELSE ABS(CHECKSUM(NEWID())) % 100 + 1
    END,
    SYSDATETIMEOFFSET()
FROM [dbo].[Accounts] a
CROSS JOIN [dbo].[Instruments] i;
