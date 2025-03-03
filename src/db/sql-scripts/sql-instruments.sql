USE [TradeManagement]
GO 
CREATE TABLE [dbo].[Instruments](
        [Id] INT IDENTITY(1, 1) NOT NULL,
        [ProductId] INT NOT NULL,
        [Code] nvarchar(6) NOT NULL,
        [Name] nvarchar(255) NOT NULL,
        [Description] nvarchar(255) NOT NULL,
        CONSTRAINT [PK_Instruments] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
        CONSTRAINT [FK_Instruments_Products] FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id])
    )
GO
SET
	IDENTITY_INSERT [dbo].[Instruments] ON
GO
INSERT INTO [dbo].[Instruments] (
        [Id],
        [ProductId],
        [Code],
        [Name],
        [Description]
    )
VALUES(
        1,
        1,
        'ETRAVE',
        'EasyTravel',
        'EasyTravel Incorporated'
    ),
    (
        2,
        2,
        'EPLANE',
        'EasyPlanes',
        'EasyPlanes Worldwide'
    ),
    (
        3,
        3,
        'EHOTEL',
        'EasyHotels',
        'EasyHotels International'
    ),
    (
        4, 
        1, 
        'JANGRP', 
        'Janssen Groep', 
        'Janssen Groep'
    ),
    (
        5, 
        2, 
        'CORFIG', 
        'Corti e figli', 
        'Corti e figli'
    ),
    (
        6, 
        3, 
        'CMRTIN', 
        'Cummerata Inc', 
        'Cummerata Inc'
    ),
    (
        7,
        1,
        'CHAMAT',
        'Charles - Mathieu',
        'Charles - Mathieu'
    ),
    (
        8,
        2,
        'BLSTCR',
        'BlueStar Craft',
        'BlueStar Craft'
    ),
    (
        9, 
        3, 
        'CAFGAL',
        'Cafe Galore', 
        'Cafe Galore'
    ),
    (
        10,
        1,
        'DECGRP',
        'Deckerr Gruppe',
        'Deckerr Gruppe'
    ),
    (
        11, 
        2, 
        'PETBAN', 
        'Peters Bank', 
        'Peters Bank'
    ),
    (
        12,
        3,
        'BATBAT',
        'Batista - Batista',
        'Batista - Batista'
    ),
    (
        13, 
        1, 
        'STOLLC', 
        'Stokes LLC', 
        'Stokes LLC'
    ),
    (
        14,
        2,
        'LEBRGA',
        'Lemke - Braun Garden',
        'Lemke - Braun Garden'
    ),
    (
        15,
        3,
        'MOROBA',
        'Mohr Royalty Bank',
        'Mohr Royalty Bank'
    );
GO