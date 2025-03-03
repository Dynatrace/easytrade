// https://stackoverflow.com/questions/48743165/toarrayasync-throws-the-source-iqueryable-doesnt-implement-iasyncenumerable

using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;

namespace EasyTrade.BrokerService.Test.Helpers;

public static class AsyncQueryableExtenstion
{
    public static IQueryable<TEntity> AsAsyncQueryable<TEntity>(this IEnumerable<TEntity> source) =>
        new AsyncQueryable<TEntity>(source ?? throw new ArgumentNullException(nameof(source)));
}

public class AsyncQueryable<TEntity>
    : EnumerableQuery<TEntity>,
        IAsyncEnumerable<TEntity>,
        IQueryable<TEntity>
{
    public AsyncQueryable(IEnumerable<TEntity> enumerable)
        : base(enumerable) { }

    public AsyncQueryable(Expression expression)
        : base(expression) { }

    public IAsyncEnumerator<TEntity> GetEnumerator() =>
        new AsyncEnumerator(this.AsEnumerable().GetEnumerator());

    public IAsyncEnumerator<TEntity> GetAsyncEnumerator(
        CancellationToken cancellationToken = default
    ) => new AsyncEnumerator(this.AsEnumerable().GetEnumerator());

    IQueryProvider IQueryable.Provider => new AsyncQueryProvider(this);

    class AsyncEnumerator : IAsyncEnumerator<TEntity>
    {
        private readonly IEnumerator<TEntity> _inner;

        public AsyncEnumerator(IEnumerator<TEntity> inner) => _inner = inner;

        public void Dispose() => _inner.Dispose();

        public TEntity Current => _inner.Current;

        public ValueTask<bool> MoveNextAsync() => new(_inner.MoveNext());

#pragma warning disable CS1998 // Nothing to await
        public async ValueTask DisposeAsync() => _inner.Dispose();
#pragma warning restore CS1998
    }

    class AsyncQueryProvider : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;

        internal AsyncQueryProvider(IQueryProvider inner) => _inner = inner;

        public IQueryable CreateQuery(Expression expression) =>
            new AsyncQueryable<TEntity>(expression);

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression) =>
            new AsyncQueryable<TElement>(expression);

        public object Execute(Expression expression) => _inner.Execute(expression)!;

        public TResult Execute<TResult>(Expression expression) =>
            _inner.Execute<TResult>(expression);

        public IAsyncEnumerable<TResult> ExecuteAsync<TResult>(Expression expression) =>
            new AsyncQueryable<TResult>(expression);

        TResult IAsyncQueryProvider.ExecuteAsync<TResult>(
            Expression expression,
            CancellationToken cancellationToken
        ) => Execute<TResult>(expression);
    }
}
