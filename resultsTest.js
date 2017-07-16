var ApplitoolsTestResultHandler = require('./applitoolsTestHandler.js').ApplitoolsTestResultHandler;

const {Builder, By, until} = require('selenium-webdriver');
var path = require('chromedriver').path;
var driver = new Builder().forBrowser('chrome').build();
var Eyes = require('eyes.selenium').Eyes;
var eyes = new Eyes();

var applitoolsKey = 'Your Applitools Key'
var applitoolsViewKey = 'Your Applitools View Key'
var downloadDir = 'Your Download Directory' //e.g. /Users/images

eyes.setApiKey(applitoolsKey);

try {
  eyes.open(driver, 'Applitools', 'Test Web Page', {width: 900, height: 600}).then(function(driver) {
    driver.get('https://applitools.com/helloworld');
    eyes.checkWindow('Main Page');
    driver.findElement(By.tagName('button')).click();
    eyes.checkWindow('Click!');
    }).then(function(){
      return eyes.close(false);
    }).then(function(testResult){
      var handler= new ApplitoolsTestResultHandler(testResult, applitoolsViewKey);

      handler.downloadImages(downloadDir, 'baseline'); //valid types = baseline, current, diff

      var testStatus = handler.stepStatusArray();
      console.log("My Test Status: " + testStatus)
    });
} finally {
  driver.quit();
  eyes.abortIfNotClosed();
}
