var request = require('request');
var fs = require('fs');
var https = require('https');

class ApplitoolsTestResultHandler {
  constructor(testResult, viewKey) {
    this.testResult = testResult;
    this.viewKey = viewKey;
    this.testName = this.testName();
    this.appName = this.appName();
    this.viewportSize = this.viewportSize();
    this.hostOS = this.hostingOS();
    this.hostApp = this.hostingApp();
    this.testURL = this.setTestURL();
    this.serverURL = this.setServerURL();
    this.batchId = this.setBatchID();
    this.sessionId = this.setSessionID();
    this.steps = this.steps();
  }

  stepStatusArray() {
    var results = this.getStepResults().map(function(obj) {
      return obj.status
    });
    return results;
  }

  downloadImages(dir, type) {
    var imagesDir = this.directoryCreator(dir);
    var images = this.getImageUrls(type);
    for (var i = 0, len = images.length; i < len; i++) {
      var fileName = imagesDir + "/" + images[i][0];
      var downloadUrl = (images[i][1] + "?apiKey=" + this.viewKey);
      this.downloadImage(fileName, downloadUrl);
    }
  }

  ///Private Methods
  testValues() {
    //return this.testResult.value_;
    return this.testResult;
  }

  testName() {
    return this.testValues().name;
  }

  appName() {
    return this.testValues().appName;
  }

  viewportSize() {
    var width = this.testValues().hostDisplaySize.width;
    var height = this.testValues().hostDisplaySize.height;
    return width +"x"+ height;
  }

  hostingOS() {
    return this.testValues().hostOS;
  }

  hostingApp() {
    return this.testValues().hostApp;
  }

  setTestURL() {
    return this.testValues().appUrls.session;
  }

  setServerURL() {
    return this.testURL.split("/app")[0];
  }

  setBatchID() {
    return this.testValues().batchId;
  }

  setSessionID() {
    return this.testValues().id;
  }

  steps() {
    return this.testValues().steps;
  }

  getStepInfo(index) {
    return this.testValues().stepsInfo[index];
  }

  isTrue(a, b) {
    return !a.some(function (e, i) {
      return e != b[i];
    });
  }

  getStepResults() {
    var stepResults = new Array;
    var status = new String;

    for (var i = 0; i < this.steps; ++i) {
      var isDifferent = this.getStepInfo(i).isDifferent;
      var hasBaselineImage = this.getStepInfo(i).hasBaselineImage;
      var hasCurrentImage = this.getStepInfo(i).hasCurrentImage;

      var bools = [ isDifferent, hasBaselineImage, hasCurrentImage ];

      var isNew     = [ false, false, true  ];
      var isMissing = [ false, true,  false ];
      var isPassed  = [ false, true,  true  ];
      var isFailed  = [ true,  true,  true  ];

      if (this.isTrue(isPassed, bools)) {
        status = "PASS"
      }

      if (this.isTrue(isMissing, bools)) {
        status = "MISSING"
      }

      if (this.isTrue(isNew, bools)) {
        status = "NEW"
      }

      if (this.isTrue(isFailed, bools)) {
        status = "FAIL"
      }

      var stepInfo = {
        step: i + 1,
        status: status,
        name: this.getStepInfo(i).name,
        baselineImage: this.getStepInfo(i).apiUrls.baselineImage,
        currentImage: this.getStepInfo(i).apiUrls.currentImage,
        diffImage: this.getStepInfo(i).apiUrls.diffImage
      }
      stepResults.push(stepInfo);
    }
    return stepResults;
  }

  directoryCreator(path) {
    var dirStructure = [this.testName,this.appName,this.viewportSize,
      this.hostOS,this.hostApp,this.batchId,this.sessionId];

    var currentDir = process.cwd();
    process.chdir(path);
    dirStructure.forEach(function(dir) {
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      process.chdir(dir);
    });
    process.chdir(currentDir);

    return (path +"/"+ dirStructure.toString().replace(/,/g, '/'));
  }

  validateType(type) {
    var validTypes = ["baseline", "current", "diff"];
    if (validTypes.includes(type)) {
    } else {
      console.log("Must set a valid type! types: " + validTypes)
      process.exit(-1);
    }
  }

  getImageUrls(type) {
    var images = this.getStepResults().map(function(obj) {
      var fileName = obj.step +"-"+ obj.name + "-" + type + ".png"
      var imagesArray = {
        baseline: [fileName, obj.baselineImage],
        current: [fileName, obj.currentImage],
        diff: [fileName, obj.diffImage]
      }
      return imagesArray
    });

    this.validateType(type);
    var imageUrls = images.map(function(obj) {
      if (obj[type][1] != undefined) {
        return obj[type]
      }
    }).filter(function(n){ return n != undefined });

    if (imageUrls.length == 0) {
      console.log("No " + type + " images were found. Exiting...")
      process.exit(-1);
    }
    return imageUrls;
  }

  downloadImage(fileName, url) {
    var file = fs.createWriteStream(fileName);
    var request = https.get(url, function(response) {
      response.pipe(file);
    });
  }
}

exports.ApplitoolsTestResultHandler = ApplitoolsTestResultHandler;
