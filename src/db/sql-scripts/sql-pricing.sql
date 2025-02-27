USE [TradeManagement]
GO
        CREATE TABLE [dbo].[Pricing] (
                [Id] INT IDENTITY(1, 1) NOT NULL,
                [InstrumentId] INT NOT NULL,
                [Timestamp] datetimeoffset(0) NOT NULL,
                [Open] DECIMAL(18, 8) NOT NULL,
                [High] DECIMAL(18, 8) NOT NULL,
                [Low] DECIMAL(18, 8) NOT NULL,
                [Close] DECIMAL(18, 8) NOT NULL,
                CONSTRAINT [PK_Pricing] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
                CONSTRAINT [FK_Pricing_Instruments] FOREIGN KEY ([InstrumentId]) REFERENCES [Instruments]([Id])
        )
GO