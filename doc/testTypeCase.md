# 测试用例例子

以下所有测试案例代码都在 `example` 目录下，可以 clone 代码到本地进行调试。

## 调用类型

### 同步函数调用

所谓的同步调用，即判定给定输入，对应的输出是否符合预期。

比如我们要测试下面这段代码。

```javascript
export const formatUserListInfo = (userList = []) => {
    if (!Array.isArray(userList) || userList.length === 0) {
        return [];
    }

    return userList.map((item) => {
        return {
            ...item,
            info: `${item.name} ${item.age}`,
        };
    });
};
```

那么我们写的测试配置代码如下：

```yml
path: ../index.js
    - target: formatUserListInfo
      io:
          - '() -> []'
          - '({}) -> []'
          - '([]) -> []'
          - '(undefined) -> []'
          - '([{ name: "Jim", age: 10 }]) -> [{ name: "Jim", age: 10, info: "Jim 10" }]'
```

最终生成的测试代码如下：

```javascript
import { formatUserListInfo } from '../../../src/index.js';

test('formatUserListInfo_3', async () => {
    jest.clearAllMocks();

    expect(formatUserListInfo()).toEqual([]);
    expect(formatUserListInfo({})).toEqual([]);
    expect(formatUserListInfo([])).toEqual([]);
    expect(formatUserListInfo(undefined)).toEqual([]);
    expect(formatUserListInfo([{ name: 'Jim', age: 10 }])).toEqual([{ name: 'Jim', age: 10, info: 'Jim 10' }]);
});
```

对于这些同步调用的 case，我们常常需要把边界给判断下，边界条件是相对容易出现 Bug 的地方，而我们自己手写测试用例的时候，常常会忘记写这个。现在有了 DSL, 我们可以快速的把这些边界的测试用例给补充上，提高效率。

### 异步函数调用(Promsie风格)

对于返回 Promise 的函数，通常它是一个由副作用的函数，比如发起网络请求等。通常需要将该函数所依赖的模块 mock 掉，然后再判断返回的值是否与预期的相同。

比如要测试如下代码：

```javascript
export const getQQUserInfo = (params) => {
    const calculateParams = Object.assign(params);

    return requestQQUserInfo(calculateParams).then(
        (res) => {
            // 执行某些操作
            return Promise.resolve(res);
        },
        (res) => {
            // 执行某些操作
            return Promise.reject(res);
        }
    );
};
```

`requestQQUserInfo` 就是一个封装了网络请求的函数，那么在测试上面的代码时，就需要将其 Mock 掉。

我们写的测试配置代码如下：

```javascript
// data.js
export const mockSuccessRequestQQUserInfo = jest.fn((params) => {
    if (params.userId === 123) {
        return Promise.resolve({
            userId: 123,
            userName: 'tim',
        });
    }
});
```

```yml
# index.test.yml
path: ../index.js
cases:
    - target: getQQUserInfo
      name: getQQUserInfo_success
      io:
          - '({ userId: 123 })'
      invokeType: 'promise:resolve:true'
      mocks:
          - type: function
            target: 'requestQQUserInfo:from:../dependent'
            mock: 'mockSuccessRequestQQUserInfo:from:./data'
      expect:
          - 'res:compare:equal ---> { userId: 123, userName: "tim" }'
```

最终生成的测试代码如下：

```javascript
import { getQQUserInfo } from '../../../src/index.js';
import * as dependent_046b from '../../../src/dependent';
import { mockSuccessRequestQQUserInfo } from '../../../src/test/data';

test('getQQUserInfo_success', async () => {
    jest.clearAllMocks();

    jest.spyOn(dependent_046b, 'requestQQUserInfo').mockImplementation(mockSuccessRequestQQUserInfo);
    return getQQUserInfo({ userId: 123 }).then(
        (res) => {
            expect(res).toEqual({ userId: 123, userName: 'tim' });
        },
        (res) => {
            expect(true).toBe(false);
        }
    );
});
```

这里我们测试当 `promise resolve` 时，对应的值是否与预期的值相同，同时如果该函数内如果还执行了其它副作用操作，那么也可以通过 mock 参数把这些操作 mock 掉，并对它们进行断言判断。

### 自定义调用方式

见[语法说明文档](./grammar.md)

### async 调用方式

支持中。

## mock 类型

见[语法说明文档](./grammar.md)