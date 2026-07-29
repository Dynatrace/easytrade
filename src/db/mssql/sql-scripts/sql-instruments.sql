USE [TradeManagement]
GO
CREATE TABLE [dbo].[Instruments](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [ProductId] UNIQUEIDENTIFIER NOT NULL,
        [Code] nvarchar(6) NOT NULL,
        [Name] nvarchar(255) NOT NULL,
        [Description] nvarchar(255) NOT NULL,
        CONSTRAINT [PK_Instruments] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
        CONSTRAINT [FK_Instruments_Products] FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id])
    )
GO
INSERT INTO [dbo].[Instruments] (
        [Id],
        [ProductId],
        [Code],
        [Name],
        [Description]
    )
VALUES(
        'c0000000-0000-4000-8000-000000000001',
        'b0000000-0000-4000-8000-000000000001',
        'ETRAVE',
        'EasyTravel',
        'EasyTravel Incorporated'
    ),
    (
        'c0000000-0000-4000-8000-000000000002',
        'b0000000-0000-4000-8000-000000000002',
        'EPLANE',
        'EasyPlanes',
        'EasyPlanes Worldwide'
    ),
    (
        'c0000000-0000-4000-8000-000000000003',
        'b0000000-0000-4000-8000-000000000003',
        'EHOTEL',
        'EasyHotels',
        'EasyHotels International'
    ),
    (
        'c0000000-0000-4000-8000-000000000004',
        'b0000000-0000-4000-8000-000000000001',
        'JANGRP',
        'Janssen Groep',
        'Janssen Groep'
    ),
    (
        'c0000000-0000-4000-8000-000000000005',
        'b0000000-0000-4000-8000-000000000002',
        'CORFIG',
        'Corti e figli',
        'Corti e figli'
    ),
    (
        'c0000000-0000-4000-8000-000000000006',
        'b0000000-0000-4000-8000-000000000003',
        'CMRTIN',
        'Cummerata Inc',
        'Cummerata Inc'
    ),
    (
        'c0000000-0000-4000-8000-000000000007',
        'b0000000-0000-4000-8000-000000000001',
        'CHAMAT',
        'Charles - Mathieu',
        'Charles - Mathieu'
    ),
    (
        'c0000000-0000-4000-8000-000000000008',
        'b0000000-0000-4000-8000-000000000002',
        'BLSTCR',
        'BlueStar Craft',
        'BlueStar Craft'
    ),
    (
        'c0000000-0000-4000-8000-000000000009',
        'b0000000-0000-4000-8000-000000000003',
        'CAFGAL',
        'Cafe Galore',
        'Cafe Galore'
    ),
    (
        'c0000000-0000-4000-8000-000000000010',
        'b0000000-0000-4000-8000-000000000001',
        'DECGRP',
        'Deckerr Gruppe',
        'Deckerr Gruppe'
    ),
    (
        'c0000000-0000-4000-8000-000000000011',
        'b0000000-0000-4000-8000-000000000002',
        'PETBAN',
        'Peters Bank',
        'Peters Bank'
    ),
    (
        'c0000000-0000-4000-8000-000000000012',
        'b0000000-0000-4000-8000-000000000003',
        'BATBAT',
        'Batista - Batista',
        'Batista - Batista'
    ),
    (
        'c0000000-0000-4000-8000-000000000013',
        'b0000000-0000-4000-8000-000000000001',
        'STOLLC',
        'Stokes LLC',
        'Stokes LLC'
    ),
    (
        'c0000000-0000-4000-8000-000000000014',
        'b0000000-0000-4000-8000-000000000002',
        'LEBRGA',
        'Lemke - Braun Garden',
        'Lemke - Braun Garden'
    ),
    (
        'c0000000-0000-4000-8000-000000000015',
        'b0000000-0000-4000-8000-000000000003',
        'MOROBA',
        'Mohr Royalty Bank',
        'Mohr Royalty Bank'
    );
GO
