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

-- Seed one initial price per instrument so the broker-service can serve
-- instrument data immediately on startup (before contentcreator runs).
-- Values are the time0 (00:00) anchor prices from contentcreator's Instruments.java.
-- open = close = high = low so the candle is flat but valid.
INSERT INTO [dbo].[Pricing] ([Timestamp], [InstrumentId], [Open], [High], [Low], [Close])
VALUES
    (SYSDATETIMEOFFSET(), 1,  150.0000,    150.0000,    150.0000,    150.0000   ),  -- EASYTRAVEL
    (SYSDATETIMEOFFSET(), 2,   73.0000,     73.0000,     73.0000,     73.0000   ),  -- EASYPLANES
    (SYSDATETIMEOFFSET(), 3,   25.0000,     25.0000,     25.0000,     25.0000   ),  -- EASYHOTELS
    (SYSDATETIMEOFFSET(), 4,    0.21700000,  0.21700000,  0.21700000,  0.21700000),  -- JANGRP
    (SYSDATETIMEOFFSET(), 5,    0.24400000,  0.24400000,  0.24400000,  0.24400000),  -- CORFIG
    (SYSDATETIMEOFFSET(), 6,    2.17400000,  2.17400000,  2.17400000,  2.17400000),  -- CMRTIN
    (SYSDATETIMEOFFSET(), 7,    1.12700000,  1.12700000,  1.12700000,  1.12700000),  -- CHAMAT
    (SYSDATETIMEOFFSET(), 8,   10.02100000, 10.02100000, 10.02100000, 10.02100000),  -- BLSTCR
    (SYSDATETIMEOFFSET(), 9,    4.61300000,  4.61300000,  4.61300000,  4.61300000),  -- CAFGAL
    (SYSDATETIMEOFFSET(), 10,   0.88700000,  0.88700000,  0.88700000,  0.88700000),  -- DECGRP
    (SYSDATETIMEOFFSET(), 11,   4.09500000,  4.09500000,  4.09500000,  4.09500000),  -- PETBAN
    (SYSDATETIMEOFFSET(), 12,   8.89100000,  8.89100000,  8.89100000,  8.89100000),  -- BATBAT
    (SYSDATETIMEOFFSET(), 13,   0.46200000,  0.46200000,  0.46200000,  0.46200000),  -- STOLLC
    (SYSDATETIMEOFFSET(), 14,   0.11200000,  0.11200000,  0.11200000,  0.11200000),  -- LEBRGA
    (SYSDATETIMEOFFSET(), 15,   0.09970000,  0.09970000,  0.09970000,  0.09970000)   -- MOROBA
GO