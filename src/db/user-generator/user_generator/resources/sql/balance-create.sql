USE [TradeManagement]
GO
CREATE TABLE [dbo].[Balance] (
    [AccountId] INT NOT NULL,
    [Value] DECIMAL (18, 8) NOT NULL,
    CONSTRAINT [PK_Balance] PRIMARY KEY CLUSTERED ([AccountId] ASC) ON [PRIMARY],
    CONSTRAINT [FK_Balance_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]) ON DELETE CASCADE 
)
GO
