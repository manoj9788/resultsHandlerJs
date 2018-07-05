const assert = require('assert');
const {Builder, By, promise, until} = require('selenium-webdriver');
const {Eyes, Target} = require('eyes.selenium');
var ApplitoolsTestResultHandler = require('../applitoolsTestHandler').ApplitoolsTestResultHandler;
promise.USE_PROMISE_MANAGER = false;

describe('Simple Test', function() {
    let driver;
    let eyes;

    beforeEach(async function() {
        eyes = new Eyes();
        eyes.setApiKey("HZeTQj103qqbLJkpT0Ez81CTbivkDEYQx4Q7GjM104Kv2Hg110");
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterEach(async function() {
        await driver.quit();

    });

    it('Results Handler test', async function() {

        var applitoolsViewKey = '3Q0uVg0jxpEtd8iA3T9HONwOUnZUikHMqnfdUlsPdKA110'
        let downloadPath = process.cwd()+'/downloadImages'
        var downloadDir = downloadPath

        await eyes.open(driver, 'Google Page', 'GoogleTestPage', {width: 1000, height: 700});

        await driver.get("http://the-internet.herokuapp.com/dynamic_content");

        await eyes.checkWindow("landingPage");

        let results = await eyes.close(false);

        const handler= new ApplitoolsTestResultHandler(results, applitoolsViewKey);
        handler.downloadImages(downloadDir, 'diff'); //valid types = baseline, current, diff
        handler.getStepResults();

        let testStatus = handler.stepStatusArray();
        console.log("My Test Status: " + testStatus +  Promise.resolve(handler.getStepResults()));


    });
});