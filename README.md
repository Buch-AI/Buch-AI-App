# Buch AI App

Coming soon. Buch AI is the ultimate short story ideation, brainstorming, manuscript writing and illustration companion, designed for fictional literature creatives and artists.

## Tech stack

[![My Skills](https://skillicons.dev/icons?i=fastapi,githubactions,js,nodejs,npm,react,tailwind,ts)](https://skillicons.dev)

## Get started with development

Clone the repository.

```bash
git clone https://github.com/Buch-AI/Buch-AI-App.git
```

Install the dependencies.
```bash
cd Buch-AI-App/
npm install
```

Run the app for your intended target platform in development mode.
```bash
npm run web:d
npm run ios:d
npm run android:d
```

## Appendix: FAQs

### Why is the bundler complaining about the assets directory?

You may see the following error when initializing the app:
```
Error: ENOENT: no such file or directory, scandir '/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/images'
    at Object.readdir (node:internal/fs/promises:950:18)
    at getAbsoluteAssetRecord (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Assets.js:77:17)
    at getAsset (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Assets.js:191:18)
    at Server._processSingleAssetRequest (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Server.js:335:20)
    at Server._processRequest (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Server.js:417:7)
Error: ENOENT: no such file or directory, scandir '/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/images'
    at Object.readdir (node:internal/fs/promises:950:18)
    at getAbsoluteAssetRecord (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Assets.js:77:17)
    at getAsset (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Assets.js:191:18)
    at Server._processSingleAssetRequest (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Server.js:335:20)
    at Server._processRequest (/Users/jyjulianwong/Desktop/Programming/Buch-AI-App/node_modules/metro/src/Server.js:417:7)
```

This is a known issue with the `metro` bundler for web. Specifically, the bundler expects the `images` directory to be present in the root of the project when the `baseUrl` option is set in `app.json`. You can safely ignore this error and expect the app to work as expected.

## Appendix: Expo

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

### Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
