# YML 语法

utdsl 是写在 YML 文件中的，具体的 YML 语法这里不再进行介绍，详细可以阅读阮一峰老师的写的 [YAML 语言教程](http://www.ruanyifeng.com/blog/2016/07/yaml.html)。

# UTDSL 语法

## 公共的语法说明

### 路径

对于涉及到路径的参数，都支持三种不同的表示方式。

-   相对于系统根目录: `/xx/xxx/xxx`
-   相对于项目根目录：`xx/xx/xxx`
-   相对于测试配置文件(yml 文件)路径：`./xx/xx/` 或 `../xx/xx`

## 表达式

UTDSL 中表达式的格式为： `value:prop1:value1:prop2:value2:propx:valuex`

比如表达式 `getData:from:../data/data.js`，那么我们就可以知道，这个表达式中的 `value` 为 getData, 它有个 `from` 属性，值为 `../data/data.js`。

# 变量参数

变量参数支持直接写 js 表达式或者变量导入的语法。

比如 `this` 参数。

-   js 表达式

```yml
this: '{ name: "test" }'
```

-   数据导入

对于某些数据可能过于长，那么可以写成数据导入的语法。
如下表示参数 `this` 的值是 `data.js` 中的 `mockThisData` 变量。

```yml
this: 'mockThisData:from:./data.js'
```

## 配置项参数语法

推荐将同一个文件的测试配置代码的写在同一个文件中，这里便于管理。同时为了最大化 jest 的并发性能，这里默认会为每个测试 case 生成单独的测试文件。

-   path: 测试文件的路径.
    ```yaml
    path: src/biz-components/login-page/src/data-adapter.js
    ```
-   cases: 测试用例项的参数，一个测试用例项代表一个测试用例 case.
    ```yml
    path: '../index.ts'
    cases:
        - target: add
          name: add_two_number
          io:
              - '(1, 2) --> 3'
              - '(3, 4) --> 7'
        - target: delete
          name: delete_number
          io:
              - '(5, 2) --> 3'
              - '(11, 4) --> 7'
    ```

---

### case 项的参数

-   target: 被测试的目标，也就是被文件的对象的导出名称。
-   name: 测试 case 的文件名称，通常用来描述这个测试文件的含义（建议用英文，因为会作为文件名称）。
-   this: 同 JS 中的 this, 用于绑定函数调用时的上下文环境。


    ```yml
    this: '{ name: "test" }'
    ```

-   io: 输入和输出参数

    支持设置多个，参数类型就变为数组的形式。

    -   仅有输入参数

    ```yml
    io: '([], testData:from:../data/data.js, [])'
    ```

    ```yml
    io:
        - '([], advertiser:from:../data/data.js, [])'
        - '{name: "github" }'
    ```

    -   有输入和输出参数（这意味要对比输出参数是否与预期的相同）

        两种比较方式：

        -   `-->`：使用 JS 的 `Object.is` 进行对比。
        -   `->`: 使用深比较进行对比（使用的是 jest 框架中的 `toEqual`）。

    ```yml
    io:
        - '(1, 2) --> 3'
        - '({ name: "time" }, { age: 12 }) -> {name: "time", age: 12}'
    ```

-   mocks: 指定需要 mock 的数据项

    参数类型就变为数组的形式，数据项中的参数类型见  本文档的 mocks 项的参数。

-   prefixContent: 前置内容代码

    有些测试案例是需要一些初始化代码的，这里代码通常对于同一类测试用例来说基本是一样的，那么就可以把这部分代码抽离出来，通过配置的方式插入到测试用例代码中。

    ```javascript
    // actionPrefix.txt
    import { useDispatch, initStore, getState } from '<rootDir>/src/initStore';
    initStore({});
    const dispatch = useDispatch();
    ```

    ```yml
    prefixContent: ':from:../data/actionPrefix.txt'
    ```

-   invokeType: 调用类型

    指明函数的调用方式，目前可以分为以下几种。

    -   sync: 同步调用

        例如 `add = (a, b) => { return a + b; }` ，这种就是所谓的同步调用，简单的判断输出是否符合预期。

        ```yml
        invokeType: 'sync'
        ```

        同时，也支持自定义调用的方式，或者高阶调用的方式。例如: `const result = dispatch(delete(a, b))`, 可以看到这个函数也是同步调用，那么通过 `custom` 参数也可以很容易地支持这种。

        ```yml
        invokeType: 'sync:custom:dispatch(<invoke>)'
        ```

    -   promise: 返回 Promise 的调用

        -   指定预期是 resolve 还是 reject

        ```yml
        invokeType: 'promise:resolve:true'
        # invokeType: 'promise:reject:true'
        ```

        -   自定义调用方式

        比如 `dispatch(delete(a, b)).then((res) => {}, (error) => {})`。

        ```yml
        invokeType: 'promise:custom:dispatch(<invoke>):resolve:true'
        ```

-   expect: 预期的行为

    该参数可以是一个数组字符串，也可以是字符串的形式。

    `expect` 参数目前支持的属性如下。

    -   value: 表示将被 `expect` 的对象
    -   type: 预期的类型

        可选值如下：

        -   default: 默认值，判断值
        -   call: 判断调用的参数
        -   time: 判断调用的次数

    -   position: 指明要判断的参数的位置

        值的类型为 `[x][y]`, 这表示要判断第 x 次调用时，输入参数中的第 y 个的值。

    -   compare: 比较的类型，默认值为 `equal`.

        目前支持以下几种。

        - `hasProp`：判断对象是否拥有该属性
        - `equal`: 深比较（使用 jest 的 `toEqual` 进行判断）
        - `is`: 浅比较（使用 `Object.is` 进行判断）
        - `>`: 大于
        - `>=`: 大于或等于
        - `<`: 小于
        - `<=`: 小于或等于

举例：

- 判断调用次数

```yml
expect:
    - 'getUserList:type:call ---> 1'
```

生成的测试代码为：

```javascript
expect(getUserList).toBeCalledTimes(1)
```

- 判断调用结果的参数

判断第一次调用时的第三个参数。

```yml
expect:
    - 'getUserList:type:call:position:[0][2]:compare:is ---> 1'
```

生成的测试代码为：
```javascript
expect(getUserList.mock.calls[0][2]).toBe(1);
```

也可以直接判断所有参数。

```yml
expect:
    - ''getUserList:call ---> ("123", [], userInfo:from:../data.js)''
```

生成的测试代码：
```javascript
const { userInfo } from '../../../xxx/data.js';

// 省略其它代码

expect(getUserList).toHaveBeenCalledWith(123, [], userInfo);
```

`expect` 参数的额外例子：

通过上面的例子，相信你应该可以很容易知道下面例子的含义。

```yml
expect:
    - 'wx.test:type:call:position:[0][2] ---> 123'
    - 'wx.test:type:time ---> 123'
    - 'wx.test:type:time ---> time:from:./data/data.js'
    - 'res.count:compare:>= ---> 123'
    - 'res.data:compare:hasProp ---> "apiData"'
    - 'res.data:type:call:position:[2][2]---> 345'
```


### mocks 项的参数

-   target: 表示被 mock 的对象。
-   mock: 表示 mock 的对象（如果是变量导入的语法，该变量的名称需要以 mock 开头）。
-   needOriginModule: 是否需要保留原先的模块的内容（mock 整个文件时才会生效）。
-   type: 表示 mock 的类型（目前仅支持 function, variable, file）。

所有的 mock 数据都可以分为以下三种。

1. mock 的对象为全局变量

全局变量的 mock 是最简单的一种。

比如我们要测试如下的代码：

```javascript
export const showMessage = () => {
    global.wx.showModal();
};
```

那么对于这个被测试的代码， `global.wx.showModal` 就是一个外部依赖，我们就需要将起进行 mock 掉，并在后面进行判断其是否有调用，或者调用的参数是否符合预期（见后面的 expect 参数）。

```yml
mocks:
    - target: 'global.wx.showModal'
      mock: 'mockShowModal:from:./data.js'
      # mock: '() => { console.log("invoke showModal") }'
      type: 'variable'
```

2. mock 的对象为模块内的函数

一般用于在执行被测试的代码之前，将代码中用到的其它模块内的代码进行 Mock。

比如要测试如下的代码：

```javascript
import { getUserList } from '../action';

export const requestGetUserList = () => {
    /**
     * other code
     */

    return getUserList(param1, params2);
};
```

那么 getUserList 就是一个其它模块内的函数，需要被 mock 掉。

```yml
mocks:
    - target: 'getUserList:from:../src/action.js'
      mock: '() => { return [1,1,2]; }'
      # mock: 'mockGetList:from:../data.js'
      type: 'function'
```

3. mock 的对象为模块

 对于 mock 整个模块，在生成的测试用例代码中，这个模块的导入是会被 hoist 最前面的（详细可以看下 jest 的文档 Mock 相关的部分）。这里还需要注意，如果要保留函数模块内的其它函数，那么是需要将 `needOriginModule` 参数设置为 `true` 的。

这里有个关键点，如何判断是要 mock 掉这个模块还是 mock 模块内的函数。其实通过看这个要被 mock 的函数的调用时机就可以知道。

比如要 mock 掉 `utils` 模块中的 `getInitStore`。

```javascript
import { getInitStore } from '../../utils';

const store = getInitStore({ default: '1' });

export const getUserInfo = () => {
    const state = store.setState();
    // xxxx
};
```

从代码中可以看出，`getInitStore` 是在模块代码执行时就调用了，那么 `getInitStore` 就需要在这个模块被导入之前先 mock 掉，那么对应的测试代码如下。

```js
// data.js
export const mockUtils = {
    getInitStore: jest.fn(() => {
        return {
            setState: jest.fn(() => {}),
        };
    }),
};
```

```yml
mocks:
    - target: 'utils:from:../src/utils.js'
      mock: 'mockUtils:from:../data.js'
      needOriginModule: true
      type: 'file'
```
