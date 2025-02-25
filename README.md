# 项目介绍
本项目是一个简单swap流程的项目，目前只支持sepolia链上的交互。
# 主要内容
swap的过程是基于uniswapV2的合约进行的。MYST代币和SYT代币是自己生成的代币，目前支持在sepolia上进行swap。
钱包使用的metamask
# 流程
1. 如果没有 MYST代币 和 SYT代币 可以在Faucet的页面中填入自己的地址，可以各领取10个代币，放入自己的钱包。
代币在metamask中的显示问题，因为是测试代币可能需要根据下方的代币的地址，自行手动添加才能展示。
2. 返回swap的页面，输入金额，点击swap可完成整个流程
3. 本地启动项目需要自行配置.env文件 REACT_APP_ALCHEMY_API_KEY=Your_ALCHEMY_API_KEY

# 依赖
uniswapV2 Factory 合约地址：0xF62c03E08ada871A0bEb309762E260a7a6a880E6
uniswapV2 Router 合约地址：0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
MYST 合约地址：0x61D6e72B6B337Fc9dfe6710059cF917826695ADD
SYT  合约地址：0x1ED297EB63eaa72B4f9B2d22D5578c2c0DA05CcE
调用Faucet 合约地址：0x755Cd71f0C7fc798E2436D4B7D1DAD39a0882652



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
