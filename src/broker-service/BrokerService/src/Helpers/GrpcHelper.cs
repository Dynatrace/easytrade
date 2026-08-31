using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using Grpc.Core;
using System.Runtime.CompilerServices;

namespace EasyTrade.BrokerService.Helpers;

public static class GrpcHelper
{
    public static async Task<T> ExecuteAsync<T>(Func<Task<T>> call, [CallerMemberName] string callerName = "")
    {
        try { return await call(); }
        catch (Exception ex) { throw new DbException($"Db Adapter call error in \"{callerName}\" method", ex); }
    }

    public static async Task<T?> ExecuteOrNullAsync<T>(Func<Task<T>> call, [CallerMemberName] string callerName = "") where T : class
    {
        try { return await call(); }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound) { return null; }
        catch (Exception ex) { throw new DbException($"Db Adapter call error in \"{callerName}\" method", ex); }
    }
}
