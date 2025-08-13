import fs from 'fs';
import path from 'path';
import {
    jPackConfig,
    LogMe
} from "../jpack/utils.js";

jPackConfig.init({
    name: 'DOM',
    alias: 'jizy-dom',
    cfg: 'dom',
    assetsPath: 'dist',
    checkConfig: (config) => {
        // Perform any necessary checks on the config
        return config;
    },
    genBuildJs: (code, config) => {
        // Generate the build JavaScript code
        return code;
    },
    onPacked: (config) => {
        //LogMe.log('Clean dist folder content')
        const target = jPackConfig.get('assetsPath');
        //removeEmptyDirs(target);

        // move the .min.js file in dist/js/ to dist/
        LogMe.log('Move minified JS file to dist root');
        const minJsFile = path.join(target, 'js', `${jPackConfig.get('alias')}.min.js`);
        if (fs.existsSync(minJsFile)) {
            fs.renameSync(minJsFile, path.join(target, `${jPackConfig.get('alias')}.min.js`));
        }
    }
});
