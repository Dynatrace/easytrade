using easyTradeLoginService.Utils;
using Xunit;

namespace easyTradeLoginService.Controllers.tests
{
    public class HashUtilTests
    {
        [Fact]
        public void HashUtilTest()
        {
            //compare with results of https://emn178.github.io/online-tools/sha256.html
            Assert.Equal("ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", HashUtil.hash("a"));
            Assert.Equal("fb8e20fc2e4c3f248c60c39bd652f3c1347298bb977b8b4d5903b85055620603", HashUtil.hash("ab"));
            Assert.Equal("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", HashUtil.hash("abc"));
        }
    }
}
